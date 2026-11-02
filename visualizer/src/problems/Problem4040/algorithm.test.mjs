import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python, code, reachableOptions } from './algorithm.js'

const solve = (nums, sum) => buildTrace({ nums, sum }).answer

test('4040 worked examples', () => {
  // 3 doubled once is 6, cost 1.
  assert.equal(solve([3, 7], 6), 1)
  // 5 + 5 already makes 10 with no operations.
  assert.equal(solve([5, 5], 10), 0)
  // 4 doubled once is 8, cost 1.
  assert.equal(solve([4, 3], 8), 1)
  // Two powers of two cannot add to 7.
  assert.equal(solve([1, 2], 7), -1)
})

test('4040 options: doublings before halvings', () => {
  // From 3: 3 (0), 6 (1), 12 (2), 1 (1 halving), 0 is dropped.
  const options = reachableOptions(3, 12)
  assert.equal(options.get(3), 0)
  assert.equal(options.get(6), 1)
  assert.equal(options.get(12), 2)
  assert.equal(options.get(1), 1)
})

test('4040 parse and visualization caps', () => {
  assert.throws(() => parseInput('{"nums":[],"sum":1}'))
  assert.throws(() => parseInput('{"nums":[501],"sum":1}'))
  assert.throws(() => parseInput('{"nums":[1],"sum":5001}'))
  assert.throws(() => buildTrace({ nums: [1, 2, 3, 4, 5, 6, 7], sum: 3 }))
  assert.throws(() => buildTrace({ nums: [1], sum: 25 }))
})

// Independent oracle. Step 1: enumerate every legal operation sequence (doublings, then halvings) by
// breadth-first search on (value, phase). Step 2: try every subset with every reachable value by recursion.
function oracle(nums, sum) {
  const options = nums.map(v => {
    const best = new Map()
    const queue = [{ value: v, phase: 0, cost: 0 }]
    const seen = new Set([`${v},0`])
    while (queue.length) {
      const { value, phase, cost } = queue.shift()
      if (value >= 1 && value <= sum && (!best.has(value) || cost < best.get(value))) best.set(value, cost)
      if (cost >= 8) continue
      const next = []
      if (phase === 0) next.push({ value: value * 2, phase: 0 })
      next.push({ value: Math.floor(value / 2), phase: 1 })
      for (const n of next) {
        if (n.value > 64) continue
        const key = `${n.value},${n.phase}`
        if (seen.has(key)) continue
        seen.add(key)
        queue.push({ value: n.value, phase: n.phase, cost: cost + 1 })
      }
    }
    return best
  })
  const INF = Infinity
  function go(i, remaining) {
    if (remaining === 0) return 0
    if (i === nums.length) return INF
    let bestCost = go(i + 1, remaining)
    for (const [w, cost] of options[i]) {
      if (w <= remaining) bestCost = Math.min(bestCost, cost + go(i + 1, remaining - w))
    }
    return bestCost
  }
  const result = go(0, sum)
  return result === INF ? -1 : result
}

test('4040 random small inputs match the enumeration oracle', () => {
  let seed = 4040
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(3) }, () => 1 + rnd(8))
    const sum = 1 + rnd(12)
    assert.equal(solve(nums, sum), oracle(nums, sum), JSON.stringify({ nums, sum }))
  }
})

test('4040 frame invariants', () => {
  const codeLines = new Set(code.map(c => c.line))
  const pyLines = python.split('\n').length
  for (const frame of buildTrace({ nums: [3, 7], sum: 6 }).frames) {
    assert.ok(codeLines.has(frame.activeLine), `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, `pythonLine ${frame.pythonLine}`)
    assert.equal(typeof frame.message, 'string')
  }
})

test('4040 python export runs on the first example', () => {
  const out = execFileSync('python3', ['-I', '-c', python], { input: '{"nums":[3,7],"sum":6}' }).toString().trim()
  assert.equal(out, '1')
})
