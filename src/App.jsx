import { useCallback, useEffect, useMemo, useState } from "react";
import useLocalStorage from "./hooks/useLocalStorage";
import { calcBill } from "./utils/split";
import { settle, balancesFromPayer } from "./utils/settle";
import PeopleList from "./components/PeopleList";
import ItemForm from "./components/ItemForm";
import ItemList from "./components/ItemList";
import TaxTipPanel from "./components/TaxTipPanel";
import Summary from "./components/Summary";
import Settlements from "./components/Settlements";
import SplitActions from "./components/SplitActions";
import Sidebar from "./components/Sidebar";
import ShareCard from "./components/ShareCard";
import { mergeHistory } from "./utils/backup";

const prefersDark = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;

// a fingerprint of a split, used to tell whether it is already in history
const makeSig = (people, items, tax, tip, currency, paidBy) =>
  JSON.stringify([people, items, tax, tip, currency, paidBy || null]);

export default function App() {
  const [people, setPeople] = useLocalStorage("bs-people", []);
  const [items, setItems] = useLocalStorage("bs-items", []);
  const [tax, setTax] = useLocalStorage("bs-tax", "7.5");
  const [tip, setTip] = useLocalStorage("bs-tip", "0");
  const [paidBy, setPaidBy] = useLocalStorage("bs-paidby", "");
  const [theme, setTheme] = useLocalStorage(
    "bs-theme",
    prefersDark() ? "dark" : "light",
  );
  const [currency, setCurrency] = useLocalStorage("bs-currency", "NGN");
  const [history, setHistory] = useLocalStorage("bs-history", []);
  const [title, setTitle] = useState("");
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const closeTools = useCallback(() => setToolsOpen(false), []);

  const bill = useMemo(
    () => calcBill(people, items, tax, tip),
    [people, items, tax, tip],
  );

  // if the payer was removed from the group, treat it as "nobody chosen"
  const payerId = people.some((p) => p.id === paidBy) ? paidBy : "";

  const transfers = useMemo(
    () => (payerId ? settle(balancesFromPayer(bill, payerId)) : []),
    [bill, payerId],
  );

  const hasData = people.length > 0 || items.length > 0;
  const canSave = people.length > 0 && items.length > 0;

  const signature = makeSig(people, items, tax, tip, currency, payerId);
  const isSaved = useMemo(
    () =>
      history.some(
        (h) =>
          makeSig(
            h.people,
            h.items,
            h.taxPercent,
            h.tipPercent,
            h.currency,
            h.paidBy,
          ) === signature,
      ),
    [history, signature],
  );

  const confirmDiscard = () =>
    !hasData ||
    isSaved ||
    window.confirm("This split isn't saved to history. Discard it?");

  const addPerson = (name) =>
    setPeople([...people, { id: crypto.randomUUID(), name }]);

  const removePerson = (id) => {
    setPeople(people.filter((p) => p.id !== id));
    setItems(
      items.map((i) => ({
        ...i,
        sharedBy: i.sharedBy.filter((p) => p !== id),
      })),
    );
  };

  const addItem = (item) =>
    setItems([...items, { id: crypto.randomUUID(), ...item }]);

  const removeItem = (id) => setItems(items.filter((i) => i.id !== id));

  const saveSplit = () => {
    if (!canSave) return;
    const entry = {
      id: crypto.randomUUID(),
      title: title.trim(),
      savedAt: new Date().toISOString(),
      currency,
      taxPercent: tax,
      tipPercent: tip,
      paidBy: payerId,
      people,
      items,
      bill, // snapshot of exactly what was agreed
      transfers, // who owes whom at the time
    };
    setHistory([entry, ...history]);
    setTitle("");
  };

  const newSplit = () => {
    if (!confirmDiscard()) return;
    setPeople([]);
    setItems([]);
    setTax("7.5");
    setTip("0");
    setPaidBy("");
    setTitle("");
  };

  const loadSplit = (entry) => {
    if (!confirmDiscard()) return;
    setPeople(entry.people);
    setItems(entry.items);
    setTax(entry.taxPercent);
    setTip(entry.tipPercent);
    setCurrency(entry.currency);
    setPaidBy(entry.paidBy || "");
    setTitle(entry.title);
    setToolsOpen(false);
  };

  const importHistory = (entries) => {
    const { merged, added } = mergeHistory(history, entries);
    if (added > 0) setHistory(merged);
    return added;
  };

  const deleteSplit = (id) => setHistory(history.filter((h) => h.id !== id));

  return (
    <main className="app">
      <header className="top">
        <h1>Bill Splitter</h1>
        <button
          className="ghost"
          onClick={() => setToolsOpen(true)}
          aria-label="Open tools"
        >
          Tools
        </button>
      </header>

      <PeopleList people={people} onAdd={addPerson} onRemove={removePerson} />
      <ItemForm people={people} onAdd={addItem} />
      <ItemList
        items={items}
        people={people}
        currency={currency}
        onRemove={removeItem}
      />

      {canSave && (
        <>
          <TaxTipPanel tax={tax} tip={tip} onTax={setTax} onTip={setTip} />
          <Summary bill={bill} currency={currency} />
          <Settlements
            people={people}
            payerId={payerId}
            onPayer={setPaidBy}
            transfers={transfers}
            bill={bill}
            currency={currency}
          />
          <ShareCard
            title={title}
            bill={bill}
            transfers={transfers}
            people={people}
            payerId={payerId}
            currency={currency}
            taxPercent={tax}
            tipPercent={tip}
          />
        </>
      )}

      {hasData && (
        <SplitActions
          canSave={canSave}
          isSaved={isSaved}
          title={title}
          onTitle={setTitle}
          onSave={saveSplit}
          onNew={newSplit}
        />
      )}

      <Sidebar
        open={toolsOpen}
        onClose={closeTools}
        theme={theme}
        onTheme={setTheme}
        currency={currency}
        onCurrency={setCurrency}
        history={history}
        onLoad={loadSplit}
        onDelete={deleteSplit}
        onImport={importHistory}
      />
    </main>
  );
}