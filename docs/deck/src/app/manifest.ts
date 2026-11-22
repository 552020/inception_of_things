import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Inception-of-Things cards",
    short_name: "IoT cards",
    start_url: "/review",
    display: "standalone",
    background_color: "#f7f6f2",
    theme_color: "#f7f6f2",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
