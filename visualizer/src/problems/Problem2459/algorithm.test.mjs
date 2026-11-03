import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result

// Independent oracle: breadth-first search over arrangements, moving the zero by swaps.
function oracle(start) {
  const n = start.length
  const key = a => a.join(',')
  const targets = new Set([
    key(Array.from({ length: n }, (_, i) => i)),
    key(Array.from({ length: n }, (_, i) => (i + 1) % n)),
  ])
  const dist = new Map([[key(start), 0]])
  const queue = [start]
  while (queue.length) {
    const cur = queue.shift()
    const d = dist.get(key(cur))
    if (targets.has(key(cur))) return d
    const z = cur.indexOf(0)
    for (let j = 0; j < n; j++) {
      if (j === z) continue
      const next = [...cur]
      ;[next[z], next[j]] = [next[j], next[z]]
      if (!dist.has(key(next))) {
        dist.set(key(next), d + 1)
        queue.push(next)
      }
    }
  }
  return -1
}

test('2459 teaching examples', () => {
  assert.equal(solve([4, 2, 0, 3, 1]), oracle([4, 2, 0, 3, 1]))
  assert.equal(solve([1, 2, 3, 0]), 0)
  assert.equal(solve([2, 1, 4, 3, 0]), oracle([2, 1, 4, 3, 0]))
})

test('2459 a single swap with the zero', () => {
  assert.equal(solve([1, 0]), 0)
  assert.equal(solve([0, 1]), 0)
  assert.equal(solve([2, 0, 1]), oracle([2, 0, 1]))
})

test('2459 parseInput rejects non-permutations', () => {
  assert.throws(() => parseInput('[0,0,1]'))
  assert.throws(() => parseInput('[1,2,3]'))
  assert.throws(() => parseInput('[]'))
})

function permutations(items) {
  if (items.length <= 1) return [items]
  return items.flatMap((x, i) => permutations([...items.slice(0, i), ...items.slice(i + 1)]).map(rest => [x, ...rest]))
}

test('2459 every permutation up to length five matches the BFS oracle', () => {
  for (let n = 1; n <= 5; n++) {
    for (const perm of permutations(Array.from({ length: n }, (_, i) => i))) {
      assert.equal(solve(perm), oracle(perm), JSON.stringify(perm))
    }
  }
})

test('2459 frame invariants hold on every trace', () => {
  const nums = [4, 2, 0, 3, 1]
  const run = buildTrace(nums)
  const phases = new Set(['start', 'target', 'cycle', 'keep', 'done'])
  for (const f of run.frames) {
    assert.ok(phases.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= python.trim().split('\n').length)
    assert.ok(f.cycle.every(i => i >= 0 && i < nums.length))
  }
  assert.equal(run.frames.at(-1).best, run.result)
})
