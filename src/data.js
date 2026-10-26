export const VEHICLES = {
  Toyota: { Avensis: [2009, 2019], Corolla: [2009, 2019], Camry: [2012, 2020], Hilux: [2005, 2018] },
  Volkswagen: { Golf: [2004, 2020], Passat: [2005, 2019] },
  BMW: { "3 Series": [2005, 2018], X5: [2007, 2018] },
  Ford: { Focus: [2005, 2018], Transit: [2006, 2020] },
};
export const CATEGORIES = ["Brake discs", "Brake pads", "Car batteries", "Cabin filters", "Oil filters", "Air filters", "Shock absorbers", "Fuel filters", "Clutches"];
export const FLUID_CATEGORIES = ["Engine oil", "Coolant", "Brake fluid", "Transmission fluid", "Washer fluid"];
export const CONDITIONS = ["New", "Refurbished", "Used, tested", "Used, as is"];

export const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => b - i);

export function fitsVehicle(l, { make, model, year }) {
  if (!make || l.fits.length === 0) return true;
  return l.fits.some(
    (f) => f.make === make && (!model || f.model === model) && (!year || (year >= f.from && year <= f.to))
  );
}

export function fitLabel(l) {
  if (l.fits.length === 0) return "Universal fit";
  const f = l.fits[0];
  return `${f.make} ${f.model} ${f.from}–${f.to}`;
}
