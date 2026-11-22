"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { TaskButtons, Win98Window, WindowsProvider, useWindows } from "@/components/win98/WindowManager";
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
  return <span>{now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</span>;
}

function Inner({ user, children }: { user: string | null; children: ReactNode }) {
  const { open } = useWindows();
  const reopen = () => open("site");
  return (
    <div className="w98">
      <header className="w98-bar">
        <Link href="/" className="w98-start" onClick={reopen}>
          <LogoPixel className="logo" />
          <b>Inception of Things</b>
        </Link>
        <TaskButtons />
        <nav className="w98-bar-nav" aria-label="Desk">
          {user && deskNav.map((item) => <Link key={item.href} href={item.href} onClick={reopen}>{item.label}</Link>)}
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
            <Link href="/login" onClick={reopen}>Log in</Link>
          )}
          <Clock />
        </div>
      </header>

      {user && (
        <aside className="w98-icons w98-left" aria-label="Desk">
          {deskNav.map((item) => (
            <Link key={item.href} href={item.href} className="w98-icon" onClick={reopen}>
              <PixelIcon name={item.glyph} />
              <span>{item.label}</span>
            </Link>
          ))}
        </aside>
      )}
      <aside className="w98-icons w98-right" aria-label="Site">
        <Link href="/" className="w98-icon" onClick={reopen}>
          <PixelIcon name="home" />
          <span>Home</span>
        </Link>
        <a href={REPO} className="w98-icon">
          <PixelIcon name="repo" />
          <span>Code</span>
        </a>
        {!user && (
          <Link href="/login" className="w98-icon" onClick={reopen}>
            <PixelIcon name="login" />
            <span>Log in</span>
          </Link>
        )}
      </aside>

      <Win98Window
        id="site"
        className="w98-site-window"
        clientClassName="w98-client-grey"
        statusBar={
          <div className="w98-statusbar">
            <span className="w98-status is-grow">Done</span>
            <span className="w98-status">{user ?? "guest"}</span>
          </div>
        }
      >
        <div className="w98-inner">{children}</div>
      </Win98Window>
    </div>
  );
}

// Same places as the desktop skin: the bar on top (brand left, switch and account right), desk icons left, site icons
// right. The page is an application window you can move, minimize to the taskbar, maximize and close; clicking an
// icon or the brand opens it again. See the style guide in the lab.
export function Win98Chrome({ user, children }: { user: string | null; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <WindowsProvider titles={{ site: `Inception of Things - ${windowTitle(pathname)}` }}>
      <Inner user={user}>{children}</Inner>
    </WindowsProvider>
  );
}
