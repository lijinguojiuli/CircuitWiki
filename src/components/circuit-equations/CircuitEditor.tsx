"use client";
import {
  repositionComponent,
  setReferenceGround,
} from "@/lib/circuit-equations/routing";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Upload,
  Undo2,
  Redo2,
  Plus,
  Minus,
  FilePlus2,
} from "lucide-react";
import {
  starterCircuits,
  emptyCircuit,
} from "@/lib/circuit-equations/examples";
import {
  addComponent,
  cleanPath,
  equalPoint,
  nextId,
  parseDocument,
  wireContains,
} from "@/lib/circuit-equations/geometry";
import { serializeNetlist } from "@/lib/circuit-equations/model";
import { detectTopology } from "@/lib/circuit-equations/topology";
import {
  analyzeCircuit,
  type AnalysisMethod,
} from "@/lib/circuit-equations/solver";
import type {
  CircuitDocument,
  EditorSelection,
  EditorTool,
  Point,
} from "@/lib/circuit-equations/types";
import { CircuitCanvas } from "./CircuitCanvas";
import { ComponentLibrary } from "./ComponentLibrary";
import { PropertiesPanel } from "./PropertiesPanel";
import { TopologyPanel } from "./TopologyPanel";
import { EquationPanel } from "./EquationPanel";
import styles from "./workspace.module.css";

