// Splits `total` (whole kobo) across people by weight.
// Uses the largest remainder method, so the parts ALWAYS add up to total.
export function allocate(total, weights) {
  const ids = Object.keys(weights);
  const sum = ids.reduce((s, id) => s + weights[id], 0);
  const result = Object.fromEntries(ids.map((id) => [id, 0]));
  if (sum === 0 || total === 0) return result;

  const parts = ids.map((id) => {
    const exact = (total * weights[id]) / sum;
    const floor = Math.floor(exact);
    return { id, floor, frac: exact - floor };
  });

  let left = total - parts.reduce((s, p) => s + p.floor, 0);
  parts.sort((a, b) => b.frac - a.frac);
  for (let i = 0; left > 0; i++, left--) parts[i % parts.length].floor += 1;

  parts.forEach((p) => (result[p.id] = p.floor));
  return result;
}

export function calcBill(people, items, taxPercent, tipPercent) {
  const ids = new Set(people.map((p) => p.id));
  const subtotals = Object.fromEntries(people.map((p) => [p.id, 0]));
  let itemsTotal = 0;
  let unassigned = 0;

  for (const item of items) {
    const sharers = item.sharedBy.filter((id) => ids.has(id));
    if (sharers.length === 0) {
      unassigned += item.price;        // nobody is paying for this item
      continue;
    }
    const shares = allocate(item.price, Object.fromEntries(sharers.map((id) => [id, 1])));
    for (const id of sharers) subtotals[id] += shares[id];
    itemsTotal += item.price;
  }

  const tax = Math.round(itemsTotal * (Math.max(Number(taxPercent) || 0, 0) / 100));
  const tip = Math.round(itemsTotal * (Math.max(Number(tipPercent) || 0, 0) / 100));

  // tax and tip are shared in proportion to what each person ordered
  const taxShares = allocate(tax, subtotals);
  const tipShares = allocate(tip, subtotals);

  const rows = people.map((p) => ({
    id: p.id,
    name: p.name,
    subtotal: subtotals[p.id],
    tax: taxShares[p.id],
    tip: tipShares[p.id],
    total: subtotals[p.id] + taxShares[p.id] + tipShares[p.id],
  }));

  return { rows, itemsTotal, tax, tip, grandTotal: itemsTotal + tax + tip, unassigned };
}