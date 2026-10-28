import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1146 official style sequence returns snapshot ids and the saved value', () => {
  assert.deepEqual(solve({ length: 3, ops: [['set', 0, 5], ['snap'], ['set', 0, 6], ['get', 0, 0]] }), [0, 5])
  assert.deepEqual(solve({ length: 2, ops: [['snap'], ['set', 1, 7], ['snap'], ['get', 1, 0], ['get', 1, 1]] }), [0, 1, 0, 7])
})

test('1146 two sets before one snapshot keep only the last value', () => {
  assert.deepEqual(solve({ length: 1, ops: [['set', 0, 3], ['set', 0, 9], ['snap'], ['get', 0, 0]] }), [0, 9])
})

test('1146 rejects a get on a snapshot that was never taken', () => {
  assert.throws(() => parseInput('{"length":2,"ops":[["get",0,0]]}'))
  assert.throws(() => parseInput('{"length":2,"ops":[["set",2,1]]}'))
})

// Independent oracle: copy the whole array at every snapshot and read the copies directly.
function oracle({ length, ops }) {
  const current = Array(length).fill(0)
  const copies = []
  const out = []
  for (const op of ops) {
    if (op[0] === 'set') current[op[1]] = op[2]
    else if (op[0] === 'snap') {
      copies.push([...current])
      out.push(copies.length - 1)
    } else out.push(copies[op[2]][op[1]])
  }
  return out
}

test('1146 random operation lists match a copy-per-snapshot oracle', () => {
  let seed = 1146
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(5)
    const ops = []
    let snaps = 0
    for (let k = 0; k < 1 + rnd(12); k++) {
      const kind = rnd(3)
      if (kind === 0 || (kind === 2 && snaps === 0)) ops.push(['set', rnd(length), rnd(51)])
      else if (kind === 1) {
        ops.push(['snap'])
        snaps += 1
      } else ops.push(['get', rnd(length), rnd(snaps)])
    }
    const input = { length, ops }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
