import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./skins.css";
import { DesktopChrome } from "@/components/chrome/DesktopChrome";
import { Win98Chrome } from "@/components/chrome/Win98Chrome";
import { currentUser } from "@/lib/session";
import { currentSkin } from "@/lib/skin";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inception-of-Things",
  description: "Kubernetes with K3s, K3d and Argo CD: a 42 school project built inside a virtual machine",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "IoT cards" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [user, skin] = await Promise.all([currentUser(), currentSkin()]);
  const Chrome = skin === "win98" ? Win98Chrome : DesktopChrome;
  return (
    <html lang="en" data-skin={skin} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Chrome user={user}>{children}</Chrome>
      </body>
    </html>
  );
}
