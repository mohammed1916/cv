import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('2383 official examples', () => {
  assert.equal(solve({ initial_energy: 5, initial_experience: 3, energy: [1, 4, 3, 2], experience: [2, 6, 3, 1] }), 8)
  assert.equal(solve({ initial_energy: 2, initial_experience: 4, energy: [1], experience: [3] }), 0)
})

test('2383 energy must strictly exceed the total cost', () => {
  // Total energy cost is 3, so energy must reach 4: two training hours from 2.
  assert.equal(solve({ initial_energy: 2, initial_experience: 9, energy: [1, 2], experience: [1, 1] }), 2)
})

test('2383 rejects an opponent with zero energy cost', () => {
  assert.throws(() => parseInput('{"initial_energy":1,"initial_experience":1,"energy":[0],"experience":[1]}'))
})

// Independent oracle: try every split of training hours between energy and experience, all trained before the fights.
function oracle({ initial_energy, initial_experience, energy, experience }) {
  const canWin = (e, x) => {
    for (let i = 0; i < energy.length; i++) {
      if (e <= energy[i] || x <= experience[i]) return false
      e -= energy[i]
      x += experience[i]
    }
    return true
  }
  for (let hours = 0; ; hours++) {
    for (let a = 0; a <= hours; a++) {
      if (canWin(initial_energy + a, initial_experience + (hours - a))) return hours
    }
  }
}

test('2383 random opponents match a training-split oracle', () => {
  let seed = 2383
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(5)
    const input = {
      initial_energy: 1 + rnd(8),
      initial_experience: 1 + rnd(8),
      energy: Array.from({ length: len }, () => 1 + rnd(8)),
      experience: Array.from({ length: len }, () => 1 + rnd(8)),
    }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
