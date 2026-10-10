import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { learningPaths } from "@/lib/paths";
export const metadata = pageMetadata(
  "推荐学习路径",
  "为初学、方法复习和交流专题选择目标清晰的电路学习路径。",
  "/paths",
  true,
);
export default function PathsPage() {
  return (
    <main id="main" className="page-container platform-page">
      <div className="platform-kicker">选择适合你的起点</div>
      <h1>有目标地学习</h1>
      <p className="platform-lead">
        教材路线提供完整章节顺序。专题路径帮助你围绕一个目标组织学习，遇到卡点可回到前置知识。
      </p>
      <div className="path-grid">
        {learningPaths.map((path) => (
          <Link
            className="path-card"
            href={`/paths/${path.slug}`}
            key={path.slug}
          >
            <span className="platform-kicker">{path.audience}</span>
            <h2>{path.title}</h2>
            <p>{path.description}</p>
            <div>
              <span>{path.slugs.length} 篇学习页</span>
              <span>查看路径 →</span>
            </div>
          </Link>
        ))}
      </div>
      <Link className="tool-reading-link" href="/curriculum">
        查看完整教材学习路线 ↗
      </Link>
    </main>
  );
}
