"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function CategoryChart({ data }: { data: { category: string; count: number }[] }) {
  if (data.length === 0) return <p className="text-sm text-slate-500">Belum ada data terverifikasi.</p>;
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <XAxis dataKey="category" fontSize={11} tickLine={false} />
          <YAxis fontSize={11} tickLine={false} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" name="Aksi" fill="#0f172a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
