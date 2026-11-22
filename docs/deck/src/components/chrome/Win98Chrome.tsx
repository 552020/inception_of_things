"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LogoPixel } from "./Logo";
import { PixelIcon } from "./PixelIcon";
import { SkinSwitch } from "./SkinSwitch";
import { REPO, deskNav, windowTitle } from "./nav";

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 20000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return <span className="w98-clock">{now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</span>;
}

// Same places as the desktop skin: the bar on top (brand left, switch and account right), desk icons left,
// site icons right. The bar is a taskbar docked to the top, and the page is a grey window on a teal desktop.
export function Win98Chrome({ user, children }: { user: string | null; children: ReactNode }) {
  const pathname = usePathname();
  const title = windowTitle(pathname);
  return (
    <div className="w98">
      <header className="w98-bar">
        <Link href="/" className="w98-start">
          <LogoPixel className="logo w98-logo-start" />
          <b>Inception of Things</b>
        </Link>
        <nav className="w98-bar-nav" aria-label="Desk">
          {user && deskNav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <span className="grow" />
        <div className="w98-tray">
          <SkinSwitch skin="win98" />
          {user ? (
            <form method="post" action="/api/logout" className="w98-user">
              <span>{user}</span>
              <button type="submit">log out</button>
            </form>
          ) : (
            <Link href="/login">Log in</Link>
          )}
          <Clock />
        </div>
      </header>

      {user && (
        <aside className="w98-icons w98-left" aria-label="Desk">
          {deskNav.map((item) => (
            <Link key={item.href} href={item.href} className="w98-icon">
              <PixelIcon name={item.glyph} />
              <span>{item.label}</span>
            </Link>
          ))}
        </aside>
      )}
      <aside className="w98-icons w98-right" aria-label="Site">
        <Link href="/" className="w98-icon">
          <PixelIcon name="home" />
          <span>Home</span>
        </Link>
        <a href={REPO} className="w98-icon">
          <PixelIcon name="repo" />
          <span>Code</span>
        </a>
        {!user && (
          <Link href="/login" className="w98-icon">
            <PixelIcon name="login" />
            <span>Log in</span>
          </Link>
        )}
      </aside>

      <main className="w98-window">
        <div className="w98-title">
          <span>Inception of Things - {title}</span>
          <span className="w98-ctl" aria-hidden="true">
            <i>_</i>
            <i>□</i>
            <i>×</i>
          </span>
        </div>
        <div className="w98-body">{children}</div>
      </main>
    </div>
  );
}
