import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = (nums, changeIndices) => buildTrace({ nums, changeIndices }).result

test('3049 hand-computed cases', () => {
  assert.equal(solve([0], [1]), 1)
  assert.equal(solve([1], [1]), -1) // needs a clear and a mark
  assert.equal(solve([1], [1, 1]), 2)
  assert.equal(solve([5], [1, 1]), 2) // reset then mark
  assert.equal(solve([5, 5], [1, 2, 2, 2]), 4) // reset 1, reset 2, mark, mark
  assert.equal(solve([2, 0], [1, 1, 1, 1]), 3) // reset 1, mark 1, mark 2
  assert.equal(solve([3, 3], [1, 1, 1]), -1) // index 2 needs 4 seconds alone
  assert.equal(solve([1, 1], [2, 2, 2, 2]), 4) // every index costs two seconds
  assert.equal(solve([2, 3], [1, 1, 2]), -1) // nothing can mark index 2 after its only reset
})

// Oracle: breadth-first search over every reachable (values, marked) state, second by second.
function oracle(nums, changeIndices) {
  const n = nums.length
  const full = (1 << n) - 1
  const key = (values, mask) => `${values.join(',')}|${mask}`
  let layer = new Map([[key(nums, 0), [nums, 0]]])
  if (full === 0) return 1
  for (let at = 0; at < changeIndices.length; at++) {
    const next = new Map()
    const add = (values, mask) => next.set(key(values, mask), [values, mask])
    for (const [values, mask] of layer.values()) {
      add(values, mask)
      for (let i = 0; i < n; i++) {
        if (values[i] > 0) add(values.map((v, j) => (j === i ? v - 1 : v)), mask)
        if (values[i] === 0 && !(mask >> i & 1)) add(values, mask | (1 << i))
      }
      const target = changeIndices[at] - 1
      // Raising a value can never help, so resetting to 0 is the only reset worth exploring.
      add(values.map((v, j) => (j === target ? 0 : v)), mask)
    }
    for (const [, mask] of next.values()) if (mask === full) return at + 1
    layer = next
  }
  return -1
}

// Replay a schedule under the actual rules and report whether all indices end up marked.
function legal(nums, changeIndices, plan) {
  const values = nums.slice()
  const marked = new Set()
  for (const { second, action, index } of plan) {
    if (action === 'reset') {
      assert.equal(changeIndices[second - 1], index, 'reset targets the index named for this second')
      values[index - 1] = 0
    } else if (action === 'decrement') {
      assert.ok(values[index - 1] > 0, 'decrement needs a positive value')
      values[index - 1]--
    } else if (action === 'mark') {
      assert.equal(values[index - 1], 0, 'mark needs a zero value')
      marked.add(index)
    }
  }
  return marked.size === nums.length
}

test('3049 random small cases match an exhaustive oracle, and the schedule is legal', () => {
  let seed = 3049
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 500; t++) {
    const n = 1 + rnd(3)
    const nums = Array.from({ length: n }, () => rnd(5))
    const changeIndices = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(n))
    const { result, frames } = buildTrace(parseInput(JSON.stringify({ nums, changeIndices })))
    assert.equal(result, oracle(nums, changeIndices), JSON.stringify({ nums, changeIndices }))
    const { plan } = frames.at(-1)
    if (result === -1) assert.equal(plan, null)
    else {
      assert.equal(plan.length, result)
      assert.ok(legal(nums, changeIndices, plan), JSON.stringify({ nums, changeIndices, plan }))
    }
  }
})

test('3049 the page examples produce the expected shape', () => {
  const heapExample = buildTrace({ nums: [6, 2, 9], changeIndices: [2, 2, 1, 3, 3, 1, 3, 1, 2] })
  assert.ok(heapExample.frames.some(f => f.phase === 'undo'), 'this example exercises the undo branch')
  assert.equal(buildTrace({ nums: [2, 3], changeIndices: [1, 1, 2] }).frames.at(-1).plan, null)
})

test('3049 parseInput enforces the rules', () => {
  assert.doesNotThrow(() => parseInput('{"nums":[1],"changeIndices":[1]}'))
  assert.throws(() => parseInput('{"nums":[],"changeIndices":[1]}'))
  assert.throws(() => parseInput('{"nums":[1],"changeIndices":[]}'))
  assert.throws(() => parseInput('{"nums":[1],"changeIndices":[2]}'))
  assert.throws(() => parseInput('{"nums":[-1],"changeIndices":[1]}'))
  assert.throws(() => parseInput('{"nums":[2000000000],"changeIndices":[1]}'))
})

test('3049 frames are well formed and the search range only shrinks', () => {
  const known = new Set(phases.map(p => p.id))
  const pythonLines = python.split('\n')
  const { frames } = buildTrace({ nums: [4, 1, 5], changeIndices: [3, 1, 2, 3, 1, 1, 2, 2] })
  assert.equal(frames[0].phase, 'start')
  assert.equal(frames.at(-1).phase, 'done')
  let previous = Infinity
  for (const f of frames) {
    assert.ok(known.has(f.phase), f.phase)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(pythonLines[f.pythonLine - 1]?.trim(), `python line ${f.pythonLine}`)
    assert.ok(f.message.length > 0)
    assert.ok(f.high - f.low <= previous)
    previous = f.high - f.low
    assert.equal(f.needed, f.total - f.saved)
  }
})
