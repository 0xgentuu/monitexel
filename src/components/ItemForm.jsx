import { useState } from "react";
import { toMinor } from "../utils/money";

export default function ItemForm({ people, onAdd }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [sharedBy, setSharedBy] = useState([]);

  const toggle = (id) =>
    setSharedBy(sharedBy.includes(id) ? sharedBy.filter((p) => p !== id) : [...sharedBy, id]);

  const valid = name.trim() && parseFloat(price) > 0 && sharedBy.length > 0;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onAdd({ name: name.trim(), price: toMinor(price), sharedBy });
    setName(""); setPrice(""); setSharedBy([]);
  };

  return (
    <section>
      <h2>Add an item</h2>
      <form onSubmit={submit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" />
        <input value={price} onChange={(e) => setPrice(e.target.value)}
               placeholder="Price" type="number" min="0" step="0.01" />
        <fieldset>
          <legend>Shared by</legend>
          {people.map((p) => (
            <label key={p.id}>
              <input type="checkbox" checked={sharedBy.includes(p.id)}
                     onChange={() => toggle(p.id)} /> {p.name}
            </label>
          ))}
        </fieldset>
        <button type="submit" disabled={!valid}>Add item</button>
      </form>
    </section>
  );
}