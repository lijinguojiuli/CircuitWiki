import { pageMetadata } from "@/lib/seo";
import {
  OhmCalculator,
  RCCalculator,
  PhasorCalculator,
} from "@/components/calculators";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { learningTools } from "@/lib/learning";
export const metadata = pageMetadata(
  "电路工具",
  "使用欧姆定律、RC响应和相量计算工具，调整参数并验证电路学习中的公式与规律。",
  "/tools",
  true,
);
export default function ToolsPage() {
  return (
    <main id="main" className="page-container tools-page platform-page">
      <div className="platform-kicker">动手验证你的理解</div>
      <h1>电路工具</h1>
      <p className="page-lead">
        选择要解决的问题，输入参数并观察结果。每个工具都配有公式和适用条件，可与知识专题一起使用。
      </p>
      <nav className="tool-intents" aria-label="选择计算工具">
        {learningTools.map((tool, index) => (
          <a href={`#${tool.id}`} key={tool.id}>
            <span>0{index + 1}</span>
            <h2>{tool.label}</h2>
            <p>{tool.description}</p>
            <ArrowRight size={17} />
          </a>
        ))}
      </nav>
      <OhmCalculator />
      <Link className="tool-reading-link" href="/learn/kcl-kvl">
        复习欧姆定律与功率的参考方向
        <ArrowUpRight size={15} />
      </Link>
      <RCCalculator />
      <Link className="tool-reading-link" href="/learn/rc-circuit">
        理解时间常数与一阶电路三要素
        <ArrowUpRight size={15} />
      </Link>
      <PhasorCalculator />
      <Link className="tool-reading-link" href="/learn/phasor">
        复习有效值相量与复数运算
        <ArrowUpRight size={15} />
      </Link>
    </main>
  );
}
