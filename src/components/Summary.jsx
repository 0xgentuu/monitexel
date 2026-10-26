import { formatMoney } from "../utils/money";

export default function Summary({ bill, currency }) {
  const money = (n) => formatMoney(n, currency);

  return (
    <section>
      <h2>Who pays what</h2>

      {bill.unassigned > 0 && (
        <p className="warn">
          {money(bill.unassigned)} worth of items has nobody assigned, so it is not
          included below.
        </p>
      )}

      <div className="bill">
        {bill.rows.map((r) => (
          <div className="person-card" key={r.id}>
            <div className="person-head">
              <strong>{r.name}</strong>
              <span className="person-total">{money(r.total)}</span>
            </div>
            <div className="breakdown">
              <span>Items {money(r.subtotal)}</span>
              <span>Tax {money(r.tax)}</span>
              <span>Tip {money(r.tip)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grand">
        <span>Grand total</span>
        <span>{money(bill.grandTotal)}</span>
      </div>
    </section>
  );
}