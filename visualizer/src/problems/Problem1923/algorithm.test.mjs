import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = paths => buildTrace(parseInput(JSON.stringify(paths))).result

test('1923 examples', () => {
  assert.equal(solve([[0, 1, 2, 3, 4], [2, 3, 4], [4, 0, 1, 2, 3]]), 2)
  assert.equal(solve([[0], [1]]), 0)
  assert.equal(solve([[1, 2, 3], [1, 2, 3]]), 3)
  assert.equal(solve([[0, 1, 0, 1], [1, 0, 1, 0], [0, 1, 0, 1, 0]]), 3)
})

test('1923 rejects out-of-range city ids', () => {
  assert.throws(() => parseInput('[[5]]'))
})

// Independent oracle: for each length from the longest down, test every window of path 0 against the other paths.
function oracle(paths) {
  const contains = (p, w) => {
    for (let i = 0; i + w.length <= p.length; i++) if (w.every((v, k) => p[i + k] === v)) return true
    return false
  }
  const shortest = Math.min(...paths.map(p => p.length))
  for (let len = shortest; len >= 1; len--) {
    for (let i = 0; i + len <= paths[0].length; i++) {
      const w = paths[0].slice(i, i + len)
      if (paths.every(p => contains(p, w))) return len
    }
  }
  return 0
}

test('1923 random paths match a window-scan oracle', () => {
  let seed = 1923
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(4)
    const paths = Array.from({ length: m }, () => Array.from({ length: 1 + rnd(8) }, () => rnd(3)))
    assert.equal(solve(paths), oracle(paths), JSON.stringify(paths))
  }
})
