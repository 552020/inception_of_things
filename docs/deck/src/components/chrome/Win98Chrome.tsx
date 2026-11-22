"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Glyph } from "./Glyph";
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

// A grey window on a teal desktop, a menu bar inside it, a taskbar with a Start button at the bottom.
export function Win98Chrome({ user, children }: { user: string | null; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const title = windowTitle(pathname);
  return (
    <div className="w98" onClick={() => open && setOpen(false)}>
      {user && (
        <aside className="w98-icons" aria-label="Desk">
          {deskNav.map((item) => (
            <Link key={item.href} href={item.href} className="w98-icon">
              <Glyph name={item.glyph} />
              <span>{item.label}</span>
            </Link>
          ))}
        </aside>
      )}

      <main className="w98-window">
        <div className="w98-title">
          <span>Inception-of-Things - {title}</span>
          <span className="w98-ctl" aria-hidden="true">
            <i>_</i>
            <i>□</i>
            <i>×</i>
          </span>
        </div>
        <nav className="w98-menu" aria-label="Menu">
          <Link href="/">Home</Link>
          {user && deskNav.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          <a href={REPO}>Code</a>
        </nav>
        <div className="w98-body">{children}</div>
      </main>

      {open && (
        <div className="w98-start-menu" role="menu">
          <Link href="/" role="menuitem">Home</Link>
          {user && deskNav.map((item) => (
            <Link key={item.href} href={item.href} role="menuitem">{item.label}</Link>
          ))}
          <a href={REPO} role="menuitem">Code</a>
          <hr />
          {user ? (
            <form method="post" action="/api/logout">
              <button type="submit" role="menuitem">Log out ({user})</button>
            </form>
          ) : (
            <Link href="/login" role="menuitem">Log in</Link>
          )}
        </div>
      )}
      <div className="w98-taskbar">
        <button type="button" className="w98-start" aria-expanded={open} onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}>
          <b>Start</b>
        </button>
        <span className="w98-task">{title}</span>
        <span className="grow" />
        <div className="w98-tray">
          <SkinSwitch skin="win98" />
          {user ? <span>{user}</span> : <Link href="/login">Log in</Link>}
          <Clock />
        </div>
      </div>
    </div>
  );
}
