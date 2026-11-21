import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inception-of-Things cards",
  description: "Flashcards and glossary for the Inception-of-Things oral evaluation",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "IoT cards" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const nav = [
  { href: "/", label: "Review" },
  { href: "/cards", label: "Cards" },
  { href: "/glossary", label: "Glossary" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-line">
          <nav className="flex items-center gap-1 px-4 py-2">
            <span className="text-sm text-muted mr-auto">Inception-of-Things</span>
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-surface"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 px-4 py-4">{children}</main>
      </body>
    </html>
  );
}
