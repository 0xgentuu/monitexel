// balances: { personId: netMinorUnits }  (+ = is owed money, - = owes money)
export function settle(balances) {
  const creditors = [];
  const debtors = [];
  for (const [id, amt] of Object.entries(balances)) {
    if (amt > 0) creditors.push({ id, amt });
    else if (amt < 0) debtors.push({ id, amt: -amt });
  }

  const payments = [];
  while (creditors.length && debtors.length) {
    creditors.sort((a, b) => b.amt - a.amt);
    debtors.sort((a, b) => b.amt - a.amt);
    const c = creditors[0];
    const d = debtors[0];
    const amount = Math.min(c.amt, d.amt);
    payments.push({ from: d.id, to: c.id, amount });
    c.amt -= amount;
    d.amt -= amount;
    if (c.amt === 0) creditors.shift();
    if (d.amt === 0) debtors.shift();
  }
  return payments;
}

// one person paid the whole bill
export function balancesFromPayer(bill, payerId) {
  const balances = {};
  for (const r of bill.rows) balances[r.id] = -r.total;
  balances[payerId] = (balances[payerId] ?? 0) + bill.grandTotal;
  return balances;
}