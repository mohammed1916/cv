import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3621 official examples', () => {
  assert.equal(solve({ n: 4, k: 1 }), 2)
  assert.equal(solve({ n: 7, k: 2 }), 3)
})

test('3621 k = 0 counts only the number 1', () => {
  assert.equal(solve({ n: 1, k: 0 }), 1)
  assert.equal(solve({ n: 9, k: 0 }), 1)
})

test('3621 rejects k above 5 and n below 1', () => {
  assert.throws(() => parseInput('{"n":4,"k":6}'))
  assert.throws(() => parseInput('{"n":0,"k":1}'))
})

// Independent oracle: compute the depth of every integer from 1 to n by direct simulation.
function oracle(n, k) {
  const depth = x => { let d = 0; let v = x; while (v !== 1) { v = v.toString(2).split('').filter(b => b === '1').length; d++ } return d }
  let count = 0
  for (let x = 1; x <= n; x++) if (depth(x) === k) count++
  return count
}

test('3621 random bounds match a direct-simulation oracle', () => {
  let seed = 3621
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(3000)
    const k = rnd(4)
    assert.equal(solve({ n, k }), oracle(n, k), `n=${n} k=${k}`)
  }
})
