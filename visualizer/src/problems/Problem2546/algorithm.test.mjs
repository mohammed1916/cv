import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, target) => buildTrace(parseInput(JSON.stringify({ s, target }))).result

test('2546 official examples', () => {
  assert.equal(solve('1010', '0110'), true)
  assert.equal(solve('11', '00'), false)
})

test('2546 edge cases', () => {
  assert.equal(solve('000', '000'), true)
  assert.equal(solve('000', '100'), false)
  assert.equal(solve('1', '0'), false)
})

test('2546 rejects mismatched lengths and non-binary characters', () => {
  assert.throws(() => parseInput('{"s":"10","target":"1"}'))
  assert.throws(() => parseInput('{"s":"12","target":"10"}'))
})

// Independent oracle: breadth-first search over every string reachable from s by the simultaneous operation.
function oracle(s, target) {
  const n = s.length
  const seen = new Set([s])
  const queue = [s]
  for (let h = 0; h < queue.length; h++) {
    const cur = queue[h]
    if (cur === target) return true
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue
        const a = cur[i] === '1' ? 1 : 0
        const b = cur[j] === '1' ? 1 : 0
        const arr = cur.split('')
        arr[i] = String(a | b)
        arr[j] = String(a ^ b)
        const next = arr.join('')
        if (!seen.has(next)) { seen.add(next); queue.push(next) }
      }
    }
  }
  return false
}

test('2546 all short string pairs match a breadth-first search', () => {
  const strings = []
  for (let v = 0; v < 16; v++) strings.push(v.toString(2).padStart(4, '0'))
  for (const s of strings) for (const target of strings) {
    assert.equal(solve(s, target), oracle(s, target), `${s} -> ${target}`)
  }
})
