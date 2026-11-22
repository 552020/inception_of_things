import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { currentUser } from "@/lib/session";

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

// Desk items: shown only when logged in, left of the public items.
const nav = [
  { href: "/review", label: "Review" },
  { href: "/cards", label: "Cards" },
  { href: "/glossary", label: "Glossary" },
  { href: "/progress", label: "Progress" },
  { href: "/desk", label: "Desk" },
  { href: "/lab", label: "Lab" },
];

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await currentUser();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-line">
          <nav className="flex items-center gap-1 px-4 py-2 overflow-x-auto whitespace-nowrap">
            {user && (
              <>
                {nav.map((item) => (
                  <Link key={item.href} href={item.href} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-surface">
                    {item.label}
                  </Link>
                ))}
                <span aria-hidden className="mx-2 h-5 border-l border-line" />
              </>
            )}
            <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-surface">
              Inception-of-Things
            </Link>
            <span className="ml-auto" />
            {user ? (
              <form method="post" action="/api/logout" className="ml-2 flex items-center gap-2">
                <span className="text-xs text-muted capitalize">{user}</span>
                <button type="submit" className="text-xs text-muted underline">
                  log out
                </button>
              </form>
            ) : (
              <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-surface">
                Log in
              </Link>
            )}
          </nav>
        </header>
        <main className="flex-1 px-4 py-4">{children}</main>
      </body>
    </html>
  );
}
