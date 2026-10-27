import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2276 official style example', () => {
  assert.deepEqual(solve('[["add",2,3],["add",7,10],["count"],["add",5,8],["count"]]'), [6, 8])
})

test('2276 overlapping and repeated adds count each integer once', () => {
  assert.deepEqual(solve('[["add",1,32],["add",5,9],["count"]]'), [32])
  assert.deepEqual(solve('[["count"],["add",4,4],["add",4,4],["count"]]'), [0, 1])
})

test('2276 rejects a range past 32', () => {
  assert.throws(() => parseInput('[["add",1,33]]'))
})

// Independent oracle: keep a plain set of integers and read its size.
function oracle(ops) {
  const covered = new Set()
  const out = []
  for (const op of ops) {
    if (op[0] === 'add') for (let v = op[1]; v <= op[2]; v++) covered.add(v)
    else out.push(covered.size)
  }
  return out
}

test('2276 random operation lists match a set oracle', () => {
  let seed = 2276
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const ops = []
    for (let k = 1 + rnd(10); k > 0; k--) {
      if (rnd(3) === 0) ops.push(['count'])
      else { const l = 1 + rnd(32); ops.push(['add', l, l + rnd(33 - l)]) }
    }
    assert.deepEqual(solve(JSON.stringify(ops)), oracle(ops), JSON.stringify(ops))
  }
})
