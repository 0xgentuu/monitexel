import { formatMoney } from "./money";

export function buildShareText({
  title, date, bill, transfers, people, payerId, currency, taxPercent, tipPercent,
}) {
  const money = (n) => formatMoney(n, currency);
  const nameOf = (id) => people.find((p) => p.id === id)?.name ?? "?";
  const lines = [];

  lines.push("*" + (title || "Bill split") + "*");
  if (date) lines.push(date);
  lines.push("");

  lines.push("*Who pays what*");
  bill.rows.forEach((r) => lines.push(r.name + ": " + money(r.total)));
  lines.push("");

  let total = "Total: " + money(bill.grandTotal);
  const extras = [];
  if (bill.tax > 0) extras.push("tax " + Number(taxPercent) + "%");
  if (bill.tip > 0) extras.push("tip " + Number(tipPercent) + "%");
  if (extras.length) total += " (includes " + extras.join(" and ") + ")";
  lines.push(total);

  if (bill.unassigned > 0) {
    lines.push("Not included: " + money(bill.unassigned) + " of items nobody was assigned to");
  }

  if (payerId) {
    lines.push("");
    lines.push("*Who owes whom* (" + nameOf(payerId) + " paid)");
    if (transfers.length === 0) lines.push("Nothing to settle");
    transfers.forEach((t) =>
      lines.push(nameOf(t.from) + " pays " + nameOf(t.to) + " " + money(t.amount))
    );
  }

  lines.push("");
  lines.push("Split with Bill Splitter");
  return lines.join("\n");
}