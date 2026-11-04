import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = (street, k) => buildTrace({ street, k }).result

test('2753 hand-computed walks', () => {
  assert.equal(solve([0, 1, 0, 0, 1, 1], 9), 6)
  assert.equal(solve([0, 0, 1, 0], 4), 4)
  assert.equal(solve([1], 4), 1)
  assert.equal(solve([1], 1), 1)
  assert.equal(solve([1, 1], 2), 2)
})

test('2753 the walker finds the first open door before counting', () => {
  const { frames } = buildTrace({ street: [0, 0, 1, 0], k: 4 })
  assert.equal(frames.filter(f => f.phase === 'seek').length, 2)
  assert.equal(frames.find(f => f.phase === 'anchor').pos, 2)
  // Step 4 is the first and only open door reached, and it is the anchor.
  const opened = frames.filter(f => f.phase === 'open')
  assert.deepEqual(opened.map(f => f.step), [4])
  assert.equal(opened[0].pos, opened[0].anchor)
})

test('2753 hand-computed tape: open doors at steps 3, 4, 6 after anchoring at index 1', () => {
  const { frames } = buildTrace({ street: [0, 1, 0, 0, 1, 1], k: 9 })
  const tape = frames.at(-1).tape
  assert.deepEqual(tape, ['closed', 'closed', 'open', 'open', 'closed', 'open', 'closed', 'closed', 'closed'])
})

test('2753 parseInput enforces the rules', () => {
  assert.doesNotThrow(() => parseInput('{"street":[1,0],"k":2}'))
  assert.throws(() => parseInput('{"street":[0,0],"k":2}'))
  assert.throws(() => parseInput('{"street":[1,0],"k":1}'))
  assert.throws(() => parseInput('{"street":[],"k":1}'))
  assert.throws(() => parseInput('{"street":[2],"k":1}'))
  assert.throws(() => parseInput('[1]'))
})

test('2753 random rings match their true length, and doors only ever shut', () => {
  let seed = 2753
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rnd(24)
    const street = Array.from({ length: n }, () => rnd(2))
    if (!street.includes(1)) street[rnd(n)] = 1
    const k = n + rnd(61 - n)
    const { result, frames } = buildTrace(parseInput(JSON.stringify({ street, k })))
    assert.equal(result, n, JSON.stringify({ street, k }))
    for (let i = 1; i < frames.length; i++) {
      frames[i].doors.forEach((door, j) => assert.ok(door <= frames[i - 1].doors[j]))
    }
    assert.ok(frames.at(-1).doors.every(door => door === 0))
    // The walker must only act on the door it is standing in front of.
    frames.filter(f => f.phase === 'close').forEach(f => assert.equal(f.doors[f.pos], 0))
  }
})

test('2753 frames are well formed', () => {
  const known = new Set(phases.map(p => p.id))
  const pythonLines = python.split('\n')
  for (const input of [{ street: [0, 1, 0, 0, 1, 1], k: 9 }, { street: [1], k: 4 }]) {
    const { frames } = buildTrace(input)
    assert.equal(frames[0].phase, 'start')
    assert.equal(frames.at(-1).phase, 'done')
    for (const f of frames) {
      assert.ok(known.has(f.phase), f.phase)
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(pythonLines[f.pythonLine - 1]?.trim(), `python line ${f.pythonLine}`)
      assert.ok(f.message.length > 0)
    }
  }
})
