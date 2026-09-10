/** @type {import('next').NextConfig} */
const nextConfig = {
  // CSS ikut build Next secara otomatis via app/globals.css.
  // Source map browser aktif agar debug CSS/JS lebih mudah saat lomba.
  productionBrowserSourceMaps: true,
  experimental: {
    // 2 foto @ 5 MB + field teks muat lewat, validasi ramah di lib/evidence.
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
