import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const sample = {
  movies: [{ movie_id: 1, title: 'Alpha' }, { movie_id: 2, title: 'Beta' }, { movie_id: 3, title: 'Gamma' }],
  users: [{ user_id: 1, name: 'Ann' }, { user_id: 2, name: 'Bob' }, { user_id: 3, name: 'Cy' }],
  ratings: [
    { movie_id: 1, user_id: 1, rating: 4, created_at: '2020-02-05' },
    { movie_id: 2, user_id: 1, rating: 3, created_at: '2020-02-10' },
    { movie_id: 3, user_id: 1, rating: 5, created_at: '2020-03-01' },
    { movie_id: 1, user_id: 2, rating: 2, created_at: '2020-02-20' },
    { movie_id: 2, user_id: 2, rating: 4, created_at: '2020-02-22' },
    { movie_id: 1, user_id: 3, rating: 5, created_at: '2020-02-01' },
    { movie_id: 2, user_id: 3, rating: 5, created_at: '2020-01-15' },
    { movie_id: 3, user_id: 3, rating: 1, created_at: '2020-02-18' },
  ],
}

function checkFrames(trace) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  assert.ok(trace.frames.length > 0)
  for (const f of trace.frames) {
    assert.ok(ids.has(f.phase), `unknown phase ${f.phase}`)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
  assert.equal(trace.frames.at(-1).phase, 'output')
}

test('1341 sample: Ann wins the tie on count, Alpha has the best February average', () => {
  const trace = buildTrace(parseInput(JSON.stringify(sample)))
  assert.deepEqual(trace.result, [{ results: 'Ann' }, { results: 'Alpha' }])
  checkFrames(trace)
})

test('1341 February averages decide the movie, not all-time averages', () => {
  const trace = buildTrace(parseInput(JSON.stringify(sample)))
  const averages = trace.frames.filter(f => f.phase === 'average').at(-1).rows
  assert.deepEqual(averages.map(r => [r.title, r.average]), [['Alpha', 3.67], ['Beta', 3.5], ['Gamma', 1]])
})

test('1341 no February ratings leaves only the user row', () => {
  const trace = buildTrace(parseInput('{"movies":[{"movie_id":1,"title":"Solo"}],"users":[{"user_id":1,"name":"Eve"}],"ratings":[{"movie_id":1,"user_id":1,"rating":4,"created_at":"2020-03-02"}]}'))
  assert.deepEqual(trace.result, [{ results: 'Eve' }])
  checkFrames(trace)
})

test('1341 rejects ratings outside 1 to 5 and malformed dates', () => {
  assert.throws(() => parseInput('{"movies":[],"users":[],"ratings":[{"movie_id":1,"user_id":1,"rating":6,"created_at":"2020-02-01"}]}'))
  assert.throws(() => parseInput('{"movies":[],"users":[],"ratings":[{"movie_id":1,"user_id":1,"rating":3,"created_at":"Feb 1"}]}'))
})
