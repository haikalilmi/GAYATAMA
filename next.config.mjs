/** @type {import('next').NextConfig} */
const nextConfig = {
  // CSS ikut build Next secara otomatis via app/globals.css.
  // Source map browser aktif agar debug CSS/JS lebih mudah saat lomba.
  productionBrowserSourceMaps: true,
  // Next 16 memblokir aset dev (/_next/*, HMR) dari origin selain localhost.
  // Tanpa ini, membuka dev server dari HP lewat IP LAN membuat JS tak termuat
  // sehingga tombol navigasi dan toggle tema tidak merespons.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"],
  experimental: {
    // 2 foto @ 5 MB + field teks muat lewat, validasi ramah di lib/evidence.
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
