import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  PushOpSchema,
  calculateLineTotal,
  calculateSaleTotal,
  getIstDayStart,
  getIstDayEnd,
  isSameIstDay,
  formatPaiseToRupees,
  formatMilliToUnits,
  RegisterRequestSchema,
  LoginRequestSchema,
} from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.resolve(__dirname, '..', 'fixtures');

describe('Shared Package: Contracts & Fixtures (SH-02)', () => {
  it('should validate all valid operations in valid-ops.json', () => {
    const validFile = path.join(fixturesDir, 'valid-ops.json');
    const validOps = JSON.parse(fs.readFileSync(validFile, 'utf8'));

    assert.ok(Array.isArray(validOps) && validOps.length > 0);

    for (const item of validOps) {
      const parseResult = PushOpSchema.safeParse({
        opId: item.opId,
        type: item.type,
        payload: item.payload,
      });

      assert.ok(
        parseResult.success,
        `Expected valid fixture to pass: "${item.description}", error: ${JSON.stringify(parseResult.error?.format())}`,
      );

      // Verify line totals for CREATE_SALE
      if (item.type === 'CREATE_SALE') {
        const payload = item.payload;
        for (const lineItem of payload.items) {
          const expectedLineTotal = calculateLineTotal(
            lineItem.qty_milli,
            lineItem.unit_price_paise,
          );
          assert.equal(
            lineItem.line_total_paise,
            expectedLineTotal,
            `Line total mismatch in fixture ${lineItem.id}`,
          );
        }
        const expectedSaleTotal = calculateSaleTotal(payload.items);
        assert.equal(
          payload.sale.total_paise,
          expectedSaleTotal,
          `Sale total mismatch in fixture ${payload.sale.id}`,
        );
      }
    }
  });

  it('should reject invalid operations in invalid-ops.json', () => {
    const invalidFile = path.join(fixturesDir, 'invalid-ops.json');
    const invalidOps = JSON.parse(fs.readFileSync(invalidFile, 'utf8'));

    assert.ok(Array.isArray(invalidOps) && invalidOps.length > 0);

    for (const item of invalidOps) {
      const parseResult = PushOpSchema.safeParse(item.op);

      if (item.expectedReason === 'VALIDATION') {
        assert.equal(
          parseResult.success,
          false,
          `Expected invalid fixture to fail schema validation: "${item.description}"`,
        );
      } else if (item.expectedReason === 'TOTAL_MISMATCH') {
        // If it passes schema (valid types), verify total mismatch mathematically
        if (parseResult.success && item.op.type === 'CREATE_SALE') {
          const payload = item.op.payload;
          let hasMismatch = false;

          for (const lineItem of payload.items) {
            const expectedLine = calculateLineTotal(lineItem.qty_milli, lineItem.unit_price_paise);
            if (lineItem.line_total_paise !== expectedLine) {
              hasMismatch = true;
            }
          }
          const expectedSaleTotal = calculateSaleTotal(payload.items);
          if (payload.sale.total_paise !== expectedSaleTotal) {
            hasMismatch = true;
          }

          assert.ok(hasMismatch, `Expected total mismatch for: "${item.description}"`);
        }
      }
    }
  });

  it('should calculate round-half-up currency totals accurately including 0.250kg', () => {
    // 250 milli-units (0.250 kg) at ₹100.00 (10,000 paise)
    assert.equal(calculateLineTotal(250, 10000), 2500);

    // 333 milli-units at ₹10.00 (1,000 paise) -> (333 * 1000 + 500) / 1000 = 333500 / 1000 = 333 paise
    assert.equal(calculateLineTotal(333, 1000), 333);

    // 1 milli-unit at ₹1.50 (150 paise) -> (1 * 150 + 500) / 1000 = 650 / 1000 = 0 paise
    assert.equal(calculateLineTotal(1, 150), 0);

    // 5 milli-units at ₹1.50 (150 paise) -> (5 * 150 + 500) / 1000 = 1250 / 1000 = 1 paisa
    assert.equal(calculateLineTotal(5, 150), 1);

    // Sum of items
    const items = [{ lineTotalPaise: 2500 }, { lineTotalPaise: 1000 }, { lineTotalPaise: 750 }];
    assert.equal(calculateSaleTotal(items), 4250);

    // Formatting
    assert.equal(formatPaiseToRupees(4250), '₹42.50');
    assert.equal(formatMilliToUnits(250), '0.250');
  });

  it('should compute IST day boundaries correctly around midnight IST', () => {
    // 2026-10-17 00:00:00 IST is 2026-10-16 18:30:00 UTC
    // Date.UTC(2026, 9, 16, 18, 30, 0)
    const midnightIstUtcMs = Date.UTC(2026, 9, 16, 18, 30, 0);

    const dayStart = getIstDayStart(midnightIstUtcMs);
    assert.equal(dayStart, midnightIstUtcMs, 'Midnight IST should equal its own day start');

    // 1 second before midnight IST (belongs to previous IST day)
    const justBeforeMidnight = midnightIstUtcMs - 1000;
    assert.equal(isSameIstDay(midnightIstUtcMs, justBeforeMidnight), false);

    // 1 second after midnight IST (belongs to same IST day)
    const justAfterMidnight = midnightIstUtcMs + 1000;
    assert.equal(isSameIstDay(midnightIstUtcMs, justAfterMidnight), true);

    // Noon IST (12:00:00 IST = 06:30:00 UTC)
    const noonIstUtcMs = Date.UTC(2026, 9, 17, 6, 30, 0);
    assert.equal(getIstDayStart(noonIstUtcMs), midnightIstUtcMs);
    assert.equal(isSameIstDay(midnightIstUtcMs, noonIstUtcMs), true);

    // End of IST day is dayStart + 86,400,000 - 1
    assert.equal(getIstDayEnd(noonIstUtcMs), midnightIstUtcMs + 86_400_000 - 1);
  });

  it('should validate auth request schemas with strict bounds', () => {
    // Valid register
    const validRegister = RegisterRequestSchema.safeParse({
      email: 'owner@kirana.store',
      password: 'StrongPassword123!',
      shopName: 'Gupta General Store',
    });
    assert.ok(validRegister.success);

    // Invalid register (password too short)
    const invalidRegister = RegisterRequestSchema.safeParse({
      email: 'owner@kirana.store',
      password: 'short',
      shopName: 'Store',
    });
    assert.equal(invalidRegister.success, false);

    // Invalid register (unknown injected field)
    const massAssignment = RegisterRequestSchema.safeParse({
      email: 'owner@kirana.store',
      password: 'StrongPassword123!',
      shopName: 'Store',
      role: 'OWNER', // should be rejected by .strict()
    });
    assert.equal(massAssignment.success, false);
  });
});