const STORAGE = "circuitwiki:equation-document:v1";
type History = {
  past: CircuitDocument[];
  present: CircuitDocument;
  future: CircuitDocument[];
};
export function CircuitEditor() {
  const [history, setHistory] = useState<History>({
    past: [],
    present: structuredClone(starterCircuits[0].document),
    future: [],
  });
  const [selection, setSelection] = useState<EditorSelection>(null),
    [tool, setTool] = useState<EditorTool>("select"),
    [wirePoints, setWirePoints] = useState<Point[]>([]),
    [zoom, setZoom] = useState(1),
    [method, setMethod] = useState<AnalysisMethod>("auto"),
    [mode, setMode] = useState<"quick" | "learning">("learning"),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [ready, setReady] = useState(false),
    [revision, setRevision] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null),
    doc = history.present;
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      try {
        const saved = localStorage.getItem(STORAGE);
        if (saved) {
          setHistory({
            past: [],
            present: parseDocument(JSON.parse(saved)),
            future: [],
          });
          setMessage("已恢复本机图纸。");
        }
      } catch {
        setMessage("无法读取本机草稿；可使用保存/导入图纸保留工作。");
      }
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);
  const topology = useMemo(() => detectTopology(doc), [doc]);
  const analysis = useMemo(
    () => analyzeCircuit(topology, method),
    [topology, method],
  );
  const save = (d: CircuitDocument) => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(d));
      setMessage("图纸已保存到本机。");
    } catch {
      setMessage("本机存储不可用，请使用“保存图纸”导出文件。");
    }
  };
  const resetSelection = () => {
    setSelection(null);
    setWirePoints([]);
    setTool("select");
  };
  const commit = (next: CircuitDocument) => {
    try {
      const checked = parseDocument(next);
      if (JSON.stringify(checked) === JSON.stringify(doc)) return;
      setHistory({
        past: [...history.past, doc].slice(-30),
        present: checked,
        future: [],
      });
      save(checked);
      setError("");
      setRevision((r) => r + 1);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const undo = () => {
    if (!history.past.length) return;
    const next = history.past.at(-1)!;
    setHistory({
      past: history.past.slice(0, -1),
      present: next,
      future: [doc, ...history.future].slice(0, 30),
    });
    save(next);
    resetSelection();
    setRevision((r) => r + 1);
    setError("");
  };
  const redo = () => {
    if (!history.future.length) return;
    const next = history.future[0];
    setHistory({
      past: [...history.past, doc].slice(-30),
      present: next,
      future: history.future.slice(1),
    });
    save(next);
    resetSelection();
    setRevision((r) => r + 1);
    setError("");
  };
  const changeTool = (t: EditorTool) => {
    setTool(t);
    setWirePoints([]);
    setError("");
  };
  const rotate = () => {
    if (selection?.kind !== "component") return;
    const c = doc.components.find((c) => c.id === selection.id);
    if (!c) return;
    try {
      commit(
        repositionComponent(
          doc,
          c.id,
          c.position,
          ((c.rotation + 90) % 360) as 0 | 90 | 180 | 270,
        ),
      );
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const remove = () => {
    if (!selection) return;
    commit({
      ...doc,
      components:
        selection.kind === "component"
          ? doc.components.filter((c) => c.id !== selection.id)
          : doc.components,
      wires:
        selection.kind === "wire"
          ? doc.wires.filter((w) => w.id !== selection.id)
          : doc.wires,
      grounds:
        selection.kind === "ground"
          ? doc.grounds.filter((g) => g.id !== selection.id)
          : doc.grounds,
    });
    setSelection(null);
    setWirePoints([]);
  };
  const place = (type: EditorTool, p: Point) => {
    try {
      if (type === "ground") {
        const next = setReferenceGround(doc, p);
        commit(next);
        setSelection({ kind: "ground", id: next.grounds[0].id });
        setMessage("参考地已设置在所选节点；原参考地已移动。");
      } else if (type === "junction") {
        if (!doc.wires.some((w) => wireContains(w.points, p))) {
          setError("连接点应放在导线上；两线交叉时用它明确连接。");
          return;
        }
        commit({
          ...doc,
          junctions: doc.junctions.some((j) => equalPoint(j, p))
            ? doc.junctions.filter((j) => !equalPoint(j, p))
            : [...doc.junctions, p],
        });
      } else if (
        type === "resistor" ||
        type === "voltage-source" ||
        type === "current-source"
      ) {
        const next = addComponent(doc, type, p);
        commit(next);
        setSelection({ kind: "component", id: next.components.at(-1)!.id });
      }
      if (type !== "junction") setTool("select");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const download = (data: string, name: string) => {
    const url = URL.createObjectURL(
      new Blob([data], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importFile = async (file: File) => {
    try {
      if (file.size > 1024 * 1024) throw new Error("图纸文件不能大于1 MB。");
      const imported = parseDocument(JSON.parse(await file.text()));
      commit(imported);
      resetSelection();
      setMessage("图纸已导入，可撤销本次导入。");
    } catch (e) {
      setError(`导入失败：${(e as Error).message}`);
    }
  };
  return (
    <div
      className={styles.workspace}
      onKeyDown={(e) => {
        if (
          (e.target as HTMLElement).closest(
            "input,select,textarea,[contenteditable=true]",
          )
        )
          return;
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
          return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
          e.preventDefault();
          redo();
          return;
        }
        if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          remove();
        }
        if (e.key.toLowerCase() === "r") {
          e.preventDefault();
          rotate();
        }
        if (e.key.toLowerCase() === "w") {
          e.preventDefault();
          changeTool("wire");
        }
        if (e.key === "Escape") {
          setWirePoints([]);
          setTool("select");
        }
        if (
          selection?.kind === "component" &&
          ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
        ) {
          e.preventDefault();
          const c = doc.components.find((c) => c.id === selection.id)!;
          const d: Point = [
            e.key === "ArrowLeft" ? -20 : e.key === "ArrowRight" ? 20 : 0,
            e.key === "ArrowUp" ? -20 : e.key === "ArrowDown" ? 20 : 0,
          ];
          try {
            commit(
              repositionComponent(doc, c.id, [
                c.position[0] + d[0],
                c.position[1] + d[1],
              ]),
            );
          } catch (e) {
            setError((e as Error).message);
          }
        }
      }}
    >
      <div className={styles.toolbar}>
        <button
          disabled={!ready}
          onClick={() => {
            commit(emptyCircuit());
            resetSelection();
          }}
        >
          <FilePlus2 size={16} />
          新建
        </button>
        <label className={styles.presetLabel}>
          载入示例
          <select
            aria-label="载入电路示例"
            value=""
            disabled={!ready}
            onChange={(e) => {
              const preset = starterCircuits.find(
                (p) => p.id === e.target.value,
              );
              if (preset) {
                commit(structuredClone(preset.document));
                resetSelection();
              }
            }}
          >
            <option value="">选择示例…</option>
            {starterCircuits.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.historyButtons}>
          <button
            aria-label="撤销"
            title="Ctrl/Cmd+Z"
            disabled={!history.past.length}
            onClick={undo}
          >
            <Undo2 size={16} />
          </button>
          <button
            aria-label="重做"
            disabled={!history.future.length}
            onClick={redo}
          >
            <Redo2 size={16} />
          </button>
        </div>
        <button
          onClick={() =>
            download(JSON.stringify(doc, null, 2), "circuitwiki-drawing.json")
          }
        >
          <Download size={16} />
          保存图纸
        </button>
        <button onClick={() => fileInput.current?.click()}>
          <Upload size={16} />
          导入图纸
        </button>
        <input
          ref={fileInput}
          aria-label="导入图纸文件"
          className={styles.fileInput}
          type="file"
          accept=".json,application/json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void importFile(file);
            e.target.value = "";
          }}
        />
        <button
          disabled={
            !topology.netlist.components.length || !!topology.errors.length
          }
          onClick={() =>
            download(
              serializeNetlist(topology.netlist),
              "circuitwiki-netlist.json",
            )
          }
        >
          导出网表
        </button>
      </div>
      <div className={styles.statusBar}>
        <span role="status">
          {message || "元件与连线更改后，自动更新拓扑和方程。"}
        </span>
        <span>
          {analysis.status === "solved"
            ? "● 求解完成"
            : doc.components.length
              ? "○ 检查连接"
              : "○ 空白画板"}
        </span>
      </div>
      {error && (
        <p className={styles.diagnostic} role="alert">
          {error}
        </p>
      )}
      <div className={styles.editorGrid}>
        <ComponentLibrary tool={tool} onTool={changeTool} />
        <div className={styles.canvasColumn}>
          <div className={styles.zoomBar}>
            <span>选中后 R 旋转 · Delete 删除</span>
            <button
              aria-label="缩小画板"
              disabled={zoom <= 0.75}
              onClick={() => setZoom((z) => z - 0.25)}
            >
              <Minus size={14} />
            </button>
            <button onClick={() => setZoom(1)}>
              {Math.round(zoom * 100)}%
            </button>
            <button
              aria-label="放大画板"
              disabled={zoom >= 2}
              onClick={() => setZoom((z) => z + 0.25)}
            >
              <Plus size={14} />
            </button>
          </div>
          <CircuitCanvas
            key={revision}
            document={doc}
            topology={topology}
            selection={selection}
            tool={tool}
            zoom={zoom}
            wirePoints={wirePoints}
            meshes={analysis.method === "mesh" ? analysis.meshes : []}
            onWirePoints={setWirePoints}
            onSelect={setSelection}
            onChange={commit}
            onPlace={place}
            onAddWire={(points) => {
              const clean = cleanPath(points);
              if (clean.length >= 2)
                commit({
                  ...doc,
                  wires: [
                    ...doc.wires,
                    {
                      id: nextId(
                        "W",
                        doc.wires.map((w) => w.id),
                      ),
                      points: clean,
                    },
                  ],
                });
            }}
            onCancel={() => {
              setWirePoints([]);
              setTool("select");
            }}
            onError={setError}
          />
        </div>
        <PropertiesPanel
          document={doc}
          netlist={topology.netlist}
          selection={selection}
          onSelect={setSelection}
          onApply={(c) =>
            commit({
              ...doc,
              components: doc.components.map((old) =>
                old.id === c.id ? c : old,
              ),
            })
          }
          onRotate={rotate}
          onFlip={() => {
            if (selection?.kind === "component")
              commit({
                ...doc,
                components: doc.components.map((c) =>
                  c.id === selection.id
                    ? {
                        ...c,
                        rotation: ((c.rotation + 180) % 360) as
                          0 | 90 | 180 | 270,
                      }
                    : c,
                ),
              });
          }}
          onDelete={remove}
        />
      </div>
      <div className={styles.analysisBar}>
        <label>
          分析方法
          <select
            aria-label="分析方法"
            value={method}
            onChange={(e) => {
              setMethod(e.target.value as AnalysisMethod);
              setRevision((r) => r + 1);
            }}
          >
            <option value="auto">自动选择</option>
            <option value="nodal">节点电压法</option>
            <option value="mesh">网孔电流法</option>
          </select>
        </label>
        <div className={styles.modeSwitch} role="group" aria-label="解答模式">
          <button
            aria-pressed={mode === "quick"}
            onClick={() => setMode("quick")}
          >
            快速答案
          </button>
          <button
            aria-pressed={mode === "learning"}
            onClick={() => setMode("learning")}
          >
            学习模式
          </button>
        </div>
        <a href="#equation-output">查看方程 ↓</a>
      </div>
      <div className={styles.outputGrid}>
        <TopologyPanel topology={topology} onSelect={setSelection} />
        <EquationPanel
          key={revision}
          document={doc}
          topology={topology}
          analysis={analysis}
          mode={mode}
          onSelect={setSelection}
        />
      </div>
    </div>
  );
}
