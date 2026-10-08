import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
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
            <span>为每一个好奇的电路学习者而建</span>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
