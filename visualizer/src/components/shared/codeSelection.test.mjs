import test from 'node:test';
import assert from 'node:assert/strict';
import { codeSelectionPayload, selectCodeLines } from './codeSelection.js';

const code = [2, 4, 8, 10].map(line => ({ line, text: `    value_${line} = ${line}` }));
test('individual lines toggle without losing other selected lines', () => {
  assert.deepEqual(selectCodeLines(code, [2], 8, 2, false), [2, 8]);
  assert.deepEqual(selectCodeLines(code, [2, 8], 2, 8, false), [8]);
  assert.deepEqual(selectCodeLines(code, [2], 99, 2, false), [2]);
});
test('ranges work in either direction with nonconsecutive line numbers', () => {
  assert.deepEqual(selectCodeLines(code, [2], 10, 4, true), [2, 4, 8, 10]);
  assert.deepEqual(selectCodeLines(code, [], 4, 10, true), [4, 8, 10]);
  assert.deepEqual(selectCodeLines(code, [99], 8, 99, true), [8]);
});
test('attachment preserves indentation and includes only selected source lines in source order', () => {
  assert.deepEqual(codeSelectionPayload(code, [8, 2], 'Python'), {
    title: 'Python', lines: '2, 8', code: '2:     value_2 = 2\n8:     value_8 = 8',
  });
});
