import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = digits => buildTrace(parseInput(JSON.stringify({ digits }))).result

test('1363 worked examples', () => {
  assert.equal(solve([8, 1, 9]), '981')
  assert.equal(solve([8, 6, 7, 1, 0]), '8760')
  assert.equal(solve([1]), '')
  assert.equal(solve([0, 0, 0, 0, 0, 0]), '0')
})

// Independent oracle: try every subset whose digit sum is divisible by 3, arrange it largest-first.
function oracle(digits) {
  let best = ''
  for (let mask = 1; mask < 1 << digits.length; mask++) {
    const picked = digits.filter((_, i) => mask & (1 << i))
    if (picked.reduce((a, b) => a + b, 0) % 3) continue
    const s = [...picked].sort((a, b) => b - a).join('')
    if (s.length > best.length || (s.length === best.length && s > best)) best = s
  }
  return best && /^0+$/.test(best) ? '0' : best
}

test('1363 random digit lists match a subset oracle', () => {
  let seed = 1363
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const digits = Array.from({ length: 1 + rnd(7) }, () => rnd(10))
    assert.equal(solve(digits), oracle(digits), JSON.stringify(digits))
  }
})
