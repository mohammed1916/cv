import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, phases, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

function checkFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(frame.message.length > 0)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('small programs: turning and returning, a single drift, and a straight run', () => {
  assert.equal(solve('GRGRG'), true)
  assert.equal(solve('GLG'), true)
  assert.equal(solve('RGL'), false)
  assert.equal(solve('GG'), false)
})

test('a program whose first pass returns to the origin is bounded', () => {
  assert.equal(solve('GLGLGLGL'), true)
})

test('frames trace four passes and end with the answer', () => {
  const run = buildTrace(parseInput('GRGRG'))
  checkFrames(run)
  assert.equal(run.frames.filter(f => f.phase === 'pass').length, 4)
  assert.equal(run.result, true)
})

test('invalid inputs are rejected by the parser', () => {
  assert.throws(() => parseInput(''))
  assert.throws(() => parseInput('GXR'))
  assert.throws(() => parseInput('G'.repeat(101)))
})

// Independent oracle: bounded exactly when the robot is back at the origin or its heading changed after one pass.
function oracle(s) {
  let x = 0, y = 0, d = 0
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]
  for (const c of s) {
    if (c === 'G') { x += dirs[d][0]; y += dirs[d][1] }
    else if (c === 'L') d = (d + 3) % 4
    else d = (d + 1) % 4
  }
  return (x === 0 && y === 0) || d !== 0
}

test('seeded random programs agree with the one-pass heading oracle', () => {
  let seed = 1041
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(20)
    let s = ''
    for (let i = 0; i < len; i++) s += 'GLR'[rnd(3)]
    assert.equal(solve(s), oracle(s), s)
  }
})
