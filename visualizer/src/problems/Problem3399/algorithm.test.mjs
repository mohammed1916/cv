import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: try every set of at most numOps positions to flip and keep the smallest longest run.
function oracle({ s, numOps }) {
  const n = s.length
  let best = n
  for (let mask = 0; mask < 1 << n; mask++) {
    const ones = [...mask.toString(2)].filter(c => c === '1').length
    if (ones > numOps) continue
    let bits = ''
    for (let i = 0; i < n; i++) bits += ((mask >> i) & 1) ? (s[i] === '1' ? '0' : '1') : s[i]
    let longest = 1
    let run = 1
    for (let i = 1; i < n; i++) {
      run = bits[i] === bits[i - 1] ? run + 1 : 1
      longest = Math.max(longest, run)
    }
    best = Math.min(best, longest)
  }
  return best
}

test('3399 official examples', () => {
  assert.equal(solve({ s: '000001', numOps: 1 }), 2)
  assert.equal(solve({ s: '0000', numOps: 2 }), 1)
  assert.equal(solve({ s: '0101', numOps: 0 }), 1)
})

test('3399 no operations and a single character', () => {
  assert.equal(solve({ s: '0011', numOps: 0 }), 2)
  assert.equal(solve({ s: '1', numOps: 0 }), 1)
})

test('3399 rejects bad input', () => {
  assert.throws(() => parseInput('{"s":"012","numOps":1}'))
  assert.throws(() => parseInput('{"s":"0101","numOps":5}'))
  assert.throws(() => parseInput('{"s":"","numOps":0}'))
})

test('3399 random strings match a flip-subset oracle', () => {
  let seed = 3399
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(8)
    const s = Array.from({ length: n }, () => String(rnd(2))).join('')
    const numOps = rnd(n + 1)
    assert.equal(solve({ s, numOps }), oracle({ s, numOps }), JSON.stringify({ s, numOps }))
  }
})
