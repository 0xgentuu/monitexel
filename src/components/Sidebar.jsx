import { useEffect, useState } from "react";
import Calculator from "./Calculator";
import Converter from "./Converter";
import HistoryPanel from "./HistoryPanel";
import SettingsPanel from "./SettingsPanel";

const TABS = [
  { id: "calc", label: "Calculator" },
  { id: "convert", label: "Convert" },
  { id: "history", label: "History" },
  { id: "settings", label: "Settings" },
];

export default function Sidebar({
  open, onClose, theme, onTheme, currency, onCurrency, history, onLoad, onDelete, onImport, 
}) {
  const [tab, setTab] = useState("calc");

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={"scrim" + (open ? " show" : "")} onClick={onClose} />
      <aside className={"sidebar" + (open ? " open" : "")} aria-hidden={!open} aria-label="Tools">
        <div className="side-head">
          <h2>Tools</h2>
          <button className="ghost" onClick={onClose} aria-label="Close tools">Close</button>
        </div>

        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id}
                    className={"tab" + (tab === t.id ? " on" : "")}
                    onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="side-body">
          <div hidden={tab !== "calc"}>
            <Calculator active={open && tab === "calc"} />
          </div>
          <div hidden={tab !== "convert"}>
            <Converter active={open && tab === "convert"} defaultTo={currency} />
          </div>
          <div hidden={tab !== "history"}>
            <HistoryPanel history={history} onLoad={onLoad} onDelete={onDelete} onImport={onImport}/>
          </div>
          <div hidden={tab !== "settings"}>
            <SettingsPanel theme={theme} onTheme={onTheme}
                           currency={currency} onCurrency={onCurrency} />
          </div>
        </div>
      </aside>
    </>
  );
}