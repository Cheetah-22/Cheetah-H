import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hace que el iPhone reconozca el perfil Wi‑Fi al descargarlo.
  async headers() {
    return [
      {
        source: "/wifi.mobileconfig",
        headers: [
          { key: "Content-Type", value: "application/x-apple-aspen-config" },
          { key: "Content-Disposition", value: 'attachment; filename="Cheetah-WiFi.mobileconfig"' },
        ],
      },
    ];
  },
};

export default nextConfig;
