import type { Metadata } from "next";
import Link from "next/link";
import { ReferenceTables } from "@/components/rocks/ReferenceTables";

export const metadata: Metadata = { title: "Reference tables" };

export default function ReferencePage() {
  return (
    <div className="space-y-6">
      <nav className="text-sm text-zinc-500">
        <Link href="/rocks-and-minerals" className="hover:underline">
          Rocks and Minerals
        </Link>{" "}
        / <span className="text-zinc-800 dark:text-zinc-200">Reference</span>
      </nav>
      <h1 className="text-3xl font-bold tracking-tight">Reference tables</h1>
      <ReferenceTables />
    </div>
  );
}
