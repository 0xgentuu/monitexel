export const initialCalc = { display: "0", prev: null, op: null, fresh: true };

const run = (a, b, op) => {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "×": return a * b;
    case "÷": return b === 0 ? NaN : a / b;
    default: return b;
  }
};

// 0.1 + 0.2 -> "0.3" instead of "0.30000000000000004"
export const clean = (n) =>
  Number.isFinite(n) ? String(parseFloat(n.toPrecision(12))) : "Error";

const fail = { ...initialCalc, display: "Error" };

export function calcReducer(s, a) {
  switch (a.type) {
    case "clear":
      return initialCalc;

    case "digit": {
      if (s.fresh || s.display === "Error") return { ...s, display: a.value, fresh: false };
      if (s.display.replace(/[-.]/g, "").length >= 15) return s;
      return { ...s, display: s.display === "0" ? a.value : s.display + a.value };
    }

    case "dot": {
      if (s.fresh || s.display === "Error") return { ...s, display: "0.", fresh: false };
      if (s.display.includes(".")) return s;
      return { ...s, display: s.display + "." };
    }

    case "op": {
      if (s.display === "Error") return s;
      if (s.op && s.fresh) return { ...s, op: a.value };
      const current = Number(s.display);
      if (s.op !== null && s.prev !== null) {
        const result = run(s.prev, current, s.op);
        if (!Number.isFinite(result)) return fail;
        return { display: clean(result), prev: result, op: a.value, fresh: true };
      }
      return { ...s, prev: current, op: a.value, fresh: true };
    }

    case "equals": {
      if (s.op === null || s.prev === null) return s;
      const result = run(s.prev, Number(s.display), s.op);
      if (!Number.isFinite(result)) return fail;
      return { display: clean(result), prev: null, op: null, fresh: true };
    }

    case "percent": {
      if (s.display === "Error") return s;
      return { ...s, display: clean(Number(s.display) / 100), fresh: true };
    }

    case "negate": {
      if (s.display === "0" || s.display === "Error") return s;
      return { ...s, display: s.display.startsWith("-") ? s.display.slice(1) : "-" + s.display };
    }

    case "back": {
      if (s.fresh || s.display === "Error") return s;
      const short = s.display.length > 1 && !(s.display.length === 2 && s.display[0] === "-");
      return { ...s, display: short ? s.display.slice(0, -1) : "0" };
    }

    default:
      return s;
  }
}

// 1234567.5 -> "1,234,567.5"
export function prettyDisplay(d) {
  if (d === "Error" || /e/i.test(d)) return d;
  const neg = d.startsWith("-");
  const [int, dec] = d.replace("-", "").split(".");
  const grouped = Number(int).toLocaleString("en-US");
  return (neg ? "-" : "") + grouped + (dec !== undefined ? "." + dec : "");
}