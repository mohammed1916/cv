import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

function checkFrames(run) {
  const pyLines = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(typeof frame.message, 'string')
    assert.equal(frame.positions.length, run.input.positions.length)
    assert.ok(frame.positions.every(p => p >= 0 && p <= run.input.height))
  }
}

test('3279 authored presets', () => {
  assert.equal(solve({ height: 5, positions: [1, 3, 4], directions: ['up', 'down', 'up'] }), 9)
  assert.equal(solve({ height: 3, positions: [0, 3], directions: ['up', 'down'] }), 3)
  assert.equal(solve({ height: 4, positions: [2], directions: ['down'] }), 4)
})

test('3279 a piston at the top moving up reflects immediately', () => {
  assert.equal(solve({ height: 2, positions: [2], directions: ['up'] }), 2)
  assert.equal(solve({ height: 1, positions: [0], directions: ['up'] }), 1)
})

test('3279 parseInput rejects bad input', () => {
  assert.throws(() => parseInput('{"height":0,"positions":[0],"directions":["up"]}'))
  assert.throws(() => parseInput('{"height":3,"positions":[4],"directions":["up"]}'))
  assert.throws(() => parseInput('{"height":3,"positions":[1],"directions":["left"]}'))
})

// Independent oracle: simulate half-unit steps with explicit bounces and check every sampled time.
function oracle({ height, positions, directions }) {
  const pos = positions.map(x => x)
  const dir = directions.map(d => (d === 'up' ? 1 : -1))
  let best = pos.reduce((s, p) => s + p, 0)
  const cycle = 4 * height
  for (let half = 0; half < cycle; half++) {
    for (let i = 0; i < pos.length; i++) {
      let next = pos[i] + dir[i] * 0.5
      if (next > height || next < 0) {
        dir[i] = -dir[i]
        next = pos[i] + dir[i] * 0.5
      }
      pos[i] = next
    }
    best = Math.max(best, pos.reduce((s, p) => s + p, 0))
  }
  return best
}

test('3279 random systems match a half-step simulation oracle', () => {
  let seed = 3279
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const height = 1 + rnd(8)
    const k = 1 + rnd(4)
    const positions = Array.from({ length: k }, () => rnd(height + 1))
    const directions = Array.from({ length: k }, () => (rnd(2) ? 'up' : 'down'))
    assert.equal(solve({ height, positions, directions }), oracle({ height, positions, directions }), JSON.stringify({ height, positions, directions }))
  }
})

test('3279 frames keep pseudocode and python lines valid', () => {
  checkFrames(buildTrace({ height: 5, positions: [1, 3, 4], directions: ['up', 'down', 'up'] }))
})
