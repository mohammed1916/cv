import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: filter the pairs with a single predicate.
const oracle = ({ start, end, query }) => start.filter((s, i) => s <= query && query <= end[i]).length

test('sample inputs give 3, 2 and 0 students', () => {
  assert.equal(solve('{"start":[1,3,3,8],"end":[3,3,8,10],"query":3}'), 3)
  assert.equal(solve('{"start":[2,5,7,9],"end":[4,6,8,12],"query":6}'), 1)
  assert.equal(solve('{"start":[2,5],"end":[4,6],"query":10}'), 0)
})

test('endpoints are included', () => {
  assert.equal(solve('{"start":[4],"end":[4],"query":4}'), 1)
  assert.equal(solve('{"start":[4],"end":[9],"query":9}'), 1)
})

test('random inputs match the oracle', () => {
  let state = 3
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rand(20)
    const start = [], end = []
    for (let i = 0; i < n; i++) {
      const a = 1 + rand(50), b = a + rand(50)
      start.push(a); end.push(b)
    }
    const obj = { start, end, query: 1 + rand(60) }
    assert.equal(buildTrace(parseInput(JSON.stringify(obj))).result, oracle(obj), JSON.stringify(obj))
  }
})

test('frames map to real code and Python lines and end with the result', () => {
  const run = buildTrace(parseInput('{"start":[1,3],"end":[2,5],"query":4}'))
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.split('\n').length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('invalid input is rejected', () => {
  assert.throws(() => parseInput('{"start":[5],"end":[2],"query":3}'), /after the end/)
  assert.throws(() => parseInput('{"start":[1,2],"end":[3],"query":2}'), /same length/)
  assert.throws(() => parseInput('{"start":[1],"end":[3],"query":0}'), /query/)
  assert.throws(() => parseInput('[1]'), /object/)
})
