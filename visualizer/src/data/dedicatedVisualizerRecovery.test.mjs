import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const selected = JSON.parse(readFileSync(new URL('./dedicatedVisualizerRecovery.json', import.meta.url)));
for (const { number, module } of selected) {
  test(`selected dedicated route ${number} retains ${module}`, () => {
    const entry = readFileSync(new URL(`../problems/Problem${number}/index.jsx`, import.meta.url), 'utf8');
    assert.ok(entry.includes(`export { default } from "./${module}"`), 'Keep the dedicated teaching view when adding solver contracts.');
  });
}
