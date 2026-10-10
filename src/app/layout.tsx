import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import "./platform.css";
import Link from "next/link";
import { Providers } from "@/components/providers";
import { Header } from "@/components/navigation";
export const metadata: Metadata = {
  title: {
    default: "CircuitWiki · 交互式电路知识库",
    template: "%s | CircuitWiki",
  },
  description:
    "面向电气、电子与自动化专业学生的系统化电路学习平台。知识总结、公式速查、交互计算与波形演示。",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <Providers>
          <a className="skip-link" href="#main">
            跳至正文
          </a>
          <Header />
          {children}
          <footer>
            <span>CircuitWiki</span>
            <p>理解原理 · 建立直觉 · 连接知识</p>
            <nav aria-label="页脚导航">
              <Link href="/curriculum">学习路线</Link>
              <Link href="/formulas">公式速查</Link>
              <Link href="/tools">电路工具</Link>
            </nav>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
