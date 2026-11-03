import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: breadth-first search over every array reachable by subarray +1 operations.
function bruteMinOps(target) {
  const key = a => a.join(',')
  const start = target.map(() => 0)
  const dist = new Map([[key(start), 0]])
  const queue = [start]
  for (let q = 0; q < queue.length; q++) {
    const cur = queue[q]
    const d = dist.get(key(cur))
    if (key(cur) === key(target)) return d
    for (let i = 0; i < target.length; i++) {
      for (let j = i; j < target.length; j++) {
        const next = cur.map((v, idx) => (idx >= i && idx <= j ? v + 1 : v))
        if (next.some((v, idx) => v > target[idx]) || dist.has(key(next))) continue
        dist.set(key(next), d + 1)
        queue.push(next)
      }
    }
  }
  return -1
}

test('1526 sample inputs give the expected totals', () => {
  assert.equal(buildTrace([3, 1, 2, 5, 1]).result, 7)
  assert.equal(buildTrace([0, 4, 4, 0, 2]).result, 6)
  assert.equal(buildTrace([5, 2, 6]).result, 9)
  assert.equal(buildTrace([0]).result, 0)
})

test('1526 small targets match a breadth-first search oracle', () => {
  let seed = 11
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const target = Array.from({ length: 1 + rnd(4) }, () => rnd(4))
    assert.equal(buildTrace(target).result, bruteMinOps(target), JSON.stringify(target))
  }
})

test('1526 rejects malformed input', () => {
  assert.throws(() => parseInput('[]'), /1 to 12/)
  assert.throws(() => parseInput('[1,-2]'), /0 to 50/)
  assert.throws(() => parseInput('[1.5]'), /integers/)
})

test('1526 frames use declared phases and lines inside the solver', () => {
  const run = buildTrace([3, 1, 2, 5, 1])
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
