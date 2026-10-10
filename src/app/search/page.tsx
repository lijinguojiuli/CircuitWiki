import { pageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import { SearchWorkspace } from "@/components/search-workspace";
export const metadata = pageMetadata(
  "搜索知识",
  "按关键词、公式和知识分类搜索 CircuitWiki。",
  "/search",
  false,
);
export default function SearchPage() {
  return (
    <main id="main" className="page-container platform-page">
      <span className="platform-kicker">知识、公式与工具，一个入口</span>
      <h1>找到你正在思考的问题</h1>
      <Suspense
        fallback={
          <p className="search-loading" role="status">
            正在准备本地搜索索引…
          </p>
        }
      >
        <SearchWorkspace />
      </Suspense>
    </main>
  );
}
