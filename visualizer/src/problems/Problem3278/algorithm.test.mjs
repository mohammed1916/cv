import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const sample = {
  Projects: [{ project_id: 1, skill: 'sql' }, { project_id: 2, skill: 'python' }, { project_id: 3, skill: 'rust' }],
  Candidates: [
    { candidate_id: 10, skill: 'sql', proficiency: 4 },
    { candidate_id: 4, skill: 'sql', proficiency: 5 },
    { candidate_id: 9, skill: 'sql', proficiency: 5 },
    { candidate_id: 7, skill: 'python', proficiency: 3 },
    { candidate_id: 2, skill: 'python', proficiency: 3 },
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

test('3278 picks the best candidate per project with tie-break by id', () => {
  const trace = buildTrace(sample)
  assert.deepEqual(trace.result, [
    { project_id: 1, candidate_id: 4, proficiency: 5 },
    { project_id: 2, candidate_id: 2, proficiency: 3 },
  ])
  checkFrames(trace)
})

test('3278 a project with no matching skill produces no row', () => {
  const trace = buildTrace({ Projects: [{ project_id: 5, skill: 'go' }], Candidates: [{ candidate_id: 1, skill: 'sql', proficiency: 2 }] })
  assert.deepEqual(trace.result, [])
  checkFrames(trace)
})

test('3278 rejects proficiency outside 1 to 5', () => {
  assert.throws(() => parseInput('{"Projects":[],"Candidates":[{"candidate_id":1,"skill":"sql","proficiency":6}]}'))
})
