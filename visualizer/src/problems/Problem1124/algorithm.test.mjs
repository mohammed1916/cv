import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

// Independent oracle: try every interval and count tiring days directly.
function oracle(hours) {
  let best = 0
  for (let i = 0; i < hours.length; i++) {
    for (let j = i; j < hours.length; j++) {
      let tiring = 0
      for (let k = i; k <= j; k++) if (hours[k] > 8) tiring++
      if (tiring * 2 > j - i + 1) best = Math.max(best, j - i + 1)
    }
  }
  return best
}

test('own samples give the expected lengths', () => {
  assert.equal(buildTrace([9, 9, 6, 1]).result, 3)
  assert.equal(buildTrace([8, 8, 8]).result, 0)
  assert.equal(buildTrace([12]).result, 1)
  assert.equal(buildTrace([6, 9, 9, 6, 6, 9, 9, 9]).result, 8)
})

test('random day lists agree with the brute-force oracle', () => {
  let state = 23
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 400; t++) {
    const hours = Array.from({ length: 1 + rand(30) }, () => rand(17))
    assert.equal(buildTrace(hours).result, oracle(hours), JSON.stringify(hours))
  }
})

test('every frame names a declared phase and a real code line', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace([9, 6, 9, 9, 1])
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(f.message.length > 5)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
  }
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('[9,17]'), /0 to 16/)
  assert.throws(() => parseInput('[]'), /1 to 40/)
  assert.throws(() => parseInput('{"hours":[1]}'), /JSON array/)
})
