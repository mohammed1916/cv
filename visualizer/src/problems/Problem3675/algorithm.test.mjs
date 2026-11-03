import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('3675 worked examples', () => {
  assert.equal(solve('yz'), 2)
  assert.equal(solve('a'), 0)
})

test('3675 rejects uppercase and empty input', () => {
  assert.throws(() => parseInput('{"s":"Ab"}'))
  assert.throws(() => parseInput('{"s":""}'))
})

// Oracle: breadth-first search over strings, where an operation advances every copy of one letter.
function oracle(s) {
  const target = 'a'.repeat(s.length)
  const dist = new Map([[s, 0]])
  const queue = [s]
  for (let h = 0; h < queue.length; h++) {
    const cur = queue[h]
    if (cur === target) return dist.get(cur)
    for (const c of new Set(cur)) {
      const next = [...cur].map(ch => (ch === c ? String.fromCharCode(((ch.charCodeAt(0) - 97 + 1) % 26) + 97) : ch)).join('')
      if (!dist.has(next)) { dist.set(next, dist.get(cur) + 1); queue.push(next) }
    }
  }
  return -1
}

test('3675 matches the breadth-first oracle on short strings', () => {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  for (const x of letters) {
    for (const y of letters) {
      const s = x + y
      assert.equal(solve(s), oracle(s), `s=${s}`)
    }
  }
  for (const x of 'abcxyz') assert.equal(solve(x), oracle(x), `s=${x}`)
})
