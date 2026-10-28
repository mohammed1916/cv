import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2901 examples', () => {
  // ab, ac, bc: each neighbour pair differs in one letter and the groups alternate.
  assert.equal(solve({ words: ['ab', 'ac', 'bc'], groups: [0, 1, 0] }).length, 3)
  assert.equal(solve({ words: ['a', 'b', 'c', 'd'], groups: [1, 0, 1, 0] }).length, 4)
})

test('2901 words that differ in length cannot be chained', () => {
  assert.deepEqual(solve({ words: ['ab', 'abc'], groups: [0, 1] }).length, 1)
})

test('2901 rejects a group other than 0 or 1', () => {
  assert.throws(() => parseInput('{"words":["a","b"],"groups":[0,3]}'))
})

// Independent oracle: the best length over every subset of indices whose consecutive pairs satisfy both rules.
function oracleLength({ words, groups }) {
  const n = words.length
  let best = 0
  for (let mask = 1; mask < 1 << n; mask++) {
    const picked = []
    for (let i = 0; i < n; i++) if ((mask >> i) & 1) picked.push(i)
    const ok = picked.every((idx, k) => {
      if (k === 0) return true
      const a = picked[k - 1]
      const b = idx
      if (groups[a] === groups[b] || words[a].length !== words[b].length) return false
      let diff = 0
      for (let c = 0; c < words[a].length; c++) if (words[a][c] !== words[b][c]) diff++
      return diff === 1
    })
    if (ok) best = Math.max(best, picked.length)
  }
  return best
}

// The returned words must come from some increasing choice of indices that satisfies both rules.
function realizable(chain, { words, groups }) {
  const linked = (a, b) => {
    if (a.word === undefined) return true
    return groups[a.i] !== groups[b.i] && words[a.i].length === words[b.i].length && [...words[a.i]].filter((c, k) => c !== words[b.i][k]).length === 1
  }
  const go = (pos, from, last) => {
    if (pos === chain.length) return true
    for (let i = from; i < words.length; i++) {
      if (words[i] !== chain[pos]) continue
      if (last !== null && !linked(last, { i })) continue
      if (go(pos + 1, i + 1, { word: chain[pos], i })) return true
    }
    return false
  }
  return go(0, 0, null)
}

test('2901 random inputs: optimal length and a realisable chain', () => {
  let seed = 2901
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'ab'
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(3)
    const n = 1 + rnd(8)
    const words = Array.from({ length: n }, () => Array.from({ length: len }, () => letters[rnd(2)]).join(''))
    const groups = words.map(() => rnd(2))
    const input = { words, groups }
    const chain = solve(input)
    assert.equal(chain.length, oracleLength(input), JSON.stringify(input))
    assert.ok(realizable(chain, input), JSON.stringify(input))
  }
})
