import type { Metadata } from "next";
import Link from "next/link";
import { CreditsList } from "@/components/rocks/CreditsList";

export const metadata: Metadata = { title: "Photo credits" };

export default function CreditsPage() {
  return (
    <div className="space-y-6">
      <nav className="text-sm text-zinc-500">
        <Link href="/rocks-and-minerals" className="hover:underline">
          Rocks and Minerals
        </Link>{" "}
        / <span className="text-zinc-800 dark:text-zinc-200">Photo credits</span>
      </nav>
      <CreditsList />
    </div>
  );
}
