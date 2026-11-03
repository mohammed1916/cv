import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: keep a pool of frogs, each holding how many letters it has said.
// A c reuses an idle frog when one exists; any other letter must extend a frog that has said the letter before it.
function oracle(sound) {
  const word = 'croak'
  const pool = []
  let created = 0
  for (const ch of sound) {
    const j = word.indexOf(ch)
    if (j === 0) {
      let frog = pool.findIndex(said => said === 0)
      if (frog === -1) { pool.push(0); frog = pool.length - 1; created++ }
      pool[frog] = 1
    } else {
      const frog = pool.findIndex(said => said === j)
      if (frog === -1) return -1
      pool[frog] = j + 1 === 5 ? 0 : j + 1
    }
  }
  return pool.every(said => said === 0) ? created : -1
}

test('sample streams give the minimum frog count or -1', () => {
  assert.equal(buildTrace('croakcroak').result, 1)
  assert.equal(buildTrace('ccrrooaakk').result, 2)
  assert.equal(buildTrace('croakcrook').result, -1)
  assert.equal(buildTrace('cr').result, -1)
  assert.equal(buildTrace('crrk').result, -1)
})

test('random valid interleavings agree with the independent oracle', () => {
  let state = 11
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const frogs = 1 + rand(4)
    const next = Array(frogs).fill(0)
    let sound = ''
    const word = 'croak'
    let remaining = frogs * 5
    while (remaining > 0) {
      const options = next.map((n, f) => (n < 5 ? f : -1)).filter(f => f >= 0)
      const f = options[rand(options.length)]
      sound += word[next[f]]
      next[f]++
      remaining--
    }
    assert.equal(buildTrace(sound).result, oracle(sound), sound)
  }
})

test('random streams with invalid order agree with the oracle', () => {
  let state = 5
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rand(12)
    const sound = Array.from({ length: n }, () => 'croak'[rand(5)]).join('')
    assert.equal(buildTrace(sound).result, oracle(sound), sound)
  }
})

test('every frame names a valid phase and a code line inside the solver', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace('ccrrooaakk')
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 5)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
  assert.equal(run.frames.at(-1).phase, 'result')
  assert.equal(code.length, python.split('\n').length)
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('"croakx"'), /Only the letters/)
  assert.throws(() => parseInput('""'), /1 to 500/)
  assert.throws(() => parseInput('croak'), /JSON string/)
})
