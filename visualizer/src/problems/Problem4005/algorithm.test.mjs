import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, planFor, costBetween, python, code, phases } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('4005 hand-computed cases', () => {
  // Target 8: 4 × 2, 16 ÷ 2, 7 needs 2, total 4; the common multiple 112 also costs 4.
  assert.equal(solve([4, 8, 16, 7]), 4)
  // Target 9: 4 and 5 each need 2, total 4; a common multiple would cost 5.
  assert.equal(solve([9, 9, 9, 4, 5]), 4)
  // Common multiple 30: 1 × 30, 6 × 5, 10 × 3, total 3.
  assert.equal(solve([1, 6, 10]), 3)
  // Target 3: 3 × ... 9 ÷ 3, 27 ÷ 9.
  assert.equal(solve([3, 9, 27]), 2)
  assert.equal(solve([11, 11]), 0)
  assert.equal(solve([1, 1, 1]), 0)
  assert.equal(solve([13]), 0)
})

test('4005 target 1 is not available unless all elements are 1', () => {
  // Target 1 would look like cost 1, but 2 cannot be divided to 1. Target 2 costs 1.
  assert.equal(solve([1, 2]), 1)
  // 1 × 6 and 6 stays.
  assert.equal(solve([1, 1, 6]), 2)
  const { frames } = buildTrace({ nums: [1, 2] })
  assert.ok(frames.some(f => f.phase === 'exclude'))
  assert.ok(!buildTrace({ nums: [1, 1] }).frames.some(f => f.phase === 'exclude'))
})

test('4005 handles the largest values', () => {
  assert.equal(solve([1000000000, 999999937]), 2)
  assert.equal(solve([1000000000, 500000000]), 1)
})

test('4005 parseInput enforces bounds', () => {
  assert.doesNotThrow(() => parseInput('{"nums":[1,1000000000]}'))
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[0]}'))
  assert.throws(() => parseInput('{"nums":[1000000001]}'))
  assert.throws(() => parseInput('{"nums":[1.5]}'))
  assert.throws(() => parseInput(JSON.stringify({ nums: Array(13).fill(1) })))
})

// A legal operation: multiply by k >= 2, or divide exactly by 2 <= k < x.
function checkOp(op) {
  const from = BigInt(op.from), k = BigInt(op.k), to = BigInt(op.to)
  assert.ok(k >= 2n)
  if (op.kind === '×') assert.equal(from * k, to)
  else { assert.ok(k < from); assert.equal(from % k, 0n); assert.equal(from / k, to) }
}

test('4005 planned operations are legal, reach the target and match the answer', () => {
  let seed = 40051
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(40))
    const run = buildTrace({ nums })
    const last = run.frames.at(-1)
    let total = 0
    last.plan.forEach((ops, i) => {
      total += ops.length
      let at = String(nums[i])
      for (const op of ops) { assert.equal(op.from, at); checkOp(op); at = op.to }
      assert.equal(at, last.target)
    })
    assert.equal(total, run.result, JSON.stringify(nums))
    assert.ok(last.values.every(v => v === last.target))
  }
})

test('4005 planFor uses at most two operations for coprime values', () => {
  const ops = planFor(4, 9)
  assert.equal(ops.length, 2)
  ops.forEach(checkOp)
  assert.deepEqual(planFor(5, 5), [])
  assert.equal(costBetween(4, 9), 2)
  assert.equal(costBetween(3, 9), 1)
  assert.equal(costBetween(9, 9), 0)
})

// Oracle: breadth-first search over integers using the raw operation rules, trying every target up to a limit.
function oracle(nums) {
  const lcm = nums.reduce((acc, x) => { const g = (a, b) => (b ? g(b, a % b) : a); return acc / g(acc, x) * x }, 1)
  const limit = Math.max(lcm, 60)
  const distanceFrom = source => {
    const dist = new Int32Array(limit + 1).fill(-1)
    dist[source] = 0
    let layer = [source]
    while (layer.length) {
      const next = []
      for (const x of layer) {
        for (let y = x * 2; y <= limit; y += x) if (dist[y] < 0) { dist[y] = dist[x] + 1; next.push(y) }
        for (let k = 2; k * k <= x; k++) if (x % k === 0) {
          for (const kk of [k, x / k]) { if (kk < x) { const y = x / kk; if (dist[y] < 0) { dist[y] = dist[x] + 1; next.push(y) } } }
        }
      }
      layer = next
    }
    return dist
  }
  const tables = nums.map(distanceFrom)
  let best = Infinity
  for (let t = 1; t <= limit; t++) {
    let sum = 0
    for (const d of tables) { if (d[t] < 0) { sum = Infinity; break } sum += d[t] }
    if (sum < best) best = sum
  }
  return best
}

test('4005 random small arrays match a raw-rule search', () => {
  let seed = 4005
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const nums = Array.from({ length: 1 + rnd(5) }, () => 1 + rnd(12))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('4005 each priced row sums to its formula cost', () => {
  const nums = [6, 6, 12, 8, 3, 5]
  const last = buildTrace({ nums }).frames.at(-1)
  for (const row of last.rows) {
    if (row.excluded) continue
    const sum = last.distinct.reduce((s, x, i) => s + row.costs[i] * last.freq[i], 0)
    assert.equal(sum, row.total)
  }
})

test('4005 frames are well formed', () => {
  const pyLines = python.trim().split('\n')
  const ids = new Set(phases.map(p => p.id))
  for (const nums of [[4, 8, 16, 7], [1, 6, 10], [1, 1, 1], [1000000000, 999999937]]) {
    const { frames } = buildTrace({ nums })
    for (const f of frames) {
      assert.ok(ids.has(f.phase), f.phase)
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines.length)
      assert.ok(pyLines[f.pythonLine - 1].trim().length > 0)
      assert.ok(f.message.length > 0)
    }
    assert.equal(frames.at(-1).phase, 'done')
  }
})
