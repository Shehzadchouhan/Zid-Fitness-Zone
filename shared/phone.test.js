import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeIndianMobile } from './phone.js';

test('normalizes valid Indian mobile numbers', () => {
  assert.equal(normalizeIndianMobile('9876543210'), '+919876543210');
  assert.equal(normalizeIndianMobile('+91 98765-43210'), '+919876543210');
  assert.equal(normalizeIndianMobile('91 98765 43210'), '+919876543210');
});

test('rejects malformed Indian mobile numbers', () => {
  assert.equal(normalizeIndianMobile('5876543210'), null);
  assert.equal(normalizeIndianMobile('1234567890'), null);
  assert.equal(normalizeIndianMobile('987654321'), null);
  assert.equal(normalizeIndianMobile('98765abc10'), null);
});