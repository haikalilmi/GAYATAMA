import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Halaman tidak ketemu.</h2>
      <Link href="/" className="text-sm underline">
        Kembali ke beranda
      </Link>
    </div>
  );
}
