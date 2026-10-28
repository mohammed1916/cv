import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = possible => buildTrace(parseInput(JSON.stringify({ possible }))).result

test('3096 examples where Alice gains and where she never does', () => {
  assert.equal(solve([1, 0, 1, 0]), 1)
  assert.equal(solve([1, 1, 1, 1, 1]), 3)
  assert.equal(solve([0, 0]), -1)
})

test('3096 a tie does not count as gaining more points', () => {
  assert.equal(solve([1, 1]), -1)
})

test('3096 rejects an entry other than 0 or 1', () => {
  assert.throws(() => parseInput('{"possible":[1,2]}'))
})

// Independent oracle: sum each player's scores directly for every split.
function oracle(possible) {
  for (let k = 1; k <= possible.length - 1; k++) {
    let alice = 0
    let bob = 0
    possible.forEach((p, i) => {
      const pts = p === 1 ? 1 : -1
      if (i < k) alice += pts
      else bob += pts
    })
    if (alice > bob) return k
  }
  return -1
}

test('3096 seeded random inputs match a direct-sum oracle', () => {
  let seed = 3096
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const possible = Array.from({ length: 2 + rnd(11) }, () => rnd(2))
    assert.equal(solve(possible), oracle(possible), JSON.stringify(possible))
  }
})
