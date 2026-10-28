import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2605 official examples', () => {
  assert.equal(solve('{"nums1":[4,1,3],"nums2":[5,7]}'), 15)
  assert.equal(solve('{"nums1":[3,5,2,6],"nums2":[3,1,7]}'), 3)
})

test('2605 with no shared digit, the order of the two smallest digits matters', () => {
  assert.equal(solve('{"nums1":[9],"nums2":[2]}'), 29)
  assert.equal(solve('{"nums1":[2],"nums2":[9]}'), 29)
})

test('2605 rejects a repeated digit within a list', () => {
  assert.throws(() => parseInput('{"nums1":[1,1],"nums2":[2]}'))
})

// Independent oracle: the answer is the smallest number from 1 to 99 whose digits touch both lists.
function oracle(nums1, nums2) {
  for (let x = 1; x <= 99; x++) {
    const digits = String(x).split('').map(Number)
    if (digits.some(d => nums1.includes(d)) && digits.some(d => nums2.includes(d))) return x
  }
  return -1
}

test('2605 random digit lists match a scan-from-one oracle', () => {
  let seed = 2605
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const pick = () => {
    const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    const out = []
    for (let i = 0, count = 1 + rnd(5); i < count; i++) out.push(pool.splice(rnd(pool.length), 1)[0])
    return out
  }
  for (let round = 0; round < 300; round++) {
    const nums1 = pick(), nums2 = pick()
    assert.equal(solve(JSON.stringify({ nums1, nums2 })), oracle(nums1, nums2), JSON.stringify({ nums1, nums2 }))
  }
})
