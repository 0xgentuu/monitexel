import { useState, useEffect, useCallback } from "react";

const URL = "https://open.er-api.com/v6/latest/USD";
const KEY = "bs-rates";
const MAX_AGE = 12 * 60 * 60 * 1000; // the API updates once a day

function readCache() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}

export default function useRates(enabled) {
  const [cache, setCache] = useState(readCache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(URL);
      if (!res.ok) throw new Error("Request failed (" + res.status + ")");
      const data = await res.json();
      if (data.result !== "success") throw new Error("Rates unavailable");
      const fresh = { rates: data.rates, fetchedAt: Date.now() };
      localStorage.setItem(KEY, JSON.stringify(fresh));
      setCache(fresh);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // only fetch when the Convert tab is actually open
  useEffect(() => {
    if (!enabled) return;
    if (!cache || Date.now() - cache.fetchedAt > MAX_AGE) refresh();
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    rates: cache?.rates ?? null,
    fetchedAt: cache?.fetchedAt ?? null,
    loading,
    error,
    refresh,
  };
}