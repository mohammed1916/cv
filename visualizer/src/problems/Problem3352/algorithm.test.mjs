import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3352 examples', () => {
  assert.equal(solve({ s: '111', k: 1 }), 3)
  assert.equal(solve({ s: '1000', k: 2 }), 6)
})

test('3352 rejects a leading zero', () => {
  assert.throws(() => parseInput('{"s":"0101","k":1}'))
})

// Independent oracle: test every x below N by applying the popcount operation directly.
function oracle({ s, k }) {
  const N = parseInt(s, 2)
  let count = 0
  for (let x = 1; x < N; x++) {
    let v = x
    let ops = 0
    while (v !== 1) {
      v = v.toString(2).split('').filter(c => c === '1').length
      ops++
    }
    if (ops <= k) count++
  }
  return count
}

test('3352 random inputs match a direct simulation', () => {
  let seed = 3352
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const bits = 1 + rnd(11)
    let s = '1'
    for (let i = 1; i < bits; i++) s += String(rnd(2))
    const k = 1 + rnd(6)
    assert.equal(solve({ s, k }), oracle({ s, k }), `${s} ${k}`)
  }
})
