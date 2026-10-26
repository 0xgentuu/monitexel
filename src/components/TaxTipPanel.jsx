export default function TaxTipPanel({ tax, tip, onTax, onTip }) {
  return (
    <section>
      <h2>Tax and tip</h2>
      <div className="rates">
        <label className="field">
          VAT / tax (%)
          <input type="number" min="0" step="0.1" value={tax}
                 onChange={(e) => onTax(e.target.value)} />
        </label>
        <label className="field">
          Tip / service (%)
          <input type="number" min="0" step="0.1" value={tip}
                 onChange={(e) => onTip(e.target.value)} />
        </label>
      </div>
    </section>
  );
}