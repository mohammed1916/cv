import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, code, parseInput, phases, python } from './algorithm.js'

const solve = balance => buildTrace({ balance }).result

// Breadth-first search over actual balance states, one unit at a time.
function bfs(balance) {
  if (balance.reduce((a, b) => a + b, 0) < 0) return -1
  const n = balance.length
  const good = s => s.every(v => v >= 0)
  if (good(balance)) return 0
  const seen = new Set([balance.join()])
  let layer = [balance]
  for (let depth = 1; ; depth++) {
    const next = []
    for (const s of layer) for (let i = 0; i < n; i++) for (const j of [(i + 1) % n, (i - 1 + n) % n]) {
      if (i === j) continue
      const t = [...s]
      t[i]--; t[j]++
      if (good(t)) return depth
      const k = t.join()
      if (!seen.has(k)) { seen.add(k); next.push(t) }
    }
    layer = next
  }
}

test('4004 hand-computed cases', () => {
  assert.equal(solve([5]), 0)
  assert.equal(solve([-1]), -1)
  assert.equal(solve([0, 5, 0]), 0)
  assert.equal(solve([2, -4, 1]), -1)
  assert.equal(solve([3, -3]), 3)
  assert.equal(solve([4, -1, -1, 0]), 3)
  assert.equal(solve([2, 0, -2, 0]), 4)
  assert.equal(solve([1, 0, 0, -1, 0, 0, 5, 0]), 3)
})

test('4004 matches a state search on small circles', () => {
  let seed = 17
  const rand = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  let reachable = 0
  for (let t = 0; t < 500; t++) {
    const n = 1 + rand(6)
    const balance = Array.from({ length: n }, () => rand(7) - 3)
    const expected = bfs(balance)
    if (expected >= 0) reachable++
    assert.equal(solve(balance), expected, JSON.stringify(balance))
  }
  assert.ok(reachable > 100)
})

test('4004 final crossings explain the answer', () => {
  let seed = 29
  const rand = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  let rerouted = 0
  for (let t = 0; t < 400; t++) {
    const n = 2 + rand(11)
    const balance = Array.from({ length: n }, () => rand(41) - 18)
    const run = buildTrace({ balance })
    if (run.result < 0) continue
    const last = run.frames.at(-1)
    assert.equal(last.net.reduce((a, b) => a + Math.abs(b), 0), run.result)
    assert.ok(last.now.every(v => v >= 0))
    assert.equal(last.now.reduce((a, b) => a + b, 0), balance.reduce((a, b) => a + b, 0))
    assert.ok(last.need.every(v => v === 0))
    if (run.frames.some(f => f.route.some(step => step.undo))) rerouted++
  }
  assert.ok(rerouted > 0, 'random cases exercise rerouting')
})

test('4004 parseInput validates', () => {
  assert.deepEqual(parseInput('{"balance":[1,-1]}'), { balance: [1, -1] })
  assert.throws(() => parseInput('{"balance":[]}'))
  assert.throws(() => parseInput('{"balance":[1.5]}'))
  assert.throws(() => parseInput('{"balance":[100001]}'))
  assert.throws(() => parseInput(`{"balance":${JSON.stringify(Array(13).fill(0))}}`))
})

test('4004 frames are consistent', () => {
  const run = buildTrace({ balance: [6, -2, -3, 1, -1, -1] })
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.trim().split('\n')
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && pyLines[f.pythonLine - 1]?.trim())
    assert.ok(f.message.length > 0)
    assert.equal(f.now.reduce((a, b) => a + b, 0), 0)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).moves, run.result)
  const impossible = buildTrace({ balance: [2, -4, 1] })
  assert.deepEqual(impossible.frames.map(f => f.phase), ['total', 'done'])
})
