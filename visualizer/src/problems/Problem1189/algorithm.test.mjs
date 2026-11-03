import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, phases } from './algorithm.js'

// Independent oracle: keep building copies while every letter still has enough supply.
function oracle(text) {
  const need = { b: 1, a: 1, l: 2, o: 2, n: 1 }
  const count = c => [...text].filter(x => x === c).length
  let copies = 0
  while (Object.entries(need).every(([c, k]) => count(c) >= (copies + 1) * k)) copies++
  return copies
}

test('text with repeated target letters and unrelated text', () => {
  assert.equal(buildTrace(parseInput('{"text":"ballooncedarballoonmossballoon"}')).result, oracle('ballooncedarballoonmossballoon'))
})

test('missing letters and a single l pair limit the answer', () => {
  assert.equal(buildTrace({ text: 'ballllllooooo' }).result, 0) // no a and no n
  assert.equal(buildTrace({ text: 'bbaallooooonn' }).result, 1) // two l letters allow one copy
  assert.equal(buildTrace({ text: 'cedar' }).result, 0)
})

test('random strings agree with the copy-building oracle', () => {
  let state = 3
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const alphabet = 'balonxyz'
  for (let t = 0; t < 300; t++) {
    const text = Array.from({ length: 1 + rand(40) }, () => alphabet[rand(alphabet.length)]).join('')
    assert.equal(buildTrace({ text }).result, oracle(text), text)
  }
})

test('every frame has a valid phase, code line, message and snapshot', () => {
  const run = buildTrace({ text: 'balloon' })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('input validation rejects uppercase and empty text', () => {
  assert.throws(() => parseInput('{"text":"Balloon"}'))
  assert.throws(() => parseInput('{"text":""}'))
})
