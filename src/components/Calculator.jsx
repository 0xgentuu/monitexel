import { useReducer, useEffect, useState } from "react";
import { calcReducer, initialCalc, clean, prettyDisplay } from "../utils/calc";

const d = (n) => ({ label: n, action: { type: "digit", value: n }, kind: "num" });

const KEYS = [
  { label: "AC", action: { type: "clear" }, kind: "fn" },
  { label: "DEL", action: { type: "back" }, kind: "fn" },
  { label: "%", action: { type: "percent" }, kind: "fn" },
  { label: "÷", action: { type: "op", value: "÷" }, kind: "op" },
  d("7"), d("8"), d("9"),
  { label: "×", action: { type: "op", value: "×" }, kind: "op" },
  d("4"), d("5"), d("6"),
  { label: "-", action: { type: "op", value: "-" }, kind: "op" },
  d("1"), d("2"), d("3"),
  { label: "+", action: { type: "op", value: "+" }, kind: "op" },
  { label: "+/-", action: { type: "negate" }, kind: "fn" },
  d("0"),
  { label: ".", action: { type: "dot" }, kind: "num" },
  { label: "=", action: { type: "equals" }, kind: "eq" },
];

const KEY_OPS = { "+": "+", "-": "-", "*": "×", "/": "÷" };

export default function Calculator({ active }) {
  const [state, dispatch] = useReducer(calcReducer, initialCalc);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target.matches?.("input, select, textarea")) return;

      let action = null;
      if (/^[0-9]$/.test(e.key)) action = { type: "digit", value: e.key };
      else if (e.key === "." || e.key === ",") action = { type: "dot" };
      else if (KEY_OPS[e.key]) action = { type: "op", value: KEY_OPS[e.key] };
      else if (e.key === "=" || (e.key === "Enter" && !e.target.matches?.("button")))
        action = { type: "equals" };
      else if (e.key === "Backspace") action = { type: "back" };
      else if (e.key === "Delete" || e.key.toLowerCase() === "c") action = { type: "clear" };
      else if (e.key === "%") action = { type: "percent" };

      if (action) {
        e.preventDefault();
        dispatch(action);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(state.display);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch { /* clipboard blocked: ignore */ }
  };

  const expr = state.prev !== null ? prettyDisplay(clean(state.prev)) + " " + state.op : "";

  return (
    <div className="panel">
      <div className="calc-screen" aria-live="polite">
        <div className="calc-expr">{expr}</div>
        <div className="calc-display">{prettyDisplay(state.display)}</div>
      </div>

      <div className="keys">
        {KEYS.map((k) => (
          <button
            key={k.label}
            className={
              "key " + k.kind +
              (k.kind === "op" && state.op === k.action.value && state.fresh ? " active" : "")
            }
            onClick={() => dispatch(k.action)}
          >
            {k.label}
          </button>
        ))}
      </div>

      <button className="ghost" onClick={copy}>
        {copied ? "Copied" : "Copy result"}
      </button>
    </div>
  );
}