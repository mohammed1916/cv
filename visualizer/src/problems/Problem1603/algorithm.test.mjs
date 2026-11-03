import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent reference: count accepted cars per type against that type's capacity.
function reference(slots, cars) {
  const used = [0, 0, 0, 0]
  return cars.map(type => {
    if (used[type] < slots[type - 1]) { used[type] += 1; return true }
    return false
  })
}

function assertFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(f.message.length > 10)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length, `code line ${f.activeLine}`)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= python.split('\n').length, `python line ${f.pythonLine}`)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('sample with mixed types gives the expected accept and reject pattern', () => {
  const run = buildTrace(parseInput('{"slots":[2,1,1],"cars":[1,1,2,1,3,3,1,2]}'))
  assert.deepEqual(run.result, [true, true, true, false, true, false, false, false])
})

test('a type with zero capacity rejects every request of that type', () => {
  assert.deepEqual(buildTrace(parseInput('{"slots":[0,2,0],"cars":[1,3,2,1]}')).result, [false, false, true, false])
})

test('random inputs agree with the reference and every frame is well formed', () => {
  let seed = 9
  const rand = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % m }
  for (let t = 0; t < 200; t++) {
    const slots = [rand(4), rand(4), rand(4)]
    const cars = Array.from({ length: 1 + rand(12) }, () => 1 + rand(3))
    const run = buildTrace({ slots, cars })
    assert.deepEqual(run.result, reference(slots, cars), JSON.stringify({ slots, cars }))
    assertFrames(run)
  }
})

test('invalid input is rejected with a message', () => {
  assert.throws(() => parseInput('{"slots":[1,2],"cars":[1]}'), /slots/)
  assert.throws(() => parseInput('{"slots":[1,2,3],"cars":[4]}'), /cars/)
})
