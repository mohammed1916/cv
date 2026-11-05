import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = road => buildTrace(parseInput(road)).result

test('2211 worked examples', () => {
  assert.equal(solve('RLRSLL'), 5)
  assert.equal(solve('LLRS'), 1)
  assert.equal(solve('SSS'), 0)
  assert.equal(solve('LLLRRR'), 0)
  assert.equal(solve('RRSLL'), 4)
})

test('2211 rejects invalid input', () => {
  assert.throws(() => parseInput('RLX'))
  assert.throws(() => parseInput(''))
  assert.throws(() => parseInput('R'.repeat(17)))
})

// Oracle: simulate the road tick by tick. Moving cars advance one cell and leave the road at the edges without a
// collision. Cars that land on the same cell, or swap cells, collide; a moving car that reaches a stopped car also
// collides. Collided cars stop where they are and stay on the road as obstacles. Count moving cars that collide.
function oracle(road) {
  let cars = road.split('').map((d, i) => ({ pos: i, dir: d === 'L' ? -1 : d === 'R' ? 1 : 0 }))
  let counted = 0
  for (let tick = 0; tick <= 3 * road.length && cars.some(c => c.dir !== 0); tick++) {
    const np = cars.map(c => (c.dir !== 0 ? c.pos + c.dir : c.pos))
    const gone = new Set()
    cars.forEach((c, i) => { if (c.dir !== 0 && (np[i] < 0 || np[i] >= road.length)) gone.add(i) })
    const hit = new Set()
    for (let i = 0; i < cars.length; i++) for (let j = i + 1; j < cars.length; j++) {
      if (gone.has(i) || gone.has(j)) continue
      const swap = cars[i].dir !== 0 && cars[j].dir !== 0 && cars[i].dir !== cars[j].dir && np[i] === cars[j].pos && np[j] === cars[i].pos
      if (np[i] === np[j] || swap) { hit.add(i); hit.add(j) }
    }
    for (let i = 0; i < cars.length; i++) {
      if (cars[i].dir === 0 || gone.has(i)) continue
      for (let j = 0; j < cars.length; j++) if (j !== i && cars[j].dir === 0 && np[i] === cars[j].pos) hit.add(i)
    }
    for (const i of hit) if (cars[i].dir !== 0) counted++
    cars = cars
      .map((c, i) => ({ pos: np[i], dir: hit.has(i) ? 0 : c.dir, gone: gone.has(i) }))
      .filter(c => !c.gone)
  }
  return counted
}

test('2211 random roads match a tick-by-tick simulation', () => {
  let seed = 2211
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const road = Array.from({ length: 1 + rnd(10) }, () => 'LRS'[rnd(3)]).join('')
    assert.equal(solve(road), oracle(road), road)
  }
})

test('2211 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('RLRSLL')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
