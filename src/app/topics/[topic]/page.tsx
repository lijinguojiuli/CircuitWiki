import Link from "next/link";
import { notFound } from "next/navigation";
export function generateStaticParams() {
  return [{ topic: "analog" }, { topic: "digital" }];
}
export default async function Topic({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  if (!["analog", "digital"].includes(topic)) notFound();
  const analog = topic === "analog";
  return (
    <main id="main" className="page-container">
      <div className="eyebrow">课程规划</div>
      <h1>{analog ? "模拟电子" : "数字电路"}</h1>
      <p className="page-lead">
        本模块属于下一阶段内容。你现在可以先完成基础电路学习。
      </p>
      <div className="roadmap">
        {(analog
          ? ["半导体与二极管", "晶体管与偏置", "运算放大器", "反馈与滤波"]
          : ["数制与逻辑代数", "组合逻辑", "触发器", "时序电路"]
        ).map((title, i) => (
          <div key={title}>
            <span>0{i + 1}</span>
            <h2>{title}</h2>
            <small>规划中</small>
          </div>
        ))}
      </div>
      <Link className="button primary" href="/curriculum">
        学习电路基础 →
      </Link>
    </main>
  );
}
