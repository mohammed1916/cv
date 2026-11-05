import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const run = (n, ops) => buildTrace(parseInput(JSON.stringify({ n, ops }))).result
const PY = python.split('\n')

test('2502 worked example', () => {
  assert.deepEqual(run(10, [['allocate', 1, 1], ['allocate', 2, 2], ['allocate', 3, 3], ['free', 2], ['allocate', 4, 1], ['allocate', 5, 2]]), [0, 1, 3, 2, 6, -1])
})

test('2502 no room returns -1 and free counts units', () => {
  assert.deepEqual(run(3, [['allocate', 2, 7], ['allocate', 2, 8], ['free', 7], ['free', 9]]), [0, -1, 2, 0])
})

test('2502 frames point at real python lines', () => {
  for (const f of buildTrace(parseInput('{"n":4,"ops":[["allocate",2,1],["free",1]]}')).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2502 rejects invalid operations', () => {
  assert.throws(() => parseInput('{"n":4,"ops":[["grow",1]]}'))
})

// Oracle: a plain array simulation of the statement's rules, written independently.
function oracle(n, ops) {
  const m = Array(n).fill(0)
  return ops.map(op => {
    if (op[0] === 'allocate') {
      for (let s = 0; s + op[1] <= n; s++) {
        let ok = true
        for (let k = s; k < s + op[1]; k++) if (m[k] !== 0) { ok = false; break }
        if (ok) { for (let k = s; k < s + op[1]; k++) m[k] = op[2]; return s }
      }
      return -1
    }
    let c = 0
    for (let k = 0; k < n; k++) if (m[k] === op[1]) { m[k] = 0; c++ }
    return c
  })
}

test('2502 random sequences match an oracle', () => {
  let seed = 2502
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % k }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(12)
    const ops = Array.from({ length: 1 + rnd(12) }, () => rnd(3) === 0 ? ['free', 1 + rnd(3)] : ['allocate', 1 + rnd(4), 1 + rnd(3)])
    assert.deepEqual(run(n, ops), oracle(n, ops), JSON.stringify({ n, ops }))
  }
})
