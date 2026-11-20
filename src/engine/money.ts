import Decimal from 'decimal.js';

/**
 * Configure Decimal for exact financial math:
 * - Precision: 28 digits (matches IEEE 754 decimal128 standard).
 * - Rounding Rule: ROUND_HALF_UP (standard Indian commercial rounding:
 *   values >= 0.5 round up to next integer paise, < 0.5 round down).
 *
 * All monetary amounts in the Haq AI core engine are stored, calculated,
 * and passed as integer paise (1 Rupee = 100 Paise).
 */
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export const DECIMAL_CONFIG = {
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
  roundingModeName: 'ROUND_HALF_UP (Half away from zero / standard commercial rounding)',
} as const;

/**
 * Converts a rupee amount (string or number) into integer paise.
 * Strictly uses Decimal.js to avoid IEEE-754 floating point inaccuracies.
 *
 * Rounding Rule:
 * Fractions of a paisa (sub-paise) are rounded to the nearest integer paisa
 * using Decimal.ROUND_HALF_UP.
 *
 * Example:
 * - "1234.56" -> 123456
 * - "1234.565" -> 123457
 * - "1234.564" -> 123456
 */
export function rupeesToPaise(rupees: string | number): number {
  if (rupees === '' || rupees === null || rupees === undefined) {
    return 0;
  }
  const cleanStr = rupees.toString().trim().replace(/,/g, '');
  const d = new Decimal(cleanStr);
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
