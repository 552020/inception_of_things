import { PixelIcon } from "@/components/chrome/PixelIcon";
import { Logo, LogoPixel } from "@/components/chrome/Logo";
import { ListDemo, TabsDemo } from "@/components/win98/Demos";
import { GuideDesktop, GuideWin as Win } from "@/components/win98/GuideDesktop";

export const metadata = { title: "Windows 98 style guide" };

const WINDOWS = [{ id: "windows-98-style-guide", title: "Windows 98 style guide" }, { id: "colours", title: "Colours" }, { id: "typeface", title: "Typeface" }, { id: "edges", title: "Edges" }, { id: "windows", title: "Windows" }, { id: "buttons", title: "Buttons" }, { id: "fields-and-options", title: "Fields and options" }, { id: "tabs", title: "Tabs" }, { id: "menu", title: "Menu" }, { id: "tree-and-list", title: "Tree and list" }, { id: "message-box", title: "Message box" }, { id: "icons", title: "Icons" }, { id: "cursors", title: "Cursors" }, { id: "page-patterns", title: "Page patterns" }, { id: "credits-and-limits", title: "Credits and limits" }];

const colours: [string, string, string][] = [
  ["ButtonFace", "#c0c0c0", "window and button background"],
  ["ButtonHilight", "#ffffff", "light edge of a raised part"],
  ["ButtonLight", "#dfdfdf", "inner light edge"],
  ["ButtonShadow", "#808080", "inner shadow edge, disabled text"],
  ["ButtonDkShadow", "#0a0a0a", "outer shadow edge"],
  ["Window", "#ffffff", "fields and client areas"],
  ["Highlight", "#000080", "selection"],
  ["ActiveTitle", "#000080", "title bar, left end"],
  ["GradientActiveTitle", "#1084d0", "title bar, right end"],
  ["InactiveTitle", "#808080", "inactive title bar, left end"],
  ["GradientInactiveTitle", "#b5b5b5", "inactive title bar, right end"],
  ["Desktop", "#008080", "the desktop"],
  ["InfoWindow", "#ffffe1", "tooltip"],
  ["Link", "#0000ee", "link; visited #551a8b"],
];

const icons = ["review", "cards", "glossary", "progress", "desk", "lab", "home", "repo", "login", "error", "info", "warning"] as const;

const patterns: [string, string][] = [
  ["Public page", "an application window with the title in the title bar, a white client area, a status bar"],
  ["Document", "text in the white client area; code and quotes in a sunken field; links blue and underlined"],
  ["List of items", "list view with raised column headers; one row selected in navy"],
  ["Choices", "tabs for groups, group boxes for related options, check boxes and radio buttons, never switches"],
  ["Form", "a dialog window: labels, sunken fields, a default button with the double border, Cancel"],
  ["Error or notice", "a message box with its icon and one or two buttons"],
  ["Navigation", "the taskbar on top and desktop icons on both sides, the same in every page"],
  ["Account and settings", "the tray at the right end of the taskbar: switch, name, log out"],
];

