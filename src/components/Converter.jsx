import { useState } from "react";
import useRates from "../hooks/useRates";
import { CURRENCIES } from "../utils/currencies";

const money = (n, code) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: code }).format(n);
const plain = (n) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(n);

export default function Converter({ active, defaultTo }) {
  const { rates, fetchedAt, loading, error, refresh } = useRates(active);
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState(defaultTo !== "USD" ? defaultTo : "NGN");
  const [useCustom, setUseCustom] = useState(false);
  const [customRate, setCustomRate] = useState("");

  const marketRate =
    rates && rates[from] && rates[to] ? rates[to] / rates[from] : null;
  const rate = useCustom ? Number(customRate) || null : marketRate;
  const value = rate && amount !== "" ? Number(amount) * rate : null;

  const swap = () => {
    setFrom(to);
    setTo(from);
    if (useCustom && Number(customRate) > 0) {
      setCustomRate(String(parseFloat((1 / Number(customRate)).toPrecision(8))));
    }
  };

  return (
    <div className="panel">
      <label className="field">
        Amount
        <input type="number" inputMode="decimal" min="0" value={amount}
               onChange={(e) => setAmount(e.target.value)} />
      </label>

      <div className="pair">
        <label className="field">
          From
          <select value={from} onChange={(e) => setFrom(e.target.value)}>
            {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
          </select>
        </label>
        <button className="ghost swap" onClick={swap} aria-label="Swap currencies">Swap</button>
        <label className="field">
          To
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
          </select>
        </label>
      </div>

      <label className="check">
        <input type="checkbox" checked={useCustom}
               onChange={(e) => setUseCustom(e.target.checked)} />
        Use my own rate
      </label>

      {useCustom && (
        <label className="field">
          1 {from} = how many {to}?
          <input type="number" min="0" step="any" value={customRate}
                 onChange={(e) => setCustomRate(e.target.value)} />
        </label>
      )}

      <div className="result">
        {value !== null ? (
          <>
            <span className="result-main">{money(value, to)}</span>
            <span className="result-sub">
              1 {from} = {plain(rate)} {to} {useCustom ? "(your rate)" : ""}
            </span>
          </>
        ) : (
          <span className="result-sub">
            {useCustom ? "Enter your rate above" : loading ? "Loading rates..." : "Rate unavailable"}
          </span>
        )}
      </div>

      <div className="meta">
        {!useCustom && error && (
          <p className="warn">
            Could not update rates ({error}).{" "}
            {rates ? "Showing the last saved rates." : "You can still use your own rate."}
          </p>
        )}
        {fetchedAt && <span>Rates fetched {new Date(fetchedAt).toLocaleString()}</span>}
        <button className="ghost" onClick={refresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh rates"}
        </button>
        <span>
          <a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer">
            Rates By Exchange Rate API
          </a>
        </span>
      </div>
    </div>
  );
}