const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const num = (v, d = 0) => (Number.isFinite(v) ? v : d);

export function buildBackup(history) {
  return JSON.stringify(
    { app: "bill-splitter", version: 1, exportedAt: new Date().toISOString(), history },
    null,
    2
  );
}

export function downloadBackup(history) {
  const blob = new Blob([buildBackup(history)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bill-splitter-history-" + new Date().toLocaleDateString("en-CA") + ".json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function isValidEntry(h) {
  return (
    isObj(h) &&
    typeof h.id === "string" && h.id.length > 0 &&
    typeof h.savedAt === "string" && !Number.isNaN(Date.parse(h.savedAt)) &&
    typeof h.currency === "string" &&
    Array.isArray(h.people) &&
    h.people.every((p) => isObj(p) && typeof p.id === "string" && typeof p.name === "string") &&
    Array.isArray(h.items) &&
    h.items.every(
      (i) => isObj(i) && typeof i.id === "string" && Number.isFinite(i.price) && Array.isArray(i.sharedBy)
    ) &&
    isObj(h.bill) &&
    Number.isFinite(h.bill.grandTotal) &&
    Array.isArray(h.bill.rows) &&
    h.bill.rows.every(
      (r) => isObj(r) && typeof r.id === "string" && typeof r.name === "string" && Number.isFinite(r.total)
    )
  );
}

// keep only the fields the app knows, in the same order the app creates them
function sanitizeEntry(h) {
  return {
    id: h.id,
    title: typeof h.title === "string" ? h.title.slice(0, 60) : "",
    savedAt: h.savedAt,
    currency: h.currency,
    taxPercent: String(h.taxPercent ?? "0"),
    tipPercent: String(h.tipPercent ?? "0"),
    paidBy: typeof h.paidBy === "string" ? h.paidBy : "",
    people: h.people.map((p) => ({ id: p.id, name: p.name })),
    items: h.items.map((i) => ({
      id: i.id,
      name: typeof i.name === "string" ? i.name : "",
      price: i.price,
      sharedBy: i.sharedBy.filter((x) => typeof x === "string"),
    })),
    bill: {
      rows: h.bill.rows.map((r) => ({
        id: r.id,
        name: r.name,
        subtotal: num(r.subtotal),
        tax: num(r.tax),
        tip: num(r.tip),
        total: r.total,
      })),
      itemsTotal: num(h.bill.itemsTotal),
      tax: num(h.bill.tax),
      tip: num(h.bill.tip),
      grandTotal: h.bill.grandTotal,
      unassigned: num(h.bill.unassigned),
    },
    transfers: Array.isArray(h.transfers)
      ? h.transfers
          .filter(
            (t) =>
              isObj(t) && typeof t.from === "string" && typeof t.to === "string" &&
              Number.isFinite(t.amount)
          )
          .map((t) => ({ from: t.from, to: t.to, amount: t.amount }))
      : [],
  };
}

export function parseBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { error: "That file isn't valid JSON." };
  }
  if (isObj(data) && data.app && data.app !== "bill-splitter") {
    return { error: "This backup is from a different app." };
  }
  const list = Array.isArray(data) ? data : data?.history;
  if (!Array.isArray(list)) {
    return { error: "This doesn't look like a Bill Splitter backup." };
  }

  const entries = [];
  let skipped = 0;
  for (const h of list) {
    if (isValidEntry(h)) entries.push(sanitizeEntry(h));
    else skipped++;
  }
  return { entries, skipped };
}

export function mergeHistory(current, incoming) {
  const have = new Set(current.map((h) => h.id));
  const fresh = [];
  for (const h of incoming) {
    if (have.has(h.id)) continue;
    have.add(h.id);
    fresh.push(h);
  }
  const merged = [...current, ...fresh].sort(
    (a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt)
  );
  return { merged, added: fresh.length };
}