export default function Windows98Guide() {
  return (
    <GuideDesktop windows={WINDOWS}>
      <Win id="windows-98-style-guide">
        <p>
          A recreation of the look of Windows 98 for web pages. This page is the reference: every part is shown here as it is built, and the site uses the same classes
          and variables. The style is a set of rules, not a theme; where a page needs something new, it is drawn with the same edges, colours and grid.
        </p>
        <ul className="guide-list">
          <li>Everything is flat grey with 1 pixel edges that make it look raised or sunken. No shadows, no blur, no radius.</li>
          <li>Colour is rare: navy for selection and title bars, white for what can be edited or read, teal for the desktop.</li>
          <li>Two typefaces: the pixel face WIN95FA at 16 px for everything that is a control, a title or a label, and Tahoma 13 px for running text, as a web page of the time would use its own font inside the window.</li>
          <li>Icons are 32 by 32 pixels in 16 colours with a light edge and a shadow edge. Never scaled smoothly.</li>
          <li>Controls look pressed when they are on or being clicked; the active choice is sunken, the others raised.</li>
          <li>Text on grey and white is black. Disabled text is grey with a white shadow.</li>
          <li>The cursor is the arrow, and the hand over anything that can be clicked.</li>
        </ul>
      </Win>

      <div className="guide-grid">
        <Win id="colours">
          <table className="guide-table">
            <tbody>
              {colours.map(([name, hex, use]) => (
                <tr key={name}>
                  <td>
                    <span className="swatch" style={{ background: hex }} />
                  </td>
                  <td>{name}</td>
                  <td>{hex}</td>
                  <td className="muted">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Win>

        <Win id="typeface">
          <p>Controls, titles and labels: WIN95FA, a free recreation of the bitmap font MS Sans Serif. It is drawn on a 16 pixel grid, so it is used at 16 px with 1 px between letters. Running text: Tahoma 13 px.</p>
          <p style={{ fontFamily: "var(--w98-font)", fontSize: 32, lineHeight: 1, letterSpacing: 2, margin: "10px 0" }}>Inception of Things</p>
          <p style={{ fontFamily: "var(--w98-font)", fontSize: 16, letterSpacing: 1 }}>The quick brown fox jumps over the lazy dog. 0123456789</p>
          <p>The quick brown fox jumps over the lazy dog. 0123456789 (running text, Tahoma)</p>
          <p style={{ fontFamily: "var(--w98-font)", fontSize: 16, letterSpacing: 1, fontWeight: 700 }}>Bold is the regular face thickened by the browser, as in title bars.</p>
        </Win>

        <Win id="edges">
          <p>Five treatments, all made of four 1 pixel lines in inset box shadows.</p>
          <div className="edges">
            <div style={{ boxShadow: "var(--w98-raised)" }}>raised</div>
            <div style={{ boxShadow: "var(--w98-pressed)" }}>pressed</div>
            <div style={{ boxShadow: "var(--w98-window-edge)" }}>window</div>
            <div style={{ boxShadow: "var(--w98-field)", background: "#fff" }}>field</div>
            <div style={{ boxShadow: "var(--w98-status)" }}>status</div>
          </div>
          <p className="muted">--w98-raised, --w98-pressed, --w98-window-edge, --w98-field, --w98-status</p>
        </Win>

        <Win id="windows">
          <p>Only the active window has a blue title bar; click another one to bring it forward. Drag a title bar to move the window, double-click it to maximize, use the three buttons to minimize, maximize or close. A minimized window stays on the taskbar; the Start menu opens any window again.</p>
        </Win>

        <Win id="buttons">
          <div className="row">
            <button className="w98-btn">OK</button>
            <button className="w98-btn is-default">Default</button>
            <button className="w98-btn is-pressed">Pressed</button>
            <button className="w98-btn" disabled>
              Disabled
            </button>
          </div>
          <div className="row">
            <button className="w98-toolbtn">Toolbar</button>
            <button className="w98-btn w98-btn-small">Small</button>
          </div>
          <p className="muted">75 by 23 pixels at least. The default button has the double black edge. Focus is a dotted rectangle inside.</p>
        </Win>

        <Win id="fields-and-options">
          <div className="form">
            <label>
              Name <input type="text" defaultValue="stefano" />
            </label>
            <label>
              Password <input type="password" defaultValue="secret" />
            </label>
            <label>
              Style{" "}
              <select defaultValue="98">
                <option>Desktop</option>
                <option>98</option>
              </select>
            </label>
            <textarea rows={3} defaultValue="A multi-line field." />
          </div>
          <fieldset className="w98-group">
            <legend>Options</legend>
            <div className="options">
              <label className="w98-option">
                <input className="w98-check" type="checkbox" defaultChecked /> Remember me
              </label>
              <label className="w98-option">
                <input className="w98-check" type="checkbox" /> Show hints
              </label>
              <label className="w98-option">
                <input className="w98-radio" type="radio" name="r" defaultChecked /> Cards
              </label>
              <label className="w98-option">
                <input className="w98-radio" type="radio" name="r" /> Glossary
              </label>
            </div>
          </fieldset>
          <div className="w98-progress" style={{ ["--value" as string]: "62%", marginTop: 10 }}>
            <span />
          </div>
        </Win>

        <Win id="tabs">
          <TabsDemo />
        </Win>

        <Win id="menu">
          <div className="w98-menubar">
            <span>
              <u>F</u>ile
            </span>
            <span aria-expanded="true">
              <u>E</u>dit
            </span>
            <span>
              <u>V</u>iew
            </span>
            <span>
              <u>H</u>elp
            </span>
          </div>
          <ul className="w98-menu" style={{ marginLeft: 36, marginTop: 2 }}>
            <li>
              <span>Undo</span>
              <span>Ctrl+Z</span>
            </li>
            <li className="is-disabled">
              <span>Redo</span>
              <span>Ctrl+Y</span>
            </li>
            <li className="is-separator" />
            <li>
              <span>Cut</span>
              <span>Ctrl+X</span>
            </li>
            <li>
              <span>Copy</span>
              <span>Ctrl+C</span>
            </li>
          </ul>
        </Win>

        <Win id="tree-and-list">
          <ul className="w98-tree">
            <li>
              Inception of Things
              <ul>
                <li>p1</li>
                <li>
                  p2
                  <ul>
                    <li className="">
                      <span className="is-selected">confs</span>
                    </li>
                  </ul>
                </li>
                <li>p3</li>
              </ul>
            </li>
          </ul>
          <div style={{ height: 10 }} />
          <ListDemo />
        </Win>

        <Win id="message-box">
          <div className="w98-dialog w98-window" style={{ display: "block" }}>
            <div className="w98-titlebar">
              <span className="w98-titlebar-text">Inception of Things</span>
              <span className="w98-titlebar-controls" aria-hidden="true">
                <span className="w98-tbtn w98-tbtn-close" />
              </span>
            </div>
            <div className="w98-dialog-body" style={{ background: "var(--w98-face)" }}>
              <PixelIcon name="warning" />
              <span>This page could not be found. Check the address and try again.</span>
            </div>
            <div className="w98-dialog-actions">
              <button className="w98-btn is-default">OK</button>
              <button className="w98-btn">Cancel</button>
            </div>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <span className="w98-tooltip">Tooltip: a pale yellow box, black frame</span>
          </div>
          <div className="w98-statusbar" style={{ marginTop: 10 }}>
            <span className="w98-status is-grow">Done</span>
            <span className="w98-status">138 cards</span>
          </div>
        </Win>

        <Win id="icons">
          <div className="icon-grid">
            {icons.map((n) => (
              <div key={n} className="icon-cell">
                <PixelIcon name={n} />
                <span>{n}</span>
              </div>
            ))}
          </div>
          <p className="muted">32 by 32 pixels, 16 colours, light edge top left, shadow bottom right, black outline. The mark of the site is drawn in the same way:</p>
          <div className="row">
            <LogoPixel className="logo" />
            <span style={{ width: 96, height: 96, display: "inline-block" }}>
              <Logo className="logo" />
            </span>
          </div>
        </Win>

        <Win id="cursors">
          <div className="cursor-box" style={{ cursor: "var(--w98-cursor-arrow)" }}>
            Arrow: the default
          </div>
          <div className="cursor-box" style={{ cursor: "var(--w98-cursor-hand)" }}>
            Hand: over anything that can be clicked
          </div>
          <p className="muted">Move the mouse over the boxes. Both cursors are drawn on a pixel grid.</p>
        </Win>

        <Win id="page-patterns">
          <table className="guide-table">
            <tbody>
              {patterns.map(([page, pattern]) => (
                <tr key={page}>
                  <td style={{ whiteSpace: "nowrap" }}>{page}</td>
                  <td>{pattern}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Win>

        <Win id="credits-and-limits">
          <ul className="guide-list">
            <li>Typeface WIN95FA by Alina Sava, SIL Open Font License, from the Fontsource package.</li>
            <li>Edge values and control sizes checked against the open recreation 98.css by Jordan Scales, MIT licence. The code here is written from scratch.</li>
            <li>This is an homage. It uses no Microsoft logos, names of products, sounds or artwork. The icons and the cursors are drawn for this site.</li>
            <li>Scrollbars in the classic style work in Chromium and Safari; other browsers keep their own.</li>
            <li>The typeface is a stand-in: MS Sans Serif is proprietary, so letter shapes and widths differ from the original.</li>
          </ul>
        </Win>
      </div>
    </GuideDesktop>
  );
}
