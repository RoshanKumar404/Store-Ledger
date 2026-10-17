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

describe('Mobile Client Contract Verification (SH-02 on Mobile)', () => {
  it('should confirm mobile client uses shared protocol version 1', () => {
    assert.equal(PROTOCOL_VERSION, 1);
  });

  it('should validate all valid shared op fixtures before enqueueing to outbox', () => {
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
        `Mobile client failed to validate fixture before enqueue: "${item.description}"`,
      );
    }
  });

  it('should reject invalid ops client-side before enqueueing', () => {
    const invalidFile = path.join(sharedFixturesDir, 'invalid-ops.json');
    const invalidOps = JSON.parse(fs.readFileSync(invalidFile, 'utf8'));

    for (const item of invalidOps) {
      const parseResult = PushOpSchema.safeParse(item.op);

      if (item.expectedReason === REJECT_REASON.VALIDATION) {
        assert.equal(
          parseResult.success,
          false,
          `Client should have rejected invalid fixture: "${item.description}"`,
        );
      }
    }
  });
});
