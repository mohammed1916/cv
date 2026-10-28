import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3551 official-style examples', () => {
  // 37 has digit sum 10 and 100 has digit sum 1, so one swap puts 100 first.
  assert.equal(solve([37, 100]), 1)
  // Digit sums 3, 3, 3: the target is 3, 12, 21, so 21 and 3 swap once.
  assert.equal(solve([21, 12, 3]), 1)
})

test('3551 already sorted by digit sum needs no swaps', () => {
  assert.equal(solve([1, 2, 3, 4]), 0)
})

test('3551 rejects repeated numbers', () => {
  assert.throws(() => parseInput('{"nums":[5,5]}'))
})

// Independent oracle: breadth-first search over arrangements of the numbers, counting swaps until sorted.
function oracle(nums) {
  const digitSum = x => String(x).split('').reduce((s, c) => s + Number(c), 0)
  const goal = [...nums].sort((a, b) => digitSum(a) - digitSum(b) || a - b).join(',')
  const start = nums.join(',')
  const dist = new Map([[start, 0]])
  const queue = [nums.slice()]
  for (let head = 0; head < queue.length; head++) {
    const cur = queue[head]
    const key = cur.join(',')
    if (key === goal) return dist.get(key)
    for (let i = 0; i < cur.length; i++) {
      for (let j = i + 1; j < cur.length; j++) {
        const next = cur.slice()
        ;[next[i], next[j]] = [next[j], next[i]]
        const nk = next.join(',')
        if (!dist.has(nk)) {
          dist.set(nk, dist.get(key) + 1)
          queue.push(next)
        }
      }
    }
  }
  return -1
}

test('3551 random arrangements match a swap-search oracle', () => {
  let seed = 3551
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const size = 1 + rnd(6)
    const pool = new Set()
    while (pool.size < size) pool.add(1 + rnd(120))
    const nums = [...pool]
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
