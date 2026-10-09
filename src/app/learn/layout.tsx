import { DesktopSidebar } from "@/components/sidebar-panel";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="docs-layout">
      <DesktopSidebar />
      {children}
    </div>
  );
}
