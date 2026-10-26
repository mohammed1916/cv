import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = (n, ops) => buildTrace(parseInput(JSON.stringify({ n, ops }))).result

// Oracle: scan every seat, take max of min distance (lowest seat on ties).
function oracle(n, ops) {
  const occ = new Set(); const out = []
  for (const op of ops) {
    if (op[0] === 'leave') { occ.delete(op[1]); out.push(null); continue }
    let bestSeat = 0, bestD = -1
    for (let s = 0; s < n; s++) {
      if (occ.has(s)) continue
      let d = occ.size ? Infinity : 0
      for (const o of occ) d = Math.min(d, Math.abs(o - s))
      if (d > bestD) { bestD = d; bestSeat = s }
    }
    occ.add(bestSeat); out.push(bestSeat)
  }
  return out
}

test('official example', () => {
  assert.deepEqual(run(10, [['seat'], ['seat'], ['seat'], ['seat'], ['leave', 4], ['seat']]), [0, 9, 4, 2, null, 5])
})

test('matches brute force on random sessions', () => {
  for (let t = 0; t < 300; t++) {
    const n = 1 + Math.floor(Math.random() * 15)
    const occ = new Set(); const ops = []
    for (let k = 0; k < 20; k++) {
      if (occ.size && (occ.size === n || Math.random() < 0.35)) {
        const p = [...occ][Math.floor(Math.random() * occ.size)]; occ.delete(p); ops.push(['leave', p])
      } else {
        ops.push(['seat'])
        // track occupancy using oracle to know seats
        const r = oracle(n, ops).at(-1); occ.add(r)
      }
    }
    assert.deepEqual(run(n, ops), oracle(n, ops))
  }
})

test('trace shape', () => {
  const r = buildTrace(parseInput('{"n":4,"ops":[["seat"],["seat"]]}'))
  assert.equal(r.frames[0].phase, 'start'); assert.equal(r.frames.at(-1).phase, 'done')
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('{"n":2,"ops":[["seat"],["seat"],["seat"]]}'))
  assert.throws(() => parseInput('{"n":5,"ops":[["leave",3]]}'))
  assert.throws(() => parseInput('{"n":0,"ops":[["seat"]]}'))
  assert.throws(() => parseInput('[1]'))
})
