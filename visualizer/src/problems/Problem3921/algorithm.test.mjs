import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = events => buildTrace({ events }).result

function assertFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `pseudocode ${f.activeLine}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `python ${f.pythonLine}`)
    assert.ok(f.message.length > 0)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('3921 hand-checked cases', () => {
  assert.deepEqual(solve(['0']), [0, 0])
  assert.deepEqual(solve(['W']), [0, 1])
  assert.deepEqual(solve(['WD', 'NB']), [2, 0])
  assert.deepEqual(solve(['1', '2', 'W', 'WD', '4', '6', 'W', 'NB']), [15, 2])
})

test('3921 stops at the tenth wicket and ignores later tokens', () => {
  const events = ['6', ...Array(10).fill('W'), '4']
  assert.deepEqual(solve(events), [6, 10])
  const run = buildTrace({ events })
  assert.equal(run.frames.find(f => f.phase === 'stop').ignored, 1)
  assertFrames(run)
})

test('3921 rejects unknown tokens', () => {
  assert.throws(() => parseInput('["5"]'))
  assert.throws(() => parseInput('[]'))
})

test('3921 random sequences match a direct simulation', () => {
  let seed = 3921
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const tokens = ['0', '1', '2', '3', '4', '6', 'WD', 'NB', 'W']
  for (let t = 0; t < 300; t++) {
    const events = Array.from({ length: 1 + rnd(30) }, () => tokens[rnd(tokens.length)])
    let score = 0
    let wickets = 0
    for (const e of events) {
      if (e === 'W') wickets++
      else if (e === 'WD' || e === 'NB') score += 1
      else score += Number(e)
      if (wickets === 10) break
    }
    assert.deepEqual(solve(events), [score, wickets], JSON.stringify(events))
  }
})
