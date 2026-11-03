import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(s)).result

test('1544 sample inputs give the expected strings', () => {
  assert.equal(solve('abBAcC'), '')
  assert.equal(solve('xXyYzq'), 'zq')
  assert.equal(solve('aBcD'), 'aBcD')
  assert.equal(solve('s'), 's')
})

test('1544 rejects malformed input', () => {
  assert.throws(() => parseInput('ab cd'), /letters/)
  assert.throws(() => parseInput(''), /letters/)
})

// Oracle: remove any adjacent opposite-case pair until none remains.
function brute(s) {
  let cur = s
  let changed = true
  while (changed) {
    changed = false
    for (let i = 0; i + 1 < cur.length; i++) {
      const a = cur[i]
      const b = cur[i + 1]
      if (a !== b && a.toLowerCase() === b.toLowerCase()) {
        cur = cur.slice(0, i) + cur.slice(i + 2)
        changed = true
        break
      }
    }
  }
  return cur
}

test('1544 random strings match a repeated-removal oracle', () => {
  let seed = 4
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const alphabet = 'aAbBcC'
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(20)
    const s = Array.from({ length: len }, () => alphabet[rnd(alphabet.length)]).join('')
    assert.equal(solve(s), brute(s), s)
  }
})
