import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: breadth-first search over arrangements, one adjacent swap per step.
function oracle({ nums, k }) {
  const start = nums.join('')
  const hasRun = s => s.includes('1'.repeat(k))
  let frontier = [start]
  const seen = new Set([start])
  for (let dist = 0; frontier.length; dist++) {
    if (frontier.some(hasRun)) return dist
    const next = []
    for (const s of frontier) {
      for (let i = 0; i + 1 < s.length; i++) {
        if (s[i] === s[i + 1]) continue
        const t = s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2)
        if (!seen.has(t)) { seen.add(t); next.push(t) }
      }
    }
    frontier = next
  }
  return -1
}

test('1703 examples', () => {
  assert.equal(solve({ nums: [1, 0, 0, 1, 0, 1], k: 2 }), 1)
  assert.equal(solve({ nums: [1, 0, 0, 0, 0, 0, 1, 1], k: 3 }), 5)
  assert.equal(solve({ nums: [1, 1, 0, 1], k: 2 }), 0)
})

test('1703 rejects k larger than the number of ones', () => {
  assert.throws(() => parseInput('{"nums":[1,0,0],"k":2}'))
})

test('1703 random arrays match a breadth-first search oracle', () => {
  let seed = 1703
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 300 && checked < 200; t++) {
    const len = 1 + rnd(10)
    const nums = Array.from({ length: len }, () => rnd(2))
    const ones = nums.filter(v => v === 1).length
    if (ones === 0) continue
    const k = 1 + rnd(ones)
    checked++
    assert.equal(solve({ nums, k }), oracle({ nums, k }), JSON.stringify({ nums, k }))
  }
})
