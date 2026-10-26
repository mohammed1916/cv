import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (a, b) => buildTrace(parseInput(JSON.stringify([a, b]))).result

// Oracle: unrestricted BFS over every pair swap.
function oracle(a, b) {
  const seen = new Set([a]); let level = [a]; let d = 0
  while (level.length) {
    if (level.includes(b)) return d
    const next = []
    for (const s of level) for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) {
      const arr = [...s]; [arr[i], arr[j]] = [arr[j], arr[i]]; const t = arr.join('')
      if (!seen.has(t)) { seen.add(t); next.push(t) }
    }
    level = next; d++
  }
  return -1
}

test('official examples', () => {
  assert.equal(solve('ab', 'ba'), 1)
  assert.equal(solve('abc', 'bca'), 2)
  assert.equal(solve('abc', 'abc'), 0)
})

test('matches unrestricted BFS on random anagrams', () => {
  for (let t = 0; t < 300; t++) {
    const n = 1 + Math.floor(Math.random() * 7)
    const a = Array.from({ length: n }, () => 'abcdef'[Math.floor(Math.random() * (1 + t % 6))])
    const b = [...a].sort(() => Math.random() - 0.5)
    assert.equal(solve(a.join(''), b.join('')), oracle(a.join(''), b.join('')))
  }
})

test('trace ends with done', () => {
  const r = buildTrace(parseInput('["abc","bca"]'))
  assert.equal(r.frames[0].phase, 'start')
  assert.equal(r.frames.at(-1).phase, 'done')
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('["ab","cd"]'))
  assert.throws(() => parseInput('["ab","abc"]'))
  assert.throws(() => parseInput('"x"'))
  assert.throws(() => parseInput('["abcdefabc","abcdefabc"]'))
})
