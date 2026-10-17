import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  PushOpSchema,
  calculateLineTotal,
  calculateSaleTotal,
  PROTOCOL_VERSION,
  REJECT_REASON,
} from '@kirana/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sharedFixturesDir = path.resolve(__dirname, '../../../packages/shared/fixtures');

describe('Server Contract Verification (SH-02 on Server)', () => {
  it('should confirm server uses shared protocol version 1', () => {
    assert.equal(PROTOCOL_VERSION, 1);
  });

  it('should validate all valid shared op fixtures on server side', () => {
    const validFile = path.join(sharedFixturesDir, 'valid-ops.json');
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
        `Server failed to validate fixture: "${item.description}", error: ${JSON.stringify(parseResult.error?.format())}`,
      );
    }
  });

  it('should reject invalid shared op fixtures on server side with correct reason code', () => {
    const invalidFile = path.join(sharedFixturesDir, 'invalid-ops.json');
    const invalidOps = JSON.parse(fs.readFileSync(invalidFile, 'utf8'));

    assert.ok(Array.isArray(invalidOps) && invalidOps.length > 0);

    for (const item of invalidOps) {
      const parseResult = PushOpSchema.safeParse(item.op);

      if (item.expectedReason === REJECT_REASON.VALIDATION) {
        assert.equal(
          parseResult.success,
          false,
          `Expected invalid fixture to fail schema validation: "${item.description}"`,
        );
      } else if (item.expectedReason === REJECT_REASON.TOTAL_MISMATCH) {
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
});
