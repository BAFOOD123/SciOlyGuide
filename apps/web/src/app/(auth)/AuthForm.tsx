"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "./actions";

type Props = {
  mode: "signin" | "signup";
  action: (prev: AuthState, form: FormData) => Promise<AuthState>;
  next?: string;
};

export function AuthForm({ mode, action, next }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const signup = mode === "signup";
  return (
    <form action={formAction} className="card mx-auto w-full max-w-sm space-y-4 p-6">
      <div>
        <h1 className="text-xl font-bold">{signup ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {signup
            ? "Free. Just a username and password, no email needed. Your progress saves to your account."
            : "Sign in to pick up where you left off."}
        </p>
      </div>
      {next && <input type="hidden" name="next" value={next} />}
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Username</span>
        <input
          name="username"
          className="input"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          minLength={3}
          maxLength={24}
          defaultValue={state.fields?.username}
        />
      </label>
      {signup && (
        <label className="block space-y-1 text-sm">
          <span className="font-medium">
            Display name <span className="font-normal text-zinc-500">(optional)</span>
          </span>
          <input name="displayName" className="input" maxLength={40} defaultValue={state.fields?.displayName} />
        </label>
      )}
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Password</span>
        <input
          name="password"
          type="password"
          className="input"
          autoComplete={signup ? "new-password" : "current-password"}
          required
          minLength={signup ? 8 : 1}
        />
      </label>
      {signup && (
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Confirm password</span>
          <input name="confirm" type="password" className="input" autoComplete="new-password" required minLength={8} />
        </label>
      )}
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {state.error}
        </p>
      )}
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "One moment…" : signup ? "Create account" : "Sign in"}
      </button>
      <p className="text-center text-sm text-zinc-500">
        {signup ? "Already have an account? " : "New here? "}
        <Link className="font-medium text-brand-600 hover:underline" href={signup ? "/signin" : "/signup"}>
          {signup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
