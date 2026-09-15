import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Page not found.</h2>
      <Link href="/" className="text-sm underline">
        Back to home
      </Link>
    </div>
  );
}
