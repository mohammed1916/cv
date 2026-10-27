import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3479 official style examples', () => {
  assert.equal(solve({ fruits: [4, 2, 5], baskets: [3, 5, 4] }), 1)
  assert.equal(solve({ fruits: [3, 6, 1], baskets: [6, 4, 7] }), 0)
  assert.equal(solve({ fruits: [9], baskets: [1, 2, 3] }), 1)
})

test('3479 a basket is used only once', () => {
  assert.equal(solve({ fruits: [2, 2], baskets: [2] }), 1)
  assert.equal(solve({ fruits: [2, 2], baskets: [2, 2] }), 0)
})

test('3479 rejects a capacity above 10', () => {
  assert.throws(() => parseInput('{"fruits":[1],"baskets":[11]}'))
})

// Independent oracle: keep the list of free baskets and remove the first one that fits.
function oracle({ fruits, baskets }) {
  const free = baskets.slice()
  let unplaced = 0
  for (const f of fruits) {
    const idx = free.findIndex(c => c >= f)
    if (idx >= 0) free.splice(idx, 1)
    else unplaced++
  }
  return unplaced
}

test('3479 random inputs match a list-removal oracle', () => {
  let seed = 3479
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = {
      fruits: Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(10)),
      baskets: Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(10)),
    }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
