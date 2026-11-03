import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { signUp } from "../actions";
import { AuthForm } from "../AuthForm";

export const metadata: Metadata = { title: "Create account" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getUser()) redirect("/dashboard");
  const { next } = await searchParams;
  return (
    <div className="py-10">
      <AuthForm mode="signup" action={signUp} next={next} />
    </div>
  );
}
