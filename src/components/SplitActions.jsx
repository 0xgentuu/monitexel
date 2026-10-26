export default function SplitActions({ canSave, isSaved, title, onTitle, onSave, onNew }) {
  return (
    <section>
      <h2>This split</h2>

      <div className="save-row">
        <input
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          placeholder="Name it (optional), e.g. Friday dinner"
          maxLength={60}
          aria-label="Split name"
        />
        <button onClick={onSave} disabled={!canSave || isSaved}>
          {isSaved ? "Saved" : "Save to history"}
        </button>
      </div>

      {isSaved && <p>Saved. You can find it under Tools, then History.</p>}

      <button className="danger wide" onClick={onNew}>New split</button>
    </section>
  );
}