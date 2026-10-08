import {
  OhmCalculator,
  RCCalculator,
  PhasorCalculator,
} from "@/components/calculators";
export const metadata = { title: "电路工具" };
export default function ToolsPage() {
  return (
    <main id="main" className="page-container tools-page">
      <div className="eyebrow">电路工具</div>
      <h1>
        电路实验室<span className="heading-dot">.</span>
      </h1>
      <p className="page-lead">
        改变一个参数，观察一个结果。让抽象的原理变得具体。
      </p>
      <nav className="anchor-pills">
        <a href="#ohm">01 欧姆定律</a>
        <a href="#rc">02 RC 响应</a>
        <a href="#phasor">03 相量计算</a>
      </nav>
      <OhmCalculator />
      <RCCalculator />
      <PhasorCalculator />
    </main>
  );
}
