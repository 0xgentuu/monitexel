// "19.99" -> 1999 (whole kobo/cents, never decimals)
export const toMinor = (value) => Math.round(parseFloat(value) * 100);

export const formatMoney = (minor, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(minor / 100);