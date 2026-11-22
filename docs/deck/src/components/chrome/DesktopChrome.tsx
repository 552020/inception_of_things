"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Glyph } from "./Glyph";
import { Logo } from "./Logo";
import { SkinSwitch } from "./SkinSwitch";
import { REPO, deskNav, windowTitle } from "./nav";

// A soft desktop: a menu bar on top, icons down both sides, the page as a window.
export function DesktopChrome({ user, children }: { user: string | null; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="dk">
      <header className="dk-bar">
        <Link href="/" className="dk-brand">
          <Logo className="logo dk-logo" />
          Inception of Things
        </Link>
        <nav className="dk-bar-nav" aria-label="Desk">
          {user && deskNav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <span className="grow" />
        <SkinSwitch skin="desktop" />
        {user ? (
          <form method="post" action="/api/logout" className="dk-user">
            <span>{user}</span>
            <button type="submit">log out</button>
          </form>
        ) : (
          <Link href="/login" className="dk-login">Log in</Link>
        )}
      </header>

      {user && (
        <aside className="dk-icons dk-left" aria-label="Desk">
          {deskNav.map((item) => (
            <Link key={item.href} href={item.href} className="dk-icon">
              <Glyph name={item.glyph} />
              <span>{item.label}</span>
            </Link>
          ))}
        </aside>
      )}
      <aside className="dk-icons dk-right" aria-label="Site">
        <Link href="/" className="dk-icon">
          <Glyph name="home" />
          <span>Home</span>
        </Link>
        <a href={REPO} className="dk-icon">
          <Glyph name="repo" />
          <span>Code</span>
        </a>
        {!user && (
          <Link href="/login" className="dk-icon">
            <Glyph name="login" />
            <span>Log in</span>
          </Link>
        )}
      </aside>

      <main className="dk-window">
        <div className="dk-title">
          <span>{windowTitle(pathname)}</span>
          <span className="dk-ctl" aria-hidden="true">
            <i />
            <i />
          </span>
        </div>
        <div className="dk-body">{children}</div>
      </main>
    </div>
  );
}
