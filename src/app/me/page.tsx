import { pageMetadata } from "@/lib/seo";
import { MyLearning } from "@/components/my-learning";
export const metadata = pageMetadata(
  "我的学习",
  "管理收藏、阅读历史和已学习知识，备份你的本地学习记录。",
  "/me",
  false,
);
export default function MyLearningPage() {
  return (
    <main id="main" className="page-container platform-page">
      <span className="platform-kicker">个人学习空间</span>
      <h1>每一次理解，都有迹可循</h1>
      <p className="platform-lead">
        收藏值得回顾的概念，找回阅读历史，记录你完成的学习。无需账号，数据保存在当前浏览器。
      </p>
      <MyLearning />
    </main>
  );
}
