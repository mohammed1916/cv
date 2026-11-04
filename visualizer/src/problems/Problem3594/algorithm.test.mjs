import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python, code, phases } from './algorithm.js'

const solve = (k, time, mul) => buildTrace({ n: time.length, k, m: mul.length, time, mul }).result

test('3594 hand-computed cases', () => {
  // Together in one trip: 7 × 1.
  assert.equal(solve(2, [3, 7], [1]), 7)
  // One person, stage 0 only: 7 × 0.5.
  assert.equal(solve(3, [7], [0.5, 2]), 3.5)
  // 1 and 4 cross (4), 1 returns (1), 1 and 2 cross (2).
  assert.equal(solve(2, [1, 2, 4], [1]), 7)
  // Direct is 10 × 2 = 20. Person 0 goes (2, stage 2), returns (0.5, stage 2), both go (5).
  assert.equal(solve(2, [1, 10], [2, 1, 0.5]), 7.5)
})

test('3594 impossible only with one seat and several people', () => {
  assert.equal(solve(1, [4, 6, 3], [1, 1.5]), -1)
  assert.equal(solve(1, [10, 20], [1]), -1)
  assert.equal(solve(1, [5], [1]), 5)
})

test('3594 parseInput enforces bounds', () => {
  const good = { n: 2, k: 2, m: 1, time: [1, 2], mul: [1] }
  assert.doesNotThrow(() => parseInput(JSON.stringify(good)))
  assert.throws(() => parseInput(JSON.stringify({ ...good, n: 3 })))
  assert.throws(() => parseInput(JSON.stringify({ ...good, m: 2 })))
  assert.throws(() => parseInput(JSON.stringify({ ...good, mul: [3] })))
  assert.throws(() => parseInput(JSON.stringify({ ...good, time: [0, 2] })))
  assert.throws(() => parseInput(JSON.stringify({ ...good, k: 6 })))
  assert.throws(() => parseInput(JSON.stringify({ n: 7, k: 2, m: 1, time: [1, 1, 1, 1, 1, 1, 1], mul: [1] })))
})

// Oracle: repeated relaxation over every state until nothing changes, with groups built as combinations.
function oracle(k, time, mul) {
  const n = time.length, m = mul.length
  const combos = (items, limit) => {
    const out = []
    const go = (start, cur) => {
      if (cur.length) out.push([...cur])
      if (cur.length === limit) return
      for (let i = start; i < items.length; i++) { cur.push(items[i]); go(i + 1, cur); cur.pop() }
    }
    go(0, [])
    return out
  }
  const dist = new Map([[JSON.stringify([Array.from({ length: n }, (_, i) => i), 0, 0]), 0]])
  for (let changed = true; changed;) {
    changed = false
    for (const [key, t] of [...dist]) {
      const [camp, side, stage] = JSON.parse(key)
      if (!camp.length) continue
      const far = Array.from({ length: n }, (_, i) => i).filter(i => !camp.includes(i))
      const groups = side === 0 ? combos(camp, k) : far.map(i => [i])
      for (const group of groups) {
        const d = Math.max(...group.map(i => time[i])) * mul[stage]
        const nextCamp = side === 0 ? camp.filter(i => !group.includes(i)) : [...camp, ...group].sort((a, b) => a - b)
        const nextKey = JSON.stringify([nextCamp, 1 - side, (stage + Math.floor(d)) % m])
        if (!dist.has(nextKey) || t + d < dist.get(nextKey)) { dist.set(nextKey, t + d); changed = true }
      }
    }
  }
  let best = -1
  for (const [key, t] of dist) if (!JSON.parse(key)[0].length && (best < 0 || t < best)) best = t
  return best
}

test('3594 random inputs match a relaxation oracle', () => {
  let seed = 3594
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(5), k = 1 + rnd(4), m = 1 + rnd(4)
    const time = Array.from({ length: n }, () => 1 + rnd(30))
    const mul = Array.from({ length: m }, () => 0.5 + rnd(7) * 0.25)
    const got = solve(k, time, mul)
    const want = oracle(k, time, mul)
    assert.ok(Math.abs(got - want) < 1e-4, JSON.stringify({ k, time, mul, got, want }))
  }
})

test('3594 frames are well formed and the route adds up', () => {
  const pyLines = python.trim().split('\n')
  const ids = new Set(phases.map(p => p.id))
  for (const [k, time, mul] of [[2, [1, 10], [2, 1, 0.5]], [2, [3, 4, 9], [1.5, 0.5]], [1, [4, 6, 3], [1, 1.5]], [3, [7], [0.5, 2]]]) {
    const run = buildTrace({ n: time.length, k, m: mul.length, time, mul })
    for (const f of run.frames) {
      assert.ok(ids.has(f.phase), f.phase)
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines.length)
      assert.ok(pyLines[f.pythonLine - 1].trim().length > 0)
      assert.ok(f.message.length > 0)
    }
    const last = run.frames.at(-1)
    assert.equal(last.phase, 'done')
    if (run.result >= 0) {
      const sum = last.route.reduce((s, e) => s + e.length, 0)
      assert.ok(Math.abs(sum - run.result) < 1e-4)
      assert.equal(last.route.at(-1).nextCamp, 0)
    }
  }
})

test('3594 detour route is the hand-computed one', () => {
  const last = buildTrace({ n: 2, k: 2, m: 3, time: [1, 10], mul: [2, 1, 0.5] }).frames.at(-1)
  assert.deepEqual(last.route.map(e => e.people), [[0], [0], [0, 1]])
})

test('3594 timeline stays bounded at the visual cap', () => {
  const run = buildTrace({ n: 6, k: 3, m: 5, time: [3, 7, 11, 13, 17, 19], mul: [1.1, 0.7, 1.3, 0.9, 1.7] })
  assert.ok(run.frames.length < 3000, String(run.frames.length))
})
