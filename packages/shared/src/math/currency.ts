/**
 * Financial and Discrete Quantity Math Helpers
 * Enforces §3 Rule 2 and Rule 8:
 * "Money is integer paise; quantity is integer milli-units. No floats."
 * "Rounding rule: line_total = round_half_up(qty_milli * unit_price_paise / 1000);
 * sale total is the sum of line totals."
 */

/**
 * Calculates line total in paise using Round-Half-Up arithmetic.
 * Guaranteed deterministic across client SQLite, Node.js server, and unit tests.
 *
 * @param qtyMilli Integer milli-units (e.g. 250 for 0.250 kg, 1000 for 1 piece)
 * @param unitPricePaise Integer unit price in paise (e.g. 5000 for ₹50.00)
 * @returns Integer line total in paise
 */
export function calculateLineTotal(qtyMilli: number, unitPricePaise: number): number {
  if (!Number.isInteger(qtyMilli) || qtyMilli < 0) {
    throw new TypeError(`qtyMilli must be a non-negative integer, received ${qtyMilli}`);
  }
  if (!Number.isInteger(unitPricePaise) || unitPricePaise < 0) {
    throw new TypeError(
      `unitPricePaise must be a non-negative integer, received ${unitPricePaise}`,
    );
  }

  // Exact round half-up for non-negative integers:
  return Math.floor((qtyMilli * unitPricePaise + 500) / 1000);
}

/**
 * Calculates overall sale total as the exact sum of line totals.
 * Supports both line_total_paise (db/fixture convention) and lineTotalPaise.
 *
 * @param items Array of items with line total
 * @returns Integer sum in paise
 */
export function calculateSaleTotal(
  items: ReadonlyArray<{ lineTotalPaise?: number; line_total_paise?: number }>,
): number {
  return items.reduce((sum, item) => {
    const val = item.lineTotalPaise ?? item.line_total_paise ?? 0;
    return sum + val;
  }, 0);
}

/**
 * Formats an integer amount in paise into an Indian Rupee string (e.g. 123456 paise -> "₹1,234.56").
 */
export function formatPaiseToRupees(paise: number): string {
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const rupees = Math.floor(absPaise / 100);
  const remainingPaise = (absPaise % 100).toString().padStart(2, '0');

  // Indian number grouping (e.g. 12,34,567.89)
  const rupeesStr = rupees.toLocaleString('en-IN');
  return `${isNegative ? '-' : ''}₹${rupeesStr}.${remainingPaise}`;
}

/**
 * Formats integer milli-units into a human-readable fractional quantity (e.g. 250 -> "0.250", 1500 -> "1.500").
 */
export function formatMilliToUnits(milli: number): string {
  const isNegative = milli < 0;
  const absMilli = Math.abs(milli);
  const whole = Math.floor(absMilli / 1000);
  const frac = (absMilli % 1000).toString().padStart(3, '0');
  return `${isNegative ? '-' : ''}${whole}.${frac}`;
}
