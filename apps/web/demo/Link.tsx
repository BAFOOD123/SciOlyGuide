/** Demo stand-in for next/link: maps app routes to the demo's hash views. */
import type { AnchorHTMLAttributes } from "react";

export function toView(href: string): string {
  const [pathQ = ""] = href.split("#");
  const [path = "", qs = ""] = pathQ.split("?");
  if (path === "/" || path === "/dashboard") return "home";
  if (path.startsWith("/events/")) return `event-${path.slice(8)}`;
  if (path.startsWith("/anatomy-physiology")) {
    const rest = path.slice("/anatomy-physiology".length).split("/").filter(Boolean);
    if (rest[0] === "label" && rest[1]) return `anatomy-label-${rest[1]}`;
    return "anatomy";
  }
  if (path.startsWith("/rocks-and-minerals")) {
    const [, section, arg] = path.slice("/rocks-and-minerals".length).split("/");
    if (!section) return "rocks";
    if (section === "quiz" && arg) return `rocks-quiz-${arg}`;
    if (section === "photo-id") return `rocks-photo-${new URLSearchParams(qs).get("deck") ?? "all"}`;
    if (section === "flashcards") {
      const p = new URLSearchParams(qs);
      return `rocks-cards-${p.get("deck") ?? "all"}-${p.get("front") ?? "clues"}`;
    }
    return `rocks-${section}`;
  }
  const cb = path.replace(/^\/codebusters/, "");
  if (cb === "" || cb === "/") return "codebusters";
  if (cb === "/test") return "tests";
  const [, section, arg] = cb.split("/");
  if (section === "test" && arg) return `test-${arg}`;
  return arg ? `${section}-${arg}` : (section ?? "codebusters");
}

export default function Link({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={`#${toView(href)}`} {...rest} />;
}
