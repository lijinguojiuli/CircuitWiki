import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import "./platform.css";
import "./design-system.css";
import Link from "next/link";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { Providers } from "@/components/providers";
import { Header } from "@/components/navigation";
export const metadata: Metadata = {
  ...pageMetadata(
    "CircuitWiki",
    "面向大学生、工程师与电子爱好者的电路学习与知识管理平台。连接概念、公式、图解、实验与个人学习记录。",
    "/",
  ),
  metadataBase: new URL(siteUrl),
  title: {
    default: "CircuitWiki · 交互式电路知识库",
    template: "%s | CircuitWiki",
  },
  description:
    "面向大学生、工程师与电子爱好者的电路学习与知识管理平台。连接概念、公式、图解、实验与个人学习记录。",
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
