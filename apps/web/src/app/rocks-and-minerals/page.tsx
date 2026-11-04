import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getRmStats } from "@/lib/rocks";
import { RmHub } from "@/components/rocks/RmHub";

export const metadata: Metadata = { title: "Rocks and Minerals" };

export default async function RocksHubPage() {
  const user = await requireUser();
  return <RmHub stats={await getRmStats(user.id)} />;
}
