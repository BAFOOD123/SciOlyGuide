import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-zinc-600 dark:text-zinc-400">That page doesn&apos;t exist, or it isn&apos;t yours.</p>
      <Link href="/" className="btn btn-primary">
        Go home
      </Link>
    </div>
  );
}
