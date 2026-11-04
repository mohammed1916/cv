import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm.js'

const solve = (nums, queries) => buildTrace({ nums, queries }).result

test('3636 hand-computed cases', () => {
  const nums = [4, 7, 4, 9, 7, 7, 4, 2, 2, 7]
  // [0,5]: 7 x3, 4 x2. [3,9]: 7 x3 is under 4. [2,3]: 4 and 9 tie at 1. [6,8]: 2 x2. [1,2]: 4 and 7 tie at 1, under 2.
  assert.deepEqual(solve(nums, [[0, 5, 3], [3, 9, 4], [2, 3, 1], [6, 8, 2], [1, 2, 2]]), [7, -1, 4, 2, -1])
  assert.deepEqual(solve([8, 3, 8, 3], [[0, 3, 2], [0, 3, 3]]), [3, -1])
  assert.deepEqual(solve([5], [[0, 0, 1]]), [5])
  assert.deepEqual(solve([1000000000, 1000000000, 6], [[0, 2, 2], [2, 2, 1]]), [1000000000, 6])
})

test('3636 rejects out-of-range input', () => {
  for (const bad of [
    '{"nums":[],"queries":[[0,0,1]]}', '{"nums":[0],"queries":[[0,0,1]]}', '{"nums":[1],"queries":[]}',
    '{"nums":[1,2],"queries":[[1,0,1]]}', '{"nums":[1,2],"queries":[[0,2,1]]}', '{"nums":[1,2],"queries":[[0,1,3]]}',
    '{"nums":[1,2],"queries":[[0,1,0]]}', '[]',
  ]) assert.throws(() => parseInput(bad), undefined, bad)
})

// Oracle: recount each range from scratch.
const countRange = (nums, l, r) => {
  const counts = {}
  for (let i = l; i <= r; i++) counts[nums[i]] = (counts[nums[i]] || 0) + 1
  return counts
}
function oracle(nums, queries) {
  return queries.map(([l, r, threshold]) => {
    let best = -1
    let bestCount = 0
    for (const [key, amount] of Object.entries(countRange(nums, l, r))) {
      const value = Number(key)
      if (amount >= threshold && (amount > bestCount || (amount === bestCount && value < best))) { best = value; bestCount = amount }
    }
    return best
  })
}

function randomCase(next) {
  const n = 1 + next(32)
  const alphabet = 1 + next(6)
  const nums = Array.from({ length: n }, () => 1 + next(alphabet))
  const queries = Array.from({ length: 1 + next(8) }, () => {
    const a = next(n)
    const b = next(n)
    const l = Math.min(a, b)
    const r = Math.max(a, b)
    return [l, r, 1 + next(r - l + 1)]
  })
  return { nums, queries }
}

test('3636 agrees with recounting every range', () => {
  let seed = 3636
  const next = limit => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % limit }
  for (let round = 0; round < 3000; round++) {
    const { nums, queries } = randomCase(next)
    assert.deepEqual(solve(nums, queries), oracle(nums, queries), JSON.stringify({ nums, queries }))
  }
})

const live = counts => Object.fromEntries(Object.entries(counts).filter(([, amount]) => amount > 0))

test('3636 counts on screen always match the window they claim to hold', () => {
  let seed = 77
  const next = limit => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % limit }
  for (let round = 0; round < 300; round++) {
    const { nums, queries } = randomCase(next)
    const run = buildTrace({ nums, queries })
    for (const frame of run.frames) {
      if (frame.block < 0) continue
      const held = frame.boundary <= frame.right ? countRange(nums, frame.boundary, frame.right) : {}
      if (frame.phase === 'answer') {
        assert.deepEqual(live(frame.counts), countRange(nums, frame.l, frame.r))
      } else if (frame.phase === 'rollback' || frame.phase === 'extend' || frame.phase === 'save') {
        assert.deepEqual(live(frame.counts), held)
      }
    }
  }
})

test('3636 right never moves back within a block', () => {
  const run = buildTrace(parseInput(examples[0].input))
  let block = -1
  let right = -1
  for (const frame of run.frames) {
    if (frame.block !== block) { block = frame.block; right = frame.right }
    assert.ok(frame.right >= right)
    right = frame.right
  }
})

test('3636 frames are well formed', () => {
  const pythonLines = python.trim().split('\n')
  const ids = new Set(phases.map(phase => phase.id))
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    for (const frame of run.frames) {
      assert.ok(ids.has(frame.phase), frame.phase)
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pythonLines.length)
      assert.ok(pythonLines[frame.pythonLine - 1].trim().length > 0)
      assert.ok(frame.message.length > 0)
    }
    assert.equal(run.frames.at(-1).phase, 'done')
    assert.deepEqual(run.frames.at(-1).ans, run.result)
  }
  const first = buildTrace(parseInput(examples[0].input))
  for (const id of ['plan', 'block', 'extend', 'save', 'temporary', 'answer', 'rollback', 'done']) {
    assert.ok(first.frames.some(frame => frame.phase === id), id)
  }
})
