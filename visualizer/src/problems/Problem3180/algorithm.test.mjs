import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3180 official examples', () => {
  assert.equal(solve('[1,1,3,3]'), 4)
  assert.equal(solve('[1,6,4,3,2]'), 11)
})

test('3180 a reward no larger than the total cannot be taken', () => {
  assert.equal(solve('[5,5,5]'), 5)
  assert.equal(solve('[7]'), 7)
})

test('3180 rejects a value outside 1 to 12', () => {
  assert.throws(() => parseInput('[13]'))
})

// Independent oracle: search every legal sequence of operations directly.
function oracle(values) {
  const used = Array(values.length).fill(false)
  let best = 0
  const search = x => {
    best = Math.max(best, x)
    values.forEach((v, i) => {
      if (!used[i] && v > x) {
        used[i] = true
        search(x + v)
        used[i] = false
      }
    })
  }
  search(0)
  return best
}

test('3180 random rewards match a legal-sequence search', () => {
  let seed = 3180
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const values = Array.from({ length: 1 + rnd(7) }, () => 1 + rnd(12))
    assert.equal(solve(JSON.stringify(values)), oracle(values), JSON.stringify(values))
  }
})
