import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2698 official examples', () => {
  assert.equal(solve({ n: 10 }), 182)
  assert.equal(solve({ n: 37 }), 1478)
})

test('2698 smallest input and a square that needs a multi-piece cut', () => {
  assert.equal(solve({ n: 1 }), 1)
  // 9 squared is 81, and the pieces 8 and 1 add up to 9, so 81 counts. 3 squared is 9, which does not split to 3.
  assert.equal(solve({ n: 9 }), 1 + 81)
})

test('2698 rejects n outside 1 to 100', () => {
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":101}'))
})

// Independent oracle: try every set of cut positions in the digit string and check each split's sum.
function oracle(n) {
  let total = 0
  for (let i = 1; i <= n; i++) {
    const s = String(i * i)
    let ok = false
    for (let mask = 0; mask < 2 ** (s.length - 1) && !ok; mask++) {
      let sum = 0
      let part = ''
      for (let p = 0; p < s.length; p++) {
        part += s[p]
        if (p === s.length - 1 || (mask >> p) & 1) {
          sum += Number(part)
          part = ''
        }
      }
      if (sum === i) ok = true
    }
    if (ok) total += i * i
  }
  return total
}

test('2698 random limits match a cut-mask oracle', () => {
  let seed = 2698
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 60; t++) {
    const n = 1 + rnd(100)
    assert.equal(solve({ n }), oracle(n), `n=${n}`)
  }
})
