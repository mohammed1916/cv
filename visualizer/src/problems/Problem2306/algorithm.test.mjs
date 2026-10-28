import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2306 official examples', () => {
  assert.equal(solve('{"ideas":["coffee","donuts","time","toffee"]}'), 6)
  assert.equal(solve('{"ideas":["lack","back"]}'), 0)
})

test('2306 a swap that makes an existing name is rejected', () => {
  // Swapping "ab" and "cb" gives "cb" and "ab", both already present, so the pair does not count.
  assert.equal(solve('{"ideas":["ab","cb"]}'), 0)
  assert.equal(solve('{"ideas":["ab","cd"]}'), 2)
})

test('2306 rejects duplicate names', () => {
  assert.throws(() => parseInput('{"ideas":["ab","ab"]}'), /distinct/)
})

// Independent oracle: try every ordered pair of names and both swapped results directly.
function oracle(ideas) {
  const set = new Set(ideas)
  let count = 0
  for (const a of ideas) {
    for (const b of ideas) {
      if (a === b) continue
      const newA = b[0] + a.slice(1)
      const newB = a[0] + b.slice(1)
      if (!set.has(newA) && !set.has(newB)) count++
    }
  }
  return count
}

test('2306 random names match an all-ordered-pairs oracle', () => {
  let seed = 2306
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let round = 0; round < 250; round++) {
    const set = new Set()
    const target = 2 + rnd(9)
    while (set.size < target) {
      const len = 2 + rnd(3)
      set.add(Array.from({ length: len }, () => 'abcdef'[rnd(6)]).join(''))
    }
    const ideas = [...set]
    assert.equal(solve(JSON.stringify({ ideas })), oracle(ideas), JSON.stringify(ideas))
  }
})
