import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const sample = {
  Projects: [
    { project_id: 61, skill: 'alpha', importance: 4 },
    { project_id: 61, skill: 'beta', importance: 3 },
    { project_id: 61, skill: 'gamma', importance: 5 },
    { project_id: 62, skill: 'alpha', importance: 2 },
    { project_id: 63, skill: 'delta', importance: 1 },
  ],
  Candidates: [
    { candidate_id: 8, skill: 'alpha', proficiency: 5 },
    { candidate_id: 8, skill: 'beta', proficiency: 3 },
    { candidate_id: 8, skill: 'gamma', proficiency: 4 },
    { candidate_id: 3, skill: 'alpha', proficiency: 5 },
    { candidate_id: 3, skill: 'beta', proficiency: 3 },
    { candidate_id: 3, skill: 'gamma', proficiency: 4 },
    { candidate_id: 5, skill: 'alpha', proficiency: 2 },
    { candidate_id: 5, skill: 'beta', proficiency: 1 },
  ],
}

function checkFrames(trace) {
  const pyCount = python.trimEnd().split('\n').length
  assert.ok(trace.frames.length > 0)
  for (const f of trace.frames) {
    assert.ok(phases.some(p => p.id === f.phase))
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyCount)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
  assert.deepEqual(trace.frames.at(-1).rows, trace.result)
}

test('3278 scores complete candidates and picks the highest, then the lower id', () => {
  const trace = buildTrace(sample)
  // Project 61: candidate 3 scores 100 + 10 (5>4) + 0 (3=3) - 5 (4<5) = 105, the same as candidate 8, so the lower id 3 wins.
  // Project 62: candidate 3 and 8 both score 100 + 10 = 110; 3 wins the tie. Candidate 5 covers alpha only, so it is skipped for 61.
  // Project 63 has no candidate with delta, so it gets no row.
  assert.deepEqual(trace.result, [
    { project_id: 61, candidate_id: 3, score: 105 },
    { project_id: 62, candidate_id: 3, score: 110 },
  ])
  checkFrames(trace)
})

test('3278 a candidate missing one required skill never gets a row', () => {
  const trace = buildTrace({
    Projects: [{ project_id: 9, skill: 'x', importance: 2 }, { project_id: 9, skill: 'y', importance: 2 }],
    Candidates: [{ candidate_id: 1, skill: 'x', proficiency: 5 }],
  })
  assert.deepEqual(trace.result, [])
  checkFrames(trace)
})

test('3278 rejects an invalid table', () => {
  assert.throws(() => parseInput('{"Projects":[],"Candidates":[{"candidate_id":1,"skill":"x","proficiency":9}]}'))
})
