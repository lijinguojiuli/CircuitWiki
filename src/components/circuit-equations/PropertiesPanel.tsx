import { useState } from "react";
import { RotateCw, Trash2 } from "lucide-react";
import { componentDefinitions } from "@/lib/circuit-equations/model";
import type {
  CircuitDocument,
  EditorSelection,
  PlacedComponent,
  CircuitNetlist,
} from "@/lib/circuit-equations/types";
import styles from "./workspace.module.css";
function ParameterForm({
  component,
  onApply,
}: {
  component: PlacedComponent;
  onApply: (c: PlacedComponent) => void;
}) {
  const initialScale =
    component.type === "resistor" && Math.abs(component.value) >= 1000
      ? 1000
      : component.type === "current-source" && Math.abs(component.value) < 1
        ? Math.abs(component.value) < 0.001
          ? 1e-6
          : 0.001
        : 1;
  const [name, setName] = useState(component.name),
    [value, setValue] = useState(String(component.value / initialScale)),
    [scale, setScale] = useState(initialScale),
    [error, setError] = useState("");
  const options =
    component.type === "resistor"
      ? [
          [1, "Ω"],
          [1000, "kΩ"],
          [1e6, "MΩ"],
        ]
      : component.type === "voltage-source"
        ? [
            [1, "V"],
            [0.001, "mV"],
          ]
        : [
            [1, "A"],
            [0.001, "mA"],
            [1e-6, "μA"],
          ];
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const n = Number(value) * scale;
        if (
          !value.trim() ||
          !Number.isFinite(n) ||
          (component.type === "resistor" && n <= 0)
        ) {
          setError("请输入有限数值；电阻须大于0。");
          return;
        }
        onApply({ ...component, name: name.trim() || component.id, value: n });
        setError("");
      }}
    >
      <label>
        名称
        <input
          aria-label="元件名称"
          value={name}
          maxLength={64}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label>
        参数
        <div className={styles.valueInput}>
          <input
            aria-label="元件参数"
            type="number"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <select
            aria-label="参数单位"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
          >
            {options.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </label>
      {error && (
        <p role="alert" className={styles.errorText}>
          {error}
        </p>
      )}
      <button className={styles.primary} type="submit">
        应用参数
      </button>
    </form>
  );
}
export function PropertiesPanel({
  document: doc,
  netlist,
  selection,
  onSelect,
  onApply,
  onRotate,
  onFlip,
  onDelete,
}: {
  document: CircuitDocument;
  netlist: CircuitNetlist;
  selection: EditorSelection;
  onSelect: (s: EditorSelection) => void;
  onApply: (c: PlacedComponent) => void;
  onRotate: () => void;
  onFlip: () => void;
  onDelete: () => void;
}) {
  const c =
    selection?.kind === "component"
      ? doc.components.find((c) => c.id === selection.id)
      : undefined;
  const electrical = netlist.components.find((n) => n.id === c?.id);
  return (
    <aside className={styles.properties} aria-label="元件属性">
      <h2>属性</h2>
      <label>
        选择元件
        <select
          aria-label="选择元件属性"
          value={c?.id ?? ""}
          onChange={(e) =>
            onSelect(
              e.target.value ? { kind: "component", id: e.target.value } : null,
            )
          }
        >
          <option value="">请选择</option>
          {doc.components.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id} · {c.name}
            </option>
          ))}
        </select>
      </label>
      {c ? (
        <>
          <div className={styles.selectedTitle}>
            <strong>{c.id}</strong>
            <span>{componentDefinitions[c.type].label}</span>
          </div>
          <ParameterForm
            key={`${c.id}:${c.value}:${c.name}`}
            component={c}
            onApply={onApply}
          />
          <dl>
            <div>
              <dt>端子1{c.type === "voltage-source" ? "（+）" : ""}</dt>
              <dd>{electrical?.nodes[0]}</dd>
            </div>
            <div>
              <dt>端子2{c.type === "voltage-source" ? "（−）" : ""}</dt>
              <dd>{electrical?.nodes[1]}</dd>
            </div>
            <div>
              <dt>图形旋转</dt>
              <dd>{c.rotation}°</dd>
            </div>
          </dl>
          <p className={styles.muted}>
            {componentDefinitions[c.type].convention}。负值表示与参考相反。
          </p>
          <button type="button" onClick={onRotate}>
            <RotateCw size={15} />
            旋转90°
          </button>
          <button type="button" onClick={onFlip}>
            {c.type === "voltage-source"
              ? "反转极性"
              : c.type === "current-source"
                ? "反转电流源方向"
                : "反转电流参考"}
          </button>
          <button type="button" onClick={onDelete}>
            <Trash2 size={15} />
            删除元件
          </button>
        </>
      ) : selection ? (
        <div className={styles.emptyProperty}>
          <strong>{selection.id}</strong>
          <p>
            {selection.kind === "wire"
              ? "导线两端与途经连接点属于同一节点。"
              : "所有接地标记共享0 V参考。"}
          </p>
          <button type="button" onClick={onDelete}>
            <Trash2 size={15} />
            删除{selection.kind === "wire" ? "导线" : "接地"}
          </button>
        </div>
      ) : (
        <p className={styles.emptyProperty}>
          选择一个元件，可修改名称、参数和方向。点击导线或接地标记也可删除。
        </p>
      )}
    </aside>
  );
}
