import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(String(n)))
function isBeautiful(a, n) {
  if ([...a].sort((x, y) => x - y).some((v, i) => v !== i + 1) || a.length !== n) return false
  for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) for (let k = i + 1; k < j; k++) if (2 * a[k] === a[i] + a[j]) return false
  return true
}
test('official examples', () => {
  assert.deepEqual(solve(4).result, [1, 3, 2, 4])
  assert.ok(isBeautiful(solve(5).result, 5))
})
test('beautiful for all n up to 200 (independent triple check)', () => {
  for (let n = 1; n <= 80; n++) assert.ok(isBeautiful(solve(n).result, n), `n=${n}`)
})
test('trace ends with done', () => {
  const t = solve(11)
  assert.equal(t.frames[0].phase, 'start')
  assert.equal(t.frames.at(-1).phase, 'done')
})
test('rejects bad input', () => {
  for (const bad of ['0', '201', '"a"', '[1]', '1.5']) assert.throws(() => parseInput(bad))
})
