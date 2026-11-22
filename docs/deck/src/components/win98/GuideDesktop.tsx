"use client";
import { useState, type ReactNode } from "react";
import { TaskButtons, Win98Window, WindowsProvider, useWindows } from "./WindowManager";

type Item = { id: string; title: string };

function Taskbar({ items }: { items: Item[] }) {
  const { open, wins } = useWindows();
  const [menu, setMenu] = useState(false);
  return (
    <div className="guide-taskbar">
      {menu && (
        <ul className="w98-menu guide-start-menu" role="menu">
          {items.map((w) => (
            <li
              key={w.id}
              role="menuitem"
              className={wins[w.id]?.open ? "" : "is-closed"}
              onClick={() => {
                open(w.id);
                setMenu(false);
              }}
            >
              <span>{w.title}</span>
              <span>{wins[w.id]?.open ? "" : "closed"}</span>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="w98-btn w98-btn-small guide-start" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
        <b>Start</b>
      </button>
      <TaskButtons />
    </div>
  );
}

/** The desktop of the style guide: every section is a window that can be moved, minimized, maximized and closed;
 *  the Start menu opens any window again. */
export function GuideDesktop({ windows, children }: { windows: Item[]; children: ReactNode }) {
  const titles = Object.fromEntries(windows.map((w) => [w.id, w.title]));
  return (
    <WindowsProvider titles={titles}>
      <div className="w98-scope w98-desktop guide">
        {children}
        <Taskbar items={windows} />
      </div>
    </WindowsProvider>
  );
}

export function GuideWin({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Win98Window id={id} minTop={0}>
      <div className="w98-inner guide-inner">{children}</div>
    </Win98Window>
  );
}
