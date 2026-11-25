"use client";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";

// A small window manager for the 98 style: windows can be dragged by the title bar, minimized to a task button on the
// taskbar, maximized (also by double-clicking the title bar), closed, and brought to the front.

type Win = { open: boolean; minimized: boolean; maximized: boolean; z: number };
type Ctx = {
  titles: Record<string, string>;
  wins: Record<string, Win>;
  activeId: string | null;
  focus: (id: string) => void;
  open: (id: string) => void;
  close: (id: string) => void;
  minimize: (id: string) => void;
  toggleMax: (id: string) => void;
  toggleTask: (id: string) => void;
};

const WindowsContext = createContext<Ctx | null>(null);

export function useWindows(): Ctx {
  const ctx = useContext(WindowsContext);
  if (!ctx) throw new Error("useWindows needs a WindowsProvider");
  return ctx;
}

export function WindowsProvider({ titles, children }: { titles: Record<string, string>; children: ReactNode }) {
  const ids = Object.keys(titles);
  const [wins, setWins] = useState<Record<string, Win>>(() =>
    Object.fromEntries(ids.map((id, i) => [id, { open: true, minimized: false, maximized: false, z: i + 1 }])),
  );
  const [top, setTop] = useState(ids.length + 1);

  const patch = useCallback((id: string, change: Partial<Win>, raise = false) => {
    setWins((w) => ({ ...w, [id]: { ...(w[id] ?? { open: true, minimized: false, maximized: false, z: 1 }), ...change } }));
    if (raise) setTop((t) => t + 1);
  }, []);
  const raiseZ = top;

  const value = useMemo<Ctx>(() => {
    const visible = Object.entries(wins).filter(([, w]) => w.open && !w.minimized);
    const activeId = visible.length ? visible.sort((a, b) => b[1].z - a[1].z)[0][0] : null;
    return {
      titles,
      wins,
      activeId,
      focus: (id) => patch(id, { z: raiseZ }, true),
      open: (id) => patch(id, { open: true, minimized: false, z: raiseZ }, true),
      close: (id) => patch(id, { open: false, minimized: false }),
      minimize: (id) => patch(id, { minimized: true }),
      toggleMax: (id) => patch(id, { maximized: !wins[id]?.maximized, z: raiseZ }, true),
      toggleTask: (id) => {
        const w = wins[id];
        if (!w) return;
        if (w.minimized || activeId !== id) patch(id, { open: true, minimized: false, z: raiseZ }, true);
        else patch(id, { minimized: true });
      },
    };
  }, [wins, titles, patch, raiseZ]);

  return <WindowsContext.Provider value={value}>{children}</WindowsContext.Provider>;
}

/** Task buttons for every window that is open; the active one looks pressed. */
export function TaskButtons({ className = "w98-task" }: { className?: string }) {
  const { titles, wins, activeId, toggleTask } = useWindows();
  return (
    <>
      {Object.keys(titles)
        .filter((id) => wins[id]?.open)
        .map((id) => (
          <button key={id} type="button" className={`${className}${activeId === id ? " is-active" : ""}`} onClick={() => toggleTask(id)}>
            {titles[id]}
          </button>
        ))}
    </>
  );
}

type WindowProps = {
  id: string;
  children: ReactNode;
  className?: string;
  clientClassName?: string;
  /** viewport pixels kept free at the top while dragging (the taskbar) */
  minTop?: number;
  statusBar?: ReactNode;
  iconBefore?: ReactNode;
};

export function Win98Window({ id, children, className = "", clientClassName = "", minTop = 34, statusBar, iconBefore }: WindowProps) {
  const { titles, wins, activeId, focus, close, minimize, toggleMax } = useWindows();
  const win = wins[id] ?? { open: true, minimized: false, maximized: false, z: 1 };
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const el = useRef<HTMLElement>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number; rect: DOMRect } | null>(null);
  const visible = win.open && !win.minimized;
  const active = activeId === id;

  function down(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    focus(id);
    if (win.maximized || (e.target as HTMLElement).closest("button")) return;
    const node = el.current;
    if (!node) return;
    drag.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y, rect: node.getBoundingClientRect() };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    let dx = e.clientX - d.px;
    let dy = e.clientY - d.py;
    dx = Math.min(Math.max(dx, 60 - d.rect.right), window.innerWidth - 60 - d.rect.left);
    dy = Math.min(Math.max(dy, minTop - d.rect.top), window.innerHeight - 24 - d.rect.top);
    setPos({ x: d.x + dx, y: d.y + dy });
  }
  function up() {
    drag.current = null;
  }

  const style: CSSProperties = {
    zIndex: win.z + 10,
    ...(win.maximized ? {} : { left: pos.x, top: pos.y }),
    ...(visible ? {} : { display: "none" }),
  };
  const maxClass = win.maximized ? " is-max" : "";

  return (
    <section ref={el} className={`w98-window ${className}${maxClass}`} style={style} onPointerDown={() => !active && focus(id)}>
      <div
        className={`w98-titlebar${active ? "" : " is-inactive"}`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onDoubleClick={(e) => {
          if (!(e.target as HTMLElement).closest("button")) toggleMax(id);
        }}
      >
        <span className="w98-titlebar-text">
          {iconBefore}
          {titles[id]}
        </span>
        <span className="w98-titlebar-controls">
          <button type="button" className="w98-tbtn w98-tbtn-min" aria-label="Minimize" onClick={() => minimize(id)} />
          <button type="button" className={`w98-tbtn ${win.maximized ? "w98-tbtn-restore" : "w98-tbtn-max"}`} aria-label={win.maximized ? "Restore" : "Maximize"} onClick={() => toggleMax(id)} />
          <button type="button" className="w98-tbtn w98-tbtn-close" aria-label="Close" onClick={() => close(id)} />
        </span>
      </div>
      <div className={`w98-client ${clientClassName}`}>{children}</div>
      {statusBar}
    </section>
  );
}
