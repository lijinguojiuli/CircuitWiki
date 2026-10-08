"use client";
import { useState } from "react";
import { ParallelBranchDiagram } from "./parallel-branch-diagram";
import { Formula } from "./formula";
import {
  branchNames,
  legComponents,
  loopChoices,
  type BranchView,
} from "@/lib/topology-example";
export function MultiLoopLab() {
  const [view, setView] = useState<BranchView>("elements");
  const [chosen, setChosen] =
    useState<(typeof loopChoices)[number]["id"]>("12");
  const loop = loopChoices.find((item) => item.id === chosen)!;
  const branches = [
    ...branchNames(loop.first, view),
    ...branchNames(loop.second, view),
  ];
  const nodes = view === "elements" ? 3 : 2,
    edges = view === "elements" ? 5 : 4;
  return (
    <section className="multi-loop-lab" aria-label="支路计数与多回路演示">
      <h3>同一个电路，先选建图方式，再数支路</h3>
      <p>
        图中只有四个电阻和一个电压源。上方整条理想导线属于结点
        A，下方整条理想导线属于结点 B；左侧 R₁ 与电源之间还有内部连接点 C。
      </p>
      <div className="segmented">
        <button
          aria-pressed={view === "elements"}
          onClick={() => setView("elements")}
        >
          每个元件一条支路
        </button>
        <button
          aria-pressed={view === "series"}
          onClick={() => setView("series")}
        >
          左侧串联组合成一条支路
        </button>
      </div>
      <div className="topology-counts" aria-live="polite">
        <span>
          建图支路 <strong>b = {edges}</strong>
        </span>
        <span>
          建图结点 <strong>n = {nodes}</strong>
        </span>
        <span>
          独立回路 <strong>b − n + 1 = 3</strong>
        </span>
      </div>
      <ParallelBranchDiagram
        view={view}
        first={loop.first}
        second={loop.second}
      />
      <div className="branch-view-explanation">
        {view === "elements" ? (
          <p>
            <strong>按元件划分：</strong>e1 是 R₁ 所在的 A→C 支路；e2
            是电压源所在的 C→B 支路；e3、e4、e5 分别为 R₂、R₃、R₄ 的 A→B
            支路。因此 b=5，结点 A、B、C 共 n=3。
          </p>
        ) : (
          <p>
            <strong>按串联组合划分：</strong>b1 将 R₁ 和电压源合并为 A→B
            的一条组合支路；C
            没有其他分支引出，不再单独保留为建图结点。b2、b3、b4 分别为
            R₂、R₃、R₄，因此 b=4，n=2。物理电路和独立回路数没有改变。
          </p>
        )}
      </div>
      <h3>选择回路，看它经过哪些支路</h3>
      <div className="loop-choices">
        {loopChoices.map((item) => (
          <button
            key={item.id}
            aria-pressed={chosen === item.id}
            onClick={() => setChosen(item.id)}
          >
            {item.title}
          </button>
        ))}
      </div>
      <div className="loop-detail" aria-live="polite">
        <strong>{loop.title}</strong>
        <p>
          组成：{branches.join(" → ")}。具体元件：{legComponents[loop.first]}
          ，以及{legComponents[loop.second]}。
        </p>
        <p>
          {loop.mesh
            ? "两条选中分支相邻，围出的区域内没有其他支路，所以它既是回路，也是网孔。"
            : "两条选中分支之间仍有其他支路，所以它是回路，但不是网孔。"}
        </p>
      </div>
      <h3>6 条回路，只有 3 条独立</h3>
      <p>
        任取两列分支形成一条简单回路，共有 L₁₂、L₁₃、L₁₄、L₂₃、L₂₄、L₃₄
        六条；反向绕行仍算同一条回路。选择三个相邻网孔即可建立一组独立 KVL
        方程。
      </p>
      <Formula
        latex={"(5-3+1)=(4-2+1)=3"}
        description="连通图的独立回路数；支路数 b 和结点数 n 必须取自同一种建图方式。"
      />
      <p>若把每列从 A 到 B 的总电压记为 u₁、u₂、u₃、u₄，则：</p>
      <Formula
        latex={"(u_1-u_2)+(u_2-u_3)+(u_3-u_4)=u_1-u_4"}
        description="三个相邻网孔方程相加，就得到最外侧回路方程，因此外侧方程不是新增的独立方程。"
      />
      <p>
        <strong>支路与回路不是一回事：</strong>R₂ 所在分支是一条支路；沿 R₂
        下行，再经另一分支上行，才形成回路。不能把一个“窗口”叫作一条支路。
      </p>
    </section>
  );
}
