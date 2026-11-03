import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { signOut } from "./(auth)/actions";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SciOlyGuide", template: "%s · SciOlyGuide" },
  description: "Free Science Olympiad study app for Division C. Unlimited Codebusters practice for every 2027 cipher.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 btn btn-primary">
          Skip to content
        </a>
        <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
            <Link href={user ? "/dashboard" : "/"} className="mr-2 flex items-center gap-2 font-bold tracking-tight">
              <span aria-hidden className="grid size-7 place-items-center rounded-lg bg-brand-600 font-mono text-sm text-white">
                S
              </span>
              <span className="hidden min-[400px]:inline">SciOlyGuide</span>
              <span className="chip hidden bg-brand-100 text-brand-800 sm:inline-flex dark:bg-brand-900/60 dark:text-brand-200">
                Div C · 2027
              </span>
            </Link>
            {user && (
              <nav className="flex items-center gap-1 text-sm">
                <Link href="/dashboard" className="btn btn-ghost hidden px-3 sm:inline-flex">
                  Dashboard
                </Link>
                <Link href="/codebusters" className="btn btn-ghost px-2 sm:px-3">
                  Codebusters
                </Link>
              </nav>
            )}
            <div className="ml-auto flex items-center gap-2 text-sm">
              {user ? (
                <>
                  <span className="hidden text-zinc-500 sm:inline">
                    Signed in as <span className="font-medium text-zinc-800 dark:text-zinc-200">{user.displayName}</span>
                  </span>
                  <form action={signOut}>
                    <button className="btn btn-secondary whitespace-nowrap px-3 py-1.5">Sign out</button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/signin" className="btn btn-ghost whitespace-nowrap px-3">
                    Sign in
                  </Link>
                  <Link href="/signup" className="btn btn-primary whitespace-nowrap px-3 py-1.5">
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>
        <main id="main" className="mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>
        <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-zinc-500">
          SciOlyGuide is a free, student-made study tool. Not affiliated with or endorsed by Science Olympiad, Inc.
          Official rules are at{" "}
          <a className="underline" href="https://www.soinc.org" target="_blank" rel="noreferrer">
            soinc.org
          </a>
          .
        </footer>
      </body>
    </html>
  );
}
