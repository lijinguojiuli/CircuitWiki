import { useRef, useState } from "react";
import { componentTerminals } from "@/lib/circuit-equations/model";
import {
  cleanPath,
  equalPoint,
  orthogonal,
  repositionComponent,
  snap,
} from "@/lib/circuit-equations/geometry";
import type {
  CircuitDocument,
  EditorSelection,
  EditorTool,
  Point,
} from "@/lib/circuit-equations/types";
import type { Mesh, Topology } from "@/lib/circuit-equations/topology";
import { CircuitDrawing } from "./CircuitDrawing";
import styles from "./workspace.module.css";

type Props = {
  document: CircuitDocument;
  topology: Topology;
  tool: EditorTool;
  selection: EditorSelection;
  zoom: number;
  wirePoints: Point[];
  meshes: Mesh[];
  onWirePoints: (p: Point[]) => void;
  onSelect: (s: EditorSelection) => void;
  onChange: (d: CircuitDocument) => void;
  onPlace: (tool: EditorTool, p: Point) => void;
  onAddWire: (p: Point[]) => void;
  onCancel: () => void;
  onError: (s: string) => void;
};
export function CircuitCanvas(props: Props) {
  const { document: doc, selection, tool, wirePoints, topology } = props;
  const [drag, setDrag] = useState<{
      id: string;
      start: Point;
      origin: Point;
      preview: CircuitDocument;
    } | null>(null),
    [hover, setHover] = useState<Point | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const toPoint = (x: number, y: number): Point => {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return [0, 0];
    const p = new DOMPoint(x, y).matrixTransform(matrix.inverse());
    return snap([p.x, p.y]);
  };
  const finish = (points: Point[]) => {
    const clean = cleanPath(points);
    if (clean.length >= 2) props.onAddWire(clean);
    props.onWirePoints([]);
  };
  const wire = (p: Point, end: boolean) => {
    if (!wirePoints.length) {
      props.onWirePoints([p]);
      return;
    }
    const next = cleanPath([
      ...wirePoints,
      ...orthogonal(wirePoints.at(-1)!, p).slice(1),
    ]);
    if (end && !equalPoint(wirePoints[0], p)) finish(next);
    else props.onWirePoints(next);
  };
  const preview = drag?.preview ?? doc;
  return (
    <section className={styles.canvasPanel} aria-label="交互电路画板">
      <div className={styles.canvasHeading}>
        <strong>{doc.title}</strong>
        <span>
          {drag
            ? "拖动中，松开后更新方程"
            : wirePoints.length
              ? "点击端子或导线完成；Enter结束，Esc取消"
              : tool === "select"
                ? "拖动元件 · 点击端子连线"
                : tool === "wire"
                  ? "依次点击起点、拐点和终点"
                  : tool === "junction"
                    ? "点击交叉位置添加/取消连接点"
                    : "点击画板放置"}
        </span>
      </div>
      <div
        className={styles.canvasScroll}
        tabIndex={0}
        role="region"
        aria-label="可缩放滚动的电路画板"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setDrag(null);
            props.onCancel();
            e.stopPropagation();
          }
          if (e.key === "Enter" && wirePoints.length) {
            finish(wirePoints);
            e.preventDefault();
          }
        }}
      >
        <CircuitDrawing
          ref={svg}
          document={preview}
          topology={topology}
          selection={selection}
          zoom={props.zoom}
          meshes={props.meshes}
          onChoose={props.onSelect}
          onPin={(p) => wire(p, true)}
          wirePreview={
            wirePoints.length && hover
              ? cleanPath([
                  ...wirePoints,
                  ...orthogonal(wirePoints.at(-1)!, hover).slice(1),
                ])
              : wirePoints
          }
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            const target = e.target as Element,
              pin = target.closest("[data-pin-index]"),
              component = target
                .closest("[data-component-id]")
                ?.getAttribute("data-component-id"),
              wireId = target
                .closest("[data-wire-id]")
                ?.getAttribute("data-wire-id"),
              ground = target
                .closest("[data-ground-id]")
                ?.getAttribute("data-ground-id");
            let p = toPoint(e.clientX, e.clientY);
            if (pin && component) {
              const c = doc.components.find((c) => c.id === component)!;
              p =
                componentTerminals(c)[
                  Number(pin.getAttribute("data-pin-index"))
                ];
            }
            if (!["select", "wire"].includes(tool)) {
              e.preventDefault();
              props.onPlace(tool, p);
              return;
            }
            if (wirePoints.length || tool === "wire" || pin) {
              e.preventDefault();
              wire(p, !!pin || !!wireId || !!ground);
              return;
            }
            if (component) {
              e.preventDefault();
              props.onSelect({ kind: "component", id: component });
              const c = doc.components.find((c) => c.id === component)!;
              setDrag({
                id: component,
                start: p,
                origin: c.position,
                preview: doc,
              });
              e.currentTarget.setPointerCapture(e.pointerId);
            } else if (wireId) props.onSelect({ kind: "wire", id: wireId });
            else if (ground) props.onSelect({ kind: "ground", id: ground });
            else props.onSelect(null);
          }}
          onPointerMove={(e) => {
            const p = toPoint(e.clientX, e.clientY);
            setHover(p);
            if (drag) {
              const position: Point = [
                drag.origin[0] + p[0] - drag.start[0],
                drag.origin[1] + p[1] - drag.start[1],
              ];
              setDrag({
                ...drag,
                preview: repositionComponent(doc, drag.id, position),
              });
            }
          }}
          onPointerUp={(e) => {
            if (drag) {
              const moved = drag.preview.components.find(
                (c) => c.id === drag.id,
              )!;
              if (!equalPoint(moved.position, drag.origin)) {
                if (
                  doc.components.some(
                    (c) =>
                      c.id !== drag.id &&
                      Math.hypot(
                        c.position[0] - moved.position[0],
                        c.position[1] - moved.position[1],
                      ) < 60,
                  )
                )
                  props.onError("元件过于接近，已保留原位置。");
                else props.onChange(drag.preview);
              }
              setDrag(null);
              if (e.currentTarget.hasPointerCapture(e.pointerId))
                e.currentTarget.releasePointerCapture(e.pointerId);
            }
          }}
          onPointerCancel={() => setDrag(null)}
          onDoubleClick={() => {
            if (wirePoints.length) finish(wirePoints);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }}
          onDrop={(e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData(
              "application/x-circuit-component",
            ) as EditorTool;
            if (
              [
                "resistor",
                "voltage-source",
                "current-source",
                "ground",
              ].includes(type)
            )
              props.onPlace(type, toPoint(e.clientX, e.clientY));
          }}
        />
      </div>
      <div className={styles.canvasFoot}>
        <span>圆点连接，交叉无圆点不连接。悬空端子按开路处理。</span>
        <span>网格 20 · 可左右/上下滚动</span>
      </div>
    </section>
  );
}
