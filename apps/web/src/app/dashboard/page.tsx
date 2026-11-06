import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getUserStats } from "@/lib/codebusters";
import { getRmStats } from "@/lib/rocks";
import { getAnatomyStats } from "@/lib/anatomy-progress";
import { anatomyProgressLine } from "@/lib/anatomy-questions";
import { getMyEvents } from "@/lib/user-events";
import { HomeView } from "@/components/home/HomeView";

export const metadata: Metadata = { title: "Home" };

export default async function Home() {
  const user = await requireUser();
  const [chosen, cb, rm, ap] = await Promise.all([
    getMyEvents(user.id),
    getUserStats(user.id),
    getRmStats(user.id),
    getAnatomyStats(user.id),
  ]);
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
  };
  return <HomeView displayName={user.displayName} chosen={chosen} progress={progress} />;
}
