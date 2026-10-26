import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (cells, n) => buildTrace(parseInput(JSON.stringify({ cells, n }))).result
const step = c => c.map((_, i) => (i > 0 && i < 7 && c[i - 1] === c[i + 1] ? 1 : 0))
const direct = (cells, n) => { let c = [...cells]; for (let d = 0; d < n; d++) c = step(c); return c }
test('official examples', () => {
  assert.deepEqual(solve([0, 1, 0, 1, 1, 0, 0, 1], 7), [0, 0, 1, 1, 0, 0, 0, 0])
  assert.deepEqual(solve([1, 0, 0, 1, 0, 0, 1, 0], 1000000000), [0, 0, 1, 1, 1, 1, 1, 0])
})
test('all 256 start states match direct simulation for n up to 40', () => {
  for (let v = 0; v < 256; v++) {
    const cells = Array.from({ length: 8 }, (_, i) => v >> i & 1)
    for (const n of [0, 1, 2, 3, 13, 14, 15, 28, 29, 40]) assert.deepEqual(solve(cells, n), direct(cells, n), `${cells} ${n}`)
  }
})
test('huge n matches the period-14 identity', () => {
  for (let v = 0; v < 256; v++) {
    const cells = Array.from({ length: 8 }, (_, i) => v >> i & 1)
    for (const n of [999999999, 1000000000, 123456789]) assert.deepEqual(solve(cells, n), direct(cells, 1 + (n - 1) % 14), `${cells} ${n}`)
  }
})
test('rejects bad input', () => {
  for (const bad of ['{"cells":[1,0],"n":1}', '{"cells":[0,1,0,1,1,0,0,2],"n":1}', '{"cells":[0,1,0,1,1,0,0,1],"n":-1}', '{"cells":[0,1,0,1,1,0,0,1],"n":2000000000}', '[1]']) assert.throws(() => parseInput(bad))
})
