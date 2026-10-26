import { CURRENCIES } from "../utils/currencies";

export default function SettingsPanel({
  theme,
  onTheme,
  currency,
  onCurrency,
}) {
  return (
    <div className="panel">
      <div className="field">
        Theme
        <div className="seg" role="group" aria-label="Theme">
          {["light", "dark"].map((t) => (
            <button
              key={t}
              className={"seg-btn" + (theme === t ? " on" : "")}
              aria-pressed={theme === t}
              onClick={() => onTheme(t)}
            >
              {t === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </div>

      <label className="field">
        Bill currency
        <select value={currency} onChange={(e) => onCurrency(e.target.value)}>
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} - {c.name}
            </option>
          ))}
        </select>
        <small>
          Only changes how amounts are shown. It does not convert them. Saved
          splits keep the currency they were saved in.
        </small>
      </label>

      <p className="note">
        Your current split and your history are stored in this browser on this
        device only. Clearing your browser's site data will remove them. Use
        "Export backup" in the History tab to keep a copy.
      </p>
    </div>
  );
}
