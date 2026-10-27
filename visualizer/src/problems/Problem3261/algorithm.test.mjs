import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3261 official example', () => {
  assert.deepEqual(solve({ s: '0001111', k: 2, queries: [[0, 6]] }), [26])
})

test('3261 rejects a query outside the string', () => {
  assert.throws(() => parseInput('{"s":"0101","k":1,"queries":[[0,4]]}'))
})

// Independent oracle: test every substring of the query range by counting its characters.
function oracle({ s, k, queries }) {
  return queries.map(([l, r]) => {
    let count = 0
    for (let i = l; i <= r; i++) {
      for (let j = i; j <= r; j++) {
        const part = s.slice(i, j + 1)
        const zeros = [...part].filter(c => c === '0').length
        const ones = part.length - zeros
        if (zeros <= k || ones <= k) count++
      }
    }
    return count
  })
}

test('3261 seeded random cases match substring enumeration', () => {
  let seed = 3261
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const length = 1 + rnd(10)
    let s = ''
    for (let i = 0; i < length; i++) s += String(rnd(2))
    const queries = Array.from({ length: 1 + rnd(3) }, () => { const a = rnd(length), b = rnd(length); return [Math.min(a, b), Math.max(a, b)] })
    const input = { s, k: rnd(length + 1), queries }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
