import { useState } from "react";

export default function PeopleList({ people, onAdd, onRemove }) {
  const [name, setName] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    setName("");
  };

  return (
    <section>
      <h2>Who's eating?</h2>
      <form onSubmit={submit}>
        <input value={name} onChange={(e) => setName(e.target.value)}
               placeholder="Add a name" aria-label="Person's name" />
        <button type="submit">Add</button>
      </form>
      {people.length === 0 && <p>Add at least two people to start.</p>}
      <ul className="people">
        {people.map((p) => (
          <li key={p.id}>
            {p.name}
            <button onClick={() => onRemove(p.id)} aria-label={`Remove ${p.name}`}>x</button>
          </li>
        ))}
      </ul>
    </section>
  );
}