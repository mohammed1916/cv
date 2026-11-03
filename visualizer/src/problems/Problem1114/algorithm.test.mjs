import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

function permutations(items) {
  if (items.length <= 1) return [items]
  return items.flatMap((item, i) => permutations([...items.slice(0, i), ...items.slice(i + 1)]).map(rest => [item, ...rest]))
}

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.message.length > 10)
  }
}

test('sample calls 2, 1, 3 print firstsecondthird', () => {
  const trace = run('{"nums":[2,1,3]}')
  checkFrames(trace)
  assert.equal(trace.result, 'firstsecondthird')
})

test('every arrival order prints firstsecondthird', () => {
  for (const nums of permutations([1, 2, 3])) {
    const trace = run(JSON.stringify({ nums }))
    checkFrames(trace)
    assert.equal(trace.result, 'firstsecondthird', JSON.stringify(nums))
  }
})

test('a call that arrives early waits for the word before it', () => {
  const trace = run('{"nums":[3,2,1]}')
  assert.equal(trace.frames.filter(frame => frame.phase === 'wait').length, 2)
})

test('invalid call lists are rejected', () => {
  assert.throws(() => parseInput('{"nums":[1,1,3]}'))
  assert.throws(() => parseInput('{"nums":[1,2]}'))
})
