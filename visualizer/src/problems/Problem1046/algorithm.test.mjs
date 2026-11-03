import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, phases, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

function checkFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(frame.message.length > 0)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('own examples: a chain of differences, two equal stones, and one stone', () => {
  assert.equal(solve('[6,2,9,4]'), 1)
  assert.equal(solve('[3,3]'), 0)
  assert.equal(solve('[7]'), 7)
})

test('a cascade where every difference is the next heaviest', () => {
  assert.equal(solve('[10,4,4,2]'), 0)
})

test('frames pick two stones and smash them in pairs', () => {
  const run = buildTrace(parseInput('[6,2,9,4]'))
  checkFrames(run)
  assert.equal(run.frames.filter(f => f.phase === 'pick').length, 3)
  assert.deepEqual(run.frames.find(f => f.phase === 'pick').snapshot.picked, [9, 6])
})

test('invalid inputs are rejected by the parser', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0,3]'))
  assert.throws(() => parseInput('[1001]'))
  assert.throws(() => parseInput('[1,2.5]'))
})

// Independent oracle: the same rule written with a linear scan for the two largest values each round.
function oracle(stones) {
  const list = [...stones]
  while (list.length > 1) {
    let i = 0
    for (let j = 1; j < list.length; j++) if (list[j] > list[i]) i = j
    const x = list.splice(i, 1)[0]
    let k = 0
    for (let j = 1; j < list.length; j++) if (list[j] > list[k]) k = j
    const y = list.splice(k, 1)[0]
    if (x !== y) list.push(x - y)
  }
  return list.length ? list[0] : 0
}

test('seeded random stone lists agree with the linear-scan oracle', () => {
  let seed = 1046
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const stones = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(30))
    assert.equal(solve(JSON.stringify(stones)), oracle(stones), JSON.stringify(stones))
  }
})
