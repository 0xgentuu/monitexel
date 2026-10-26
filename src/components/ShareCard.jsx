import { useState } from "react";
import { buildShareText } from "../utils/shareText";

export default function ShareCard({
  title, bill, transfers, people, payerId, currency, taxPercent, tipPercent,
}) {
  const [status, setStatus] = useState("");

  const text = buildShareText({
    title: title.trim(),
    date: new Date().toLocaleDateString("en-NG", {
      day: "numeric", month: "short", year: "numeric",
    }),
    bill, transfers, people, payerId, currency, taxPercent, tipPercent,
  });

  const whatsappUrl = "https://wa.me/?text=" + encodeURIComponent(text);
  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const flash = (msg) => {
    setStatus(msg);
    setTimeout(() => setStatus(""), 1500);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      flash("Copied");
    } catch {
      flash("Could not copy");
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: title.trim() || "Bill split", text });
    } catch {
      /* the person closed the share sheet: nothing to do */
    }
  };

  return (
    <section>
      <h2>Share this split</h2>
      <pre className="preview">{text}</pre>

      {!payerId && <p>Choose who paid above to include who owes whom.</p>}

      <div className="share-row">
        <a className="btn" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          Send on WhatsApp
        </a>
        <button className="ghost big" onClick={copy} aria-live="polite">
          {status || "Copy"}
        </button>
        {canNativeShare && (
          <button className="ghost big" onClick={nativeShare}>More apps</button>
        )}
      </div>
    </section>
  );
}