import Link from "next/link";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
type Variant = "primary" | "secondary" | "ghost";
const buttonClass = (variant: Variant, className = "") =>
  `cw-button cw-button-${variant} ${className}`;
export function Button({
  variant = "secondary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}
export function LinkButton({
  href,
  children,
  variant = "secondary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}
export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`cw-card ${className}`} {...props} />;
}
export function Tag({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "muted";
}) {
  return <span className={`cw-tag cw-tag-${tone}`}>{children}</span>;
}
export function CodeBlock({
  children,
  ...props
}: HTMLAttributes<HTMLPreElement>) {
  return (
    <div className="cw-code">
      <div className="cw-code-label">代码 / 表达式</div>
      <pre {...props}>{children}</pre>
    </div>
  );
}
