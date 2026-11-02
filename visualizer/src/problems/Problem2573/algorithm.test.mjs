import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = lcp => buildTrace({ lcp }).result

// The LCP table of a word, computed directly from its suffixes.
function lcpOf(word) {
  const n = word.length
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => {
    let k = 0
    while (i + k < n && j + k < n && word[i + k] === word[j + k]) k++
    return k
  }))
}

test('2573 worked examples', () => {
  assert.equal(solve([[3, 0, 1], [0, 2, 0], [1, 0, 1]]), 'aba')
  assert.equal(solve([[2, 2], [2, 2]]), '')
  assert.equal(solve([[1]]), 'a')
})

test('2573 the result has exactly the given LCP table', () => {
  const lcp = [[3, 0, 1], [0, 2, 0], [1, 0, 1]]
  assert.deepEqual(lcpOf(solve(lcp)), lcp)
})

test('2573 rejects a non-square or out-of-range matrix', () => {
  assert.throws(() => parseInput('{"lcp":[[1,0]]}'))
  assert.throws(() => parseInput('{"lcp":[[9]]}'))
})

test('2573 frames point at executable python lines', () => {
  const lines = python.split('\n').length
  const { frames } = buildTrace({ lcp: [[3, 0, 1], [0, 2, 0], [1, 0, 1]] })
  for (const frame of frames) {
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= lines, JSON.stringify(frame))
  }
})

// Independent oracle: try every word over an alphabet of size n (enough letters for any valid word).
function oracle(lcp) {
  const n = lcp.length
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.slice(0, n)
  const total = n ** n
  for (let code = 0; code < total; code++) {
    let x = code
    let word = ''
    for (let i = 0; i < n; i++) {
      word += alphabet[x % n]
      x = Math.floor(x / n)
    }
    const table = lcpOf(word)
    if (table.every((row, i) => row.every((v, j) => v === lcp[i][j]))) return true
  }
  return false
}

test('2573 random tables agree with a word brute force', () => {
  let seed = 2573
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(4)
    let lcp
    if (rnd(2) === 0) {
      const word = Array.from({ length: n }, () => 'ab'[rnd(2)]).join('')
      lcp = lcpOf(word)
    } else {
      lcp = Array.from({ length: n }, () => Array.from({ length: n }, () => rnd(n + 1)))
    }
    const result = solve(lcp)
    assert.equal(result !== '', oracle(lcp), JSON.stringify(lcp))
    if (result !== '') assert.deepEqual(lcpOf(result), lcp, JSON.stringify(lcp))
  }
})
