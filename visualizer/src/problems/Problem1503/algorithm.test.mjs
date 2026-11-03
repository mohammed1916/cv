import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (length, left, right) => buildTrace({ length, left, right }).result

// Independent oracle: simulate in half-step units. Ants reverse when they meet, and the last tick they fall at is the answer.
function simulate(length, left, right) {
  let ants = [...left.map(p => ({ pos: 2 * p, dir: -1 })), ...right.map(p => ({ pos: 2 * p, dir: 1 }))]
  // An ant already at the end it walks toward falls at time 0; every other ant moves at least once.
  let last = 0
  ants = ants.filter(a => !((a.dir < 0 && a.pos === 0) || (a.dir > 0 && a.pos === 2 * length)))
  let tick = 0
  while (ants.length) {
    tick++
    for (const a of ants) a.pos += a.dir
    for (const a of ants) if (ants.filter(b => b.pos === a.pos).length > 1) a.dir = -a.dir
    const fallen = ants.filter(a => a.pos <= 0 || a.pos >= 2 * length)
    if (fallen.length) last = tick
    ants = ants.filter(a => a.pos > 0 && a.pos < 2 * length)
  }
  return last / 2
}

test('1503 sample inputs give the expected moments', () => {
  assert.equal(solve(8, [1, 3], [5, 7]), 3)
  assert.equal(solve(10, [], [2, 6, 9]), 8)
  assert.equal(solve(6, [0, 4], [2]), 4)
  assert.equal(solve(5, [], []), 0)
})

test('1503 parseInput rejects malformed input', () => {
  assert.throws(() => parseInput('{"length":0,"left":[],"right":[1]}'), /length/)
  assert.throws(() => parseInput('{"length":5,"left":[2],"right":[2]}'), /distinct/)
  assert.throws(() => parseInput('{"length":5,"left":[9],"right":[]}'), /position/)
  assert.throws(() => parseInput('[1,2]'), /object/)
})

test('1503 random placements match the bounce simulation', () => {
  let seed = 29
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(20)
    const pool = Array.from({ length: length + 1 }, (_, i) => i)
    for (let i = pool.length - 1; i > 0; i--) { const j = rnd(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]] }
    const count = 1 + rnd(Math.min(8, pool.length))
    const chosen = pool.slice(0, count)
    const left = chosen.filter(() => rnd(2) === 0)
    const right = chosen.filter(p => !left.includes(p))
    assert.equal(solve(length, left, right), simulate(length, left, right), JSON.stringify({ length, left, right }))
  }
})

test('1503 every frame names a real phase, code lines and narration', () => {
  const run = buildTrace({ length: 8, left: [1, 3], right: [5, 7] })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
