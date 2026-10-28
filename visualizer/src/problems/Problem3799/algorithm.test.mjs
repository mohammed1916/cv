import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = words => buildTrace({ words }).result

test('3799 official examples', () => {
  assert.deepEqual(solve(['able', 'area', 'echo', 'also']), [['able', 'area', 'echo', 'also'], ['area', 'able', 'also', 'echo']])
  assert.deepEqual(solve(['code', 'cafe', 'eden', 'edge']), [])
})

test('3799 edge case: a word square needs four distinct words, not a repeated one', () => {
  assert.deepEqual(solve(['aaaa', 'abba', 'bbbb', 'cccc']), [])
})

test('3799 rejects a repeated word', () => {
  assert.throws(() => parseInput('{"words":["able","able","echo","also"]}'))
})

// Independent oracle: index every word by its first letter, then look up each corner through those indexes.
function oracle(words) {
  const byFirst = new Map()
  words.forEach((w, i) => {
    if (!byFirst.has(w[0])) byFirst.set(w[0], [])
    byFirst.get(w[0]).push(i)
  })
  const out = []
  words.forEach((top, t) => {
    for (const l of byFirst.get(top[0]) || []) {
      if (l === t) continue
      for (const r of byFirst.get(top[3]) || []) {
        if (r === t || r === l) continue
        for (const b of byFirst.get(words[l][3]) || []) {
          if (b === t || b === l || b === r) continue
          if (words[b][3] === words[r][3]) out.push([top, words[l], words[r], words[b]])
        }
      }
    }
  })
  out.sort((a, b) => {
    for (let i = 0; i < 4; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1
    return 0
  })
  return out
}

test('3799 random word sets match an index-lookup oracle', () => {
  let seed = 3799
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const count = rnd(5) + 4
    const set = new Set()
    while (set.size < count) set.add(Array.from({ length: 4 }, () => 'abcd'[rnd(4)]).join(''))
    const words = [...set]
    assert.deepEqual(solve(words), oracle(words), JSON.stringify(words))
  }
})
