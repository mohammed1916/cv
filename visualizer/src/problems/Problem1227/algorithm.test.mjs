import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: exact recursion over every random seat choice, with no shortcut.
function exact(n) {
  if (n === 1) return 1
  // seatsTaken is the set of occupied seats after passengers 1..i-1 have boarded.
  const go = (i, taken) => {
    if (i === n) return taken.has(n) ? 0 : 1
    if (i === 1) {
      let sum = 0
      for (let s = 1; s <= n; s++) sum += go(2, new Set([s]))
      return sum / n
    }
    if (!taken.has(i)) return go(i + 1, new Set([...taken, i]))
    const free = []
    for (let s = 1; s <= n; s++) if (!taken.has(s)) free.push(s)
    let sum = 0
    for (const s of free) sum += go(i + 1, new Set([...taken, s]))
    return sum / free.length
  }
  return go(1, new Set())
}

test('one passenger always sits correctly, and two passengers give one half', () => {
  assert.equal(buildTrace({ n: 1 }).result, 1)
  assert.equal(buildTrace({ n: 2 }).result, 0.5)
})

test('small counts agree with exact enumeration of seat choices', () => {
  for (let n = 1; n <= 8; n++) assert.ok(Math.abs(buildTrace({ n }).result - exact(n)) < 1e-12, `n=${n}`)
})

test('large counts stay at one half', () => {
  assert.ok(Math.abs(buildTrace({ n: 72 }).result - 0.5) < 1e-12)
  assert.ok(Math.abs(buildTrace({ n: 9999 }).result - 0.5) < 1e-12)
})

test('every frame has narration and the run ends with a done frame', () => {
  const run = buildTrace({ n: 5 })
  for (const frame of run.frames) assert.ok(frame.message.length > 10)
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('parseInput rejects zero and out-of-range counts', () => {
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":100001}'))
  assert.deepEqual(parseInput('{"n":4}'), { n: 4 })
})
