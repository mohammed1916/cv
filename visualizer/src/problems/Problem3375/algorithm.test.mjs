import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3375 official examples', () => {
  assert.equal(solve({ nums: [5, 2, 5, 4, 5], k: 2 }), 2)
  assert.equal(solve({ nums: [2, 2, 2], k: 2 }), 0)
})

test('3375 a value below k makes it impossible', () => {
  assert.equal(solve({ nums: [3, 1], k: 2 }), -1)
})

test('3375 rejects k out of range', () => {
  assert.throws(() => parseInput('{"nums": [1, 2], "k": 0}'))
})

// Independent oracle: breadth-first search over arrays. A move picks h and lowers every value above h to h,
// allowed only when all values above h are identical. The goal is all values equal to k.
function oracle({ nums, k }) {
  const maxV = Math.max(k, ...nums)
  const key = arr => arr.join(',')
  const start = [...nums]
  const dist = new Map([[key(start), 0]])
  const queue = [start]
  for (let head = 0; head < queue.length; head++) {
    const arr = queue[head]
    const d = dist.get(key(arr))
    if (arr.every(v => v === k)) return d
    for (let h = 0; h <= maxV; h++) {
      const above = arr.filter(v => v > h)
      if (above.length === 0 || above.some(v => v !== above[0])) continue
      const next = arr.map(v => (v > h ? h : v))
      if (!dist.has(key(next))) {
        dist.set(key(next), d + 1)
        queue.push(next)
      }
    }
  }
  return -1
}

test('3375 random arrays match a breadth-first oracle', () => {
  let seed = 3375
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(5) }, () => 1 + rnd(6))
    const k = 1 + rnd(3)
    assert.equal(solve({ nums, k }), oracle({ nums, k }), JSON.stringify({ nums, k }))
  }
})
