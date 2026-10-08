import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="page-container">
      <div className="eyebrow">404 / OPEN CIRCUIT</div>
      <h1>这条线路还没有接通</h1>
      <p>页面不存在，请回到知识地图继续学习。</p>
      <Link className="button primary" href="/curriculum">
        返回知识地图 →
      </Link>
    </main>
  );
}
