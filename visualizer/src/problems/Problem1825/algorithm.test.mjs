import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (m, k, operations) => buildTrace(parseInput(JSON.stringify({ m, k, operations }))).result

test('1825 official example', () => {
  const ops = [['add', 3], ['add', 1], ['calc'], ['add', 10], ['calc'], ['add', 5], ['add', 5], ['add', 5], ['calc']]
  assert.deepEqual(solve(3, 1, ops), [null, null, -1, null, 3, null, null, null, 5])
})

test('1825 the average floors the result', () => {
  const ops = [['add', 1], ['add', 2], ['add', 4], ['calc']]
  assert.deepEqual(solve(3, 1, ops), [null, null, null, 2])
})

test('1825 rejects k that leaves nothing to average', () => {
  assert.throws(() => parseInput('{"m":4,"k":2,"operations":[["calc"]]}'))
})

// Independent oracle: remove the minimum and maximum one at a time instead of sorting.
function oracle(m, k, operations) {
  const stream = []
  const out = []
  for (const op of operations) {
    if (op[0] === 'add') { stream.push(op[1]); out.push(null); continue }
    if (stream.length < m) { out.push(-1); continue }
    const part = stream.slice(stream.length - m)
    for (let t = 0; t < k; t++) {
      part.splice(part.indexOf(Math.min(...part)), 1)
      part.splice(part.indexOf(Math.max(...part)), 1)
    }
    out.push(Math.floor(part.reduce((a, b) => a + b, 0) / part.length))
  }
  return out
}

test('1825 random operations match a remove-extremes oracle', () => {
  let seed = 1825
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const m = 3 + rnd(8)
    const k = 1 + rnd(Math.floor((m - 1) / 2))
    const ops = Array.from({ length: 1 + rnd(25) }, () => (rnd(3) === 0 ? ['calc'] : ['add', rnd(60)]))
    assert.deepEqual(solve(m, k, ops), oracle(m, k, ops), JSON.stringify({ m, k, ops }))
  }
})
