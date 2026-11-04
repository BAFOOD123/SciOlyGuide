/** Demo stand-in for next/link: maps app routes to the demo's hash views. */
import type { AnchorHTMLAttributes } from "react";

export function toView(href: string): string {
  const path = href.replace(/^\/codebusters/, "");
  if (path === "" || path === "/") return "codebusters";
  if (path === "/test") return "tests";
  const [, section, arg] = path.split("/");
  if (section === "test" && arg) return `test-${arg}`;
  return arg ? `${section}-${arg}` : (section ?? "codebusters");
}

export default function Link({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={`#${toView(href)}`} {...rest} />;
}
