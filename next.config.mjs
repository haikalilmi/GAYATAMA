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
    // Allow multipart headers and text in addition to two 5 MiB photos.
    // Each individual file remains limited to 5 MiB in lib/evidence.
    serverActions: { bodySizeLimit: "11mb" },
  },
};

export default nextConfig;
