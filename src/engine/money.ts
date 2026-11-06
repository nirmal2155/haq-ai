import Decimal from 'decimal.js';

// Configure Decimal for exact financial math
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

/**
 * Converts a rupee amount (string or number) into integer paise.
 * Strictly uses Decimal to avoid IEEE-754 floating point inaccuracies.
 * Example: "1234.56" -> 123456
 */
export function rupeesToPaise(rupees: string | number): number {
  if (rupees === '' || rupees === null || rupees === undefined) {
    return 0;
  }
  const d = new Decimal(rupees.toString().trim().replace(/,/g, ''));
  if (d.isNaN() || !d.isFinite()) {
    throw new Error(`Invalid rupee amount: ${rupees}`);
  }
  return d.times(100).round().toNumber();
}

/**
 * Converts integer paise into a standard rupee decimal string (2 decimal places).
 * Example: 123456 -> "1234.56"
 */
export function paiseToRupees(paise: number): string {
  if (!Number.isInteger(paise)) {
    throw new Error(`Paise must be an integer, got: ${paise}`);
  }
  const d = new Decimal(paise).dividedBy(100);
  return d.toFixed(2);
}

/**
 * Formats integer paise into Indian currency format (e.g. ₹1,23,456.78).
 */
export function formatPaiseToINR(paise: number): string {
  const rupeesStr = paiseToRupees(paise);
  const [integerPart, decimalPart] = rupeesStr.split('.');

  const isNegative = integerPart.startsWith('-');
  const cleanInt = isNegative ? integerPart.slice(1) : integerPart;

  let formattedInt = '';
  if (cleanInt.length <= 3) {
    formattedInt = cleanInt;
  } else {
    const lastThree = cleanInt.slice(-3);
    const otherDigits = cleanInt.slice(0, -3);
    const grouped = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formattedInt = `${grouped},${lastThree}`;
  }

  return `${isNegative ? '-' : ''}₹${formattedInt}.${decimalPart}`;
}
