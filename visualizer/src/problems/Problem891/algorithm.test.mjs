import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = a => buildTrace(parseInput(JSON.stringify(a)))
const MOD = 1000000007n

function brute(nums) {
  let total = 0n
  const n = nums.length
  for (let mask = 1; mask < (1 << n); mask++) {
    let lo = Infinity, hi = -Infinity
    for (let i = 0; i < n; i++) if (mask & (1 << i)) { lo = Math.min(lo, nums[i]); hi = Math.max(hi, nums[i]) }
    total += BigInt(hi - lo)
  }
  return Number(total % MOD)
}

test('official examples', () => {
  assert.equal(run([2, 1, 3]).result, 6)
  assert.equal(run([2]).result, 0)
})

test('matches subset enumeration', () => {
  let seed = 21
  const rnd = m => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const nums = Array.from({ length: n }, () => 1 + rnd(t % 2 ? 100000 : 10))
    const trace = run(nums)
    assert.equal(trace.result, brute(nums), JSON.stringify(nums))
    assert.equal(trace.frames.at(-1).phase, 'done')
  }
})

test('large n stays correct modulo p (exact BigInt formula)', () => {
  const nums = Array.from({ length: 200 }, (_, i) => ((i * 7919) % 100000) + 1)
  const s = [...nums].sort((a, b) => a - b)
  let total = 0n
  for (let i = 0; i < s.length; i++) total += BigInt(s[i]) * (2n ** BigInt(i) - 2n ** BigInt(s.length - 1 - i))
  assert.equal(BigInt(run(nums).result), ((total % MOD) + MOD) % MOD)
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[100001]'))
  assert.throws(() => parseInput('"a"'))
})
