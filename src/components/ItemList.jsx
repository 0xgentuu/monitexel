import { formatMoney } from "../utils/money";

export default function ItemList({ items, people, currency, onRemove }) {
  const nameOf = (id) => people.find((p) => p.id === id)?.name ?? "?";

  return (
    <section>
      <h2>Items</h2>
      {items.length === 0 ? (
        <p>No items yet.</p>
      ) : (
        <ul className="items">
          {items.map((i) => (
            <li key={i.id}>
              <div className="item-main">
                <strong>{i.name}</strong>
                <small>Shared by {i.sharedBy.map(nameOf).join(", ")}</small>
              </div>
              <span className="price">{formatMoney(i.price, currency)}</span>
              <button className="ghost" onClick={() => onRemove(i.id)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}