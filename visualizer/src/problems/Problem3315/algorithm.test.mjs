import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: scan every candidate x below the prime and take the first one that works.
function oracle(nums) {
  return nums.map(prime => {
    for (let x = 0; x < prime; x++) {
      if ((x | (x + 1)) === prime) return x
    }
    return -1
  })
}

test('3315 official-style examples', () => {
  assert.deepEqual(solve({ nums: [2, 3, 5, 7] }), [-1, 1, 4, 3])
  assert.deepEqual(solve({ nums: [11, 13, 31] }), [9, 12, 15])
})

test('3315 rejects a number that is not prime', () => {
  assert.throws(() => parseInput('{"nums":[15]}'))
})

test('3315 random prime lists match a scanning oracle', () => {
  const primes = []
  for (let n = 2; n <= 1000; n++) if ([...Array(n).keys()].slice(2).every(d => n % d !== 0)) primes.push(n)
  let seed = 3315
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => primes[rnd(primes.length)])
    assert.deepEqual(solve({ nums }), oracle(nums), JSON.stringify(nums))
  }
})
