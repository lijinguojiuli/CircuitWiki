import { MousePointer2, Waypoints, Dot } from "lucide-react";
import { componentDefinitions } from "@/lib/circuit-equations/model";
import type { EditorTool } from "@/lib/circuit-equations/types";
import styles from "./workspace.module.css";
export function ComponentLibrary({
  tool,
  onTool,
}: {
  tool: EditorTool;
  onTool: (tool: EditorTool) => void;
}) {
  return (
    <aside className={styles.library} aria-label="元件库与绘图工具">
      <h2>绘制电路</h2>
      <p>拖到画板，或点选后放置。</p>
      <div className={styles.libraryItems}>
        {Object.entries(componentDefinitions).map(([type, definition]) => (
          <button
            key={type}
            type="button"
            draggable
            aria-pressed={tool === type}
            onDragStart={(e) => {
              e.dataTransfer.setData("application/x-circuit-component", type);
              e.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => onTool(type as EditorTool)}
          >
            <span className={styles.symbolIcon}>{definition.symbol}</span>
            <span>
              {definition.label}
              <small>{definition.unit}</small>
            </span>
          </button>
        ))}
        <button
          type="button"
          draggable
          aria-pressed={tool === "ground"}
          onDragStart={(e) =>
            e.dataTransfer.setData("application/x-circuit-component", "ground")
          }
          onClick={() => onTool("ground")}
        >
          <span className={styles.symbolIcon}>⏚</span>
          <span>
            接地<small>参考电位 0 V</small>
          </span>
        </button>
      </div>
      <h3>操作工具</h3>
      <div className={styles.editTools}>
        <button
          type="button"
          aria-pressed={tool === "select"}
          onClick={() => onTool("select")}
        >
          <MousePointer2 size={16} />
          选择 / 移动
        </button>
        <button
          type="button"
          aria-pressed={tool === "wire"}
          onClick={() => onTool("wire")}
        >
          <Waypoints size={16} />
          连线 <kbd>W</kbd>
        </button>
        <button
          type="button"
          aria-pressed={tool === "junction"}
          onClick={() => onTool("junction")}
        >
          <Dot size={20} />
          连接点
        </button>
      </div>
      <details className={styles.help}>
        <summary>操作指南</summary>
        <ul>
          <li>点端子开始连线，点另一端子或导线完成。</li>
          <li>空白处可加拐点，Enter结束，Esc取消。</li>
          <li>选中元件后 R 旋转，方向键微调，Delete删除。</li>
          <li>Ctrl/Cmd+Z 撤销，Shift+Z重做。</li>
          <li>移动和旋转会延长已连接导线；必要时删除旧线重画。</li>
        </ul>
      </details>
    </aside>
  );
}
