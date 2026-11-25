import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getUserStats } from "@/lib/codebusters";
import { getRmStats } from "@/lib/rocks";
import { getAnatomyStats } from "@/lib/anatomy-progress";
import { anatomyProgressLine } from "@/lib/anatomy-questions";
import { getMyEvents } from "@/lib/user-events";
import { getProteinDesign } from "@/lib/protein-store";
import { segments } from "@/lib/protein/analysis";
import { HomeView } from "@/components/home/HomeView";

export const metadata: Metadata = { title: "Home" };

export default async function Home() {
  const user = await requireUser();
  const [chosen, cb, rm, ap, pm] = await Promise.all([
    getMyEvents(user.id),
    getUserStats(user.id),
    getRmStats(user.id),
    getAnatomyStats(user.id),
    getProteinDesign(user.id),
  ]);
  const pmSegs = segments();
  const pmDone = pmSegs.filter((s) => pm.design.progress[`seg-${s.index}`]).length;
  const progress: Record<string, string> = {
    codebusters: cb.totalAttempts
      ? `${cb.totalSolved} puzzles solved · ${cb.streakDays}-day streak`
      : "11 cipher types, timed questions and mock tests.",
    "rocks-and-minerals": rm.answered
      ? `${rm.mastered}/92 specimens mastered · ${Math.round((rm.accuracy ?? 0) * 100)}% correct${rm.dueCards ? ` · ${rm.dueCards} cards due` : ""}`
      : "92 official specimens: ID drills, station tests and flashcards.",
    "anatomy-physiology": ap.answered
      ? anatomyProgressLine(ap)
      : "Respiratory, digestive and immune: topic practice, timed tests and labeling.",
    "protein-modeling": pm.updatedAt
      ? `Model Studio: ${pmDone}/${pmSegs.length} folding steps · ${pm.design.features.filter((f) => f.kind !== "backbone").length} features`
      : "3D Model Studio for the 3UBE pre-build: folding guide, interactions and legend.",
  };
  return <HomeView displayName={user.displayName} chosen={chosen} progress={progress} />;
}
