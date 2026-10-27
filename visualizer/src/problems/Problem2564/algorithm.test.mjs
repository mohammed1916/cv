import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2564 official examples', () => {
  assert.deepEqual(solve({ s: '101101', queries: [[0, 5], [1, 2]] }), [[0, 2], [2, 3]])
  assert.deepEqual(solve({ s: '0101', queries: [[12, 8]] }), [[-1, -1]])
})

test('2564 a zero target uses a lone zero and the leftmost shortest match wins', () => {
  assert.deepEqual(solve({ s: '10', queries: [[3, 3]] }), [[1, 1]])
  // Both "1" at index 0 and "1" at index 2 are length 1; the leftmost is returned.
  assert.deepEqual(solve({ s: '1011', queries: [[4, 5]] }), [[0, 0]])
})

test('2564 rejects a non-binary string', () => {
  assert.throws(() => parseInput(JSON.stringify({ s: '1021', queries: [[0, 1]] })))
})

// Independent oracle: enumerate every substring (leading zeros allowed), parse it with Number
// and a radix, and take the shortest, then leftmost, that equals first xor second.
function oracle({ s, queries }) {
  return queries.map(([first, second]) => {
    const target = first ^ second
    let answer = [-1, -1]
    let bestLength = Infinity
    for (let l = 0; l < s.length; l++) {
      for (let r = l; r < s.length; r++) {
        const length = r - l + 1
        if (Number(parseInt(s.slice(l, r + 1), 2)) === target && (length < bestLength)) {
          bestLength = length
          answer = [l, r]
        }
      }
    }
    return answer
  })
}

test('2564 random strings match an every-substring oracle', () => {
  let seed = 2564
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(12)
    let s = ''
    for (let i = 0; i < length; i++) s += rnd(2) ? '1' : '0'
    const queries = Array.from({ length: 1 + rnd(4) }, () => [rnd(32), rnd(32)])
    const input = { s, queries }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
