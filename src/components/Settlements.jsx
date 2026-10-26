import { formatMoney } from "../utils/money";

export default function Settlements({ people, payerId, onPayer, transfers, bill, currency }) {
  const money = (n) => formatMoney(n, currency);
  const nameOf = (id) => people.find((p) => p.id === id)?.name ?? "?";
  const payer = people.find((p) => p.id === payerId);
  const payerRow = bill.rows.find((r) => r.id === payerId);

  return (
    <section>
      <h2>Who owes whom</h2>

      <label className="field">
        Who paid the bill?
        <select value={payerId} onChange={(e) => onPayer(e.target.value)}>
          <option value="">Choose a person</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>

      {!payer && <p>Pick who paid and we will work out who sends what.</p>}

      {payer && transfers.length === 0 && <p>Nothing to settle.</p>}

      {payer && transfers.length > 0 && (
        <>
          <p>
            {payer.name} paid {money(bill.grandTotal)} and is owed{" "}
            {money(bill.grandTotal - payerRow.total)}.
          </p>
          <ul className="transfers">
            {transfers.map((t, i) => (
              <li key={i}>
                <span>
                  <strong>{nameOf(t.from)}</strong>{" "}
                  <span className="arrow">pays</span>{" "}
                  <strong>{nameOf(t.to)}</strong>
                </span>
                <span className="price">{money(t.amount)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}