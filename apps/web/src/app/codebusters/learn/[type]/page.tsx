import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CIPHERS, cipherInfo, isCipherType } from "@sciolyguide/codebusters";
import { LearnContent } from "@/components/codebusters/LearnContent";

type Params = { params: Promise<{ type: string }> };

export function generateStaticParams() {
  return CIPHERS.map((c) => ({ type: c.type }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { type } = await params;
  return { title: isCipherType(type) ? `How to solve ${cipherInfo(type).name}` : "Learn" };
}

export default async function LearnPage({ params }: Params) {
  const { type } = await params;
  if (!isCipherType(type)) notFound();
  const info = cipherInfo(type);
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <nav className="text-sm text-zinc-500">
        <Link href="/codebusters" className="hover:underline">
          Codebusters
        </Link>{" "}
        / Learn / <span className="text-zinc-800 dark:text-zinc-200">{info.name}</span>
      </nav>
      <LearnContent type={type} practiceHref={`/codebusters/practice/${type}`} />
    </article>
  );
}
