import { pageMetadata } from "@/lib/seo";
import { KnowledgeGraph } from "@/components/knowledge-graph";
export const metadata = pageMetadata(
  "知识关系图",
  "以一个电路知识点为中心，探索前置知识、后续学习与相关概念。",
  "/graph",
  true,
);
export default function GraphPage() {
  return (
    <main id="main" className="page-container platform-page">
      <div className="platform-kicker">从一个概念，走向整个体系</div>
      <h1>知识关系图</h1>
      <p className="platform-lead">
        看见概念之间的依赖，用知识关系回答“哪里没懂，先补什么”。
      </p>
      <KnowledgeGraph />
    </main>
  );
}
