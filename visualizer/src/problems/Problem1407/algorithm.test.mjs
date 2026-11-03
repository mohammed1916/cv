import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text))

test('1407 sample totals with zero for users without rides', () => {
  const { result } = solve('{"users":[{"id":1,"name":"Ana"},{"id":2,"name":"Bo"},{"id":3,"name":"Cy"}],"rides":[{"id":1,"user_id":1,"distance":20},{"id":2,"user_id":2,"distance":30},{"id":3,"user_id":1,"distance":40}]}')
  assert.deepEqual(result, [
    { name: 'Ana', travelled_distance: 60 },
    { name: 'Bo', travelled_distance: 30 },
    { name: 'Cy', travelled_distance: 0 },
  ])
})

test('1407 equal totals are ordered by name ascending', () => {
  const { result } = solve('{"users":[{"id":1,"name":"Zed"},{"id":2,"name":"Amy"},{"id":3,"name":"Kit"}],"rides":[{"id":1,"user_id":1,"distance":5}]}')
  assert.deepEqual(result[0], { name: 'Zed', travelled_distance: 5 })
  assert.deepEqual(result.slice(1), [
    { name: 'Amy', travelled_distance: 0 },
    { name: 'Kit', travelled_distance: 0 },
  ])
})

test('1407 rejects a ride for an unknown user and a bad distance', () => {
  assert.throws(() => parseInput('{"users":[{"id":1,"name":"Ana"}],"rides":[{"id":1,"user_id":9,"distance":5}]}'))
  assert.throws(() => parseInput('{"users":[{"id":1,"name":"Ana"}],"rides":[{"id":1,"user_id":1,"distance":-5}]}'))
})

test('1407 frames keep phase, line and row invariants', () => {
  const { frames } = solve('{"users":[{"id":1,"name":"Ana"},{"id":2,"name":"Bo"}],"rides":[{"id":1,"user_id":1,"distance":7}]}')
  const pyLines = python.split('\n').length
  for (const f of frames) {
    assert.equal(typeof f.phase, 'string')
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.ok(f.message.length > 0)
    assert.ok(Array.isArray(f.columns) && Array.isArray(f.rows))
  }
  assert.equal(frames.at(-1).phase, 'output')
})
