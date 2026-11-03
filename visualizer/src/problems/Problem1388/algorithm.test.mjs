import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, phases } from './algorithm.js'

const solve = slices => buildTrace(parseInput(JSON.stringify({ slices }))).result

// Independent oracle: enumerate every set of n slices and keep those with no circular neighbours.
function brute(slices) {
  const L = slices.length, n = L / 3
  let best = -Infinity
  const pick = (start, chosen, total) => {
    if (chosen.length === n) {
      const set = new Set(chosen)
      const ok = chosen.every(i => !set.has((i + 1) % L) && !set.has((i + L - 1) % L))
      if (ok) best = Math.max(best, total)
      return
    }
    for (let i = start; i < L; i++) pick(i + 1, [...chosen, i], total + slices[i])
  }
  pick(0, [], 0)
  return best
}

test('hand-checked circles', () => {
  assert.equal(solve([5, 1, 9, 2, 7, 4]), 16)
  assert.equal(solve([1, 2, 3]), 3)
  assert.equal(solve([4, 4, 4]), 4)
})

test('random circles agree with the subset oracle', () => {
  let state = 23
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return (state >> 8) % m }
  for (let t = 0; t < 150; t++) {
    const groups = [1, 2, 3, 4][rand(4)]
    const slices = Array.from({ length: groups * 3 }, () => 1 + rand(50))
    assert.equal(solve(slices), brute(slices), JSON.stringify(slices))
  }
})

test('every frame carries a phase, a code line, narration and a snapshot', () => {
  const run = buildTrace(parseInput('{"slices":[5,1,9,2,7,4]}'))
  const ids = phases.map(p => p.id)
  for (const frame of run.frames) {
    assert.ok(ids.includes(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('invalid input is rejected with a message', () => {
  assert.throws(() => parseInput('{"slices":[1,2,3,4]}'), /multiple of 3/)
  assert.throws(() => parseInput('{"slices":[1,2,0]}'), /integers/)
})
