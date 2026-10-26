import { useRef, useState } from "react";
import { formatMoney } from "../utils/money";
import { downloadBackup, parseBackup } from "../utils/backup";

const MAX_BYTES = 5 * 1024 * 1024;

const when = (iso) =>
  new Date(iso).toLocaleString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });

export default function HistoryPanel({ history, onLoad, onDelete, onImport }) {
  const fileRef = useRef(null);
  const [note, setNote] = useState("");

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets you pick the same file again later
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setNote("That file is too large to be a backup.");
      return;
    }

    let result;
    try {
      result = parseBackup(await file.text());
    } catch {
      setNote("Could not read that file.");
      return;
    }
    if (result.error) {
      setNote(result.error);
      return;
    }

    const added = onImport(result.entries);
    const already = result.entries.length - added;
    const parts = [];
    if (added > 0) parts.push(`Imported ${added} new split${added === 1 ? "" : "s"}.`);
    else parts.push("Nothing new to import.");
    if (already > 0) parts.push(`${already} already in your history.`);
    if (result.skipped > 0) parts.push(`${result.skipped} could not be read and were skipped.`);
    setNote(parts.join(" "));
  };

  return (
    <div className="panel">
      <div className="backup-row">
        <button className="ghost" onClick={() => downloadBackup(history)}
                disabled={history.length === 0}>
          Export backup
        </button>
        <button className="ghost" onClick={() => fileRef.current?.click()}>
          Import backup
        </button>
        <input ref={fileRef} type="file" accept=".json,application/json"
               onChange={onFile} hidden />
      </div>
      {note && <p className="note" role="status">{note}</p>}

      {history.length === 0 ? (
        <p className="empty">
          No saved splits yet. Finish a split, then tap "Save to history".
        </p>
      ) : (
        <ul className="history">
          {history.map((h) => {
            const money = (n) => formatMoney(n, h.currency);
            const nameOf = (id) => h.people.find((p) => p.id === id)?.name ?? "?";
            const transfers = h.transfers ?? [];

            return (
              <li key={h.id} className="h-card">
                <details>
                  <summary>
                    <span className="h-main">
                      <strong>{h.title || "Untitled split"}</strong>
                      <small>
                        {when(h.savedAt)} • {h.people.length} people • {h.items.length} items
                      </small>
                    </span>
                    <span className="h-total">{money(h.bill.grandTotal)}</span>
                  </summary>

                  <div className="h-body">
                    <div className="h-sub">Each person's share</div>
                    {h.bill.rows.map((r) => (
                      <div className="h-row" key={r.id}>
                        <span>{r.name}</span>
                        <span>{money(r.total)}</span>
                      </div>
                    ))}

                    {transfers.length > 0 && (
                      <>
                        <div className="h-sub">Who owes whom</div>
                        {transfers.map((t, i) => (
                          <div className="h-row" key={i}>
                            <span>{nameOf(t.from)} → {nameOf(t.to)}</span>
                            <span>{money(t.amount)}</span>
                          </div>
                        ))}
                      </>
                    )}

                    <div className="h-actions">
                      <button className="ghost" onClick={() => onLoad(h)}>Load</button>
                      <button
                        className="ghost del"
                        onClick={() => {
                          if (window.confirm("Delete this split from history? This cannot be undone.")) {
                            onDelete(h.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}