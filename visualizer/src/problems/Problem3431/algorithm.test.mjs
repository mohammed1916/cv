import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases, replaySwaps } from './algorithm.js'

const solve = (nums, locked) => buildTrace({ nums, locked }).result
const pyLines = python.trim().split('\n')

test('3431 hand-computed cases', () => {
  // Bands are gates 0..1 and 3..5; locked ones among them are 0, 4 and 5.
  assert.equal(solve([2, 1, 1, 3, 2, 3, 2], [1, 0, 1, 0, 1, 1, 0]), 3)
  // Band is gates 1..2, both open; the other locks are irrelevant.
  assert.equal(solve([1, 2, 2, 1, 3, 3], [1, 0, 0, 1, 1, 0]), 0)
  assert.equal(solve([2, 3, 2, 1], [0, 0, 0, 0]), -1)
  assert.equal(solve([1, 1, 3], [1, 1, 1]), 0)
})

test('3431 edge cases', () => {
  assert.equal(solve([3], [1]), 0)
  assert.equal(solve([2, 1], [1, 1]), 1)
  assert.equal(solve([2, 1], [0, 1]), 0)
  assert.equal(solve([3, 1], [0, 0]), -1)
  assert.equal(solve([3, 2], [1, 0]), 1)
  assert.equal(solve([1, 3, 2], [1, 1, 1]), 1)
  assert.equal(solve([3, 3, 3], [1, 1, 1]), 0)
  assert.equal(solve([2, 2, 2], [1, 1, 1]), 0)
})

test('3431 parseInput validates', () => {
  assert.doesNotThrow(() => parseInput('{"nums":[1,2],"locked":[0,1]}'))
  assert.throws(() => parseInput('{"nums":[1,4],"locked":[0,1]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"locked":[0]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"locked":[0,2]}'))
  assert.throws(() => parseInput('{"nums":[],"locked":[]}'))
  assert.throws(() => parseInput(JSON.stringify({ nums: Array(17).fill(1), locked: Array(17).fill(0) })))
})

// Oracle: try every subset of locked indices, using a breadth-first search over arrangements.
function sortable(nums, locked) {
  const goal = [...nums].sort((a, b) => a - b).join('')
  const seen = new Set([nums.join('')])
  const queue = [nums]
  while (queue.length) {
    const state = queue.pop()
    if (state.join('') === goal) return true
    for (let i = 0; i + 1 < state.length; i++) {
      if (state[i] - state[i + 1] === 1 && locked[i] === 0) {
        const next = [...state]
        next[i] = state[i + 1]; next[i + 1] = state[i]
        const key = next.join('')
        if (!seen.has(key)) { seen.add(key); queue.push(next) }
      }
    }
  }
  return false
}
function oracle(nums, locked) {
  const lockedAt = locked.flatMap((v, i) => (v ? [i] : []))
  let best = -1
  for (let mask = 0; mask < 1 << lockedAt.length; mask++) {
    const cost = mask.toString(2).replace(/0/g, '').length
    if (best !== -1 && cost >= best) continue
    const trial = [...locked]
    lockedAt.forEach((at, b) => { if (mask >> b & 1) trial[at] = 0 })
    if (sortable(nums, trial)) best = cost
  }
  return best
}

test('3431 brute-force oracle on random arrays', () => {
  let seed = 3431
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rnd(8)
    const nums = Array.from({ length: n }, () => 1 + rnd(3))
    const locked = Array.from({ length: n }, () => rnd(2))
    assert.equal(solve(nums, locked), oracle(nums, locked), JSON.stringify({ nums, locked }))
  }
})

test('3431 replay uses only legal swaps through open gates and ends sorted', () => {
  let seed = 77
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(16)
    const nums = Array.from({ length: n }, () => 1 + rnd(3))
    const locked = Array.from({ length: n }, () => rnd(2))
    const { result, frames } = buildTrace({ nums, locked })
    const last = frames.at(-1)
    if (result === -1) { assert.equal(last.replay, null); assert.equal(last.blocked, true); continue }
    assert.equal(last.opened.length, result)
    for (const i of last.opened) assert.equal(locked[i], 1)
    const rows = last.replay
    for (let r = 1; r < rows.length; r++) {
      const at = rows[r].swapAt
      assert.equal(rows[r - 1].values[at] - rows[r - 1].values[at + 1], 1)
      assert.ok(locked[at] === 0 || last.opened.includes(at))
    }
    assert.deepEqual(rows.at(-1).values, [...nums].sort((a, b) => a - b))
  }
  assert.equal(replaySwaps([1, 2], [1, 1], []).length, 1)
})

test('3431 frames map to executed lines', () => {
  const expected = { start: 'last = {', scan: 'for i, v', record: /first\[v\] = i|last\[v\] = i/, check: /if first\[3\]|unlocks = 0/, gate: 'required =', unlock: 'unlocks += 1', done: /return/ }
  const ids = new Set(phases.map(p => p.id))
  for (const [nums, locked] of [[[2, 1, 1, 3, 2, 3, 2], [1, 0, 1, 0, 1, 1, 0]], [[2, 3, 2, 1], [0, 0, 0, 0]], [[1], [1]]]) {
    const { frames, result } = buildTrace({ nums, locked })
    let unlocks = 0
    for (const f of frames) {
      assert.ok(ids.has(f.phase))
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
      const line = pyLines[f.pythonLine - 1]
      const want = expected[f.phase]
      assert.ok(want instanceof RegExp ? want.test(line) : line.includes(want), `${f.phase} -> ${line}`)
      assert.ok(f.message && !f.message.includes('undefined'))
      if (f.phase === 'unlock') unlocks++
      assert.equal(f.unlocks, unlocks)
    }
    assert.equal(frames.at(-1).phase, 'done')
    assert.ok(pyLines[frames.at(-1).pythonLine - 1].includes(result === -1 ? 'return -1' : 'return unlocks'))
  }
})
