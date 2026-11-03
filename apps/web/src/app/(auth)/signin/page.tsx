import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { signIn } from "../actions";
import { AuthForm } from "../AuthForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getUser()) redirect("/dashboard");
  const { next } = await searchParams;
  return (
    <div className="py-10">
      <AuthForm mode="signin" action={signIn} next={next} />
    </div>
  );
}
