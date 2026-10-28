import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1488 official examples', () => {
  assert.deepEqual(solve({ rains: [1, 2, 3, 4] }), [-1, -1, -1, -1])
  assert.deepEqual(solve({ rains: [1, 2, 0, 0, 2, 1] }), [-1, -1, 2, 1, -1, -1])
  assert.deepEqual(solve({ rains: [1, 2, 0, 1, 2] }), [])
})

test('1488 a dry day after the last rain is used, and a flood with no later dry day fails', () => {
  assert.deepEqual(solve({ rains: [0, 1, 0, 1] }), [1, -1, 1, -1])
  assert.deepEqual(solve({ rains: [1, 1] }), [])
})

test('1488 rejects a lake number above 5', () => {
  assert.throws(() => parseInput('{"rains":[6]}'))
})

// Independent oracle: try every choice of lake for every dry day and simulate the city.
function feasible(rains) {
  const dryDays = rains.flatMap((r, i) => (r === 0 ? [i] : []))
  const maxLake = Math.max(0, ...rains)
  const base = maxLake + 1
  for (let code = 0; code < base ** dryDays.length; code++) {
    const choice = new Map()
    let rest = code
    for (const d of dryDays) {
      choice.set(d, rest % base)
      rest = Math.floor(rest / base)
    }
    const full = new Set()
    let ok = true
    for (let day = 0; day < rains.length && ok; day++) {
      if (rains[day] === 0) {
        const lake = choice.get(day)
        if (lake > 0) full.delete(lake)
      } else {
        if (full.has(rains[day])) ok = false
        full.add(rains[day])
      }
    }
    if (ok) return true
  }
  return false
}

// Simulate a returned answer: a rain on a full lake is a flood; a dry day empties its chosen lake.
function validAnswer(rains, answer) {
  const full = new Set()
  for (let day = 0; day < rains.length; day++) {
    if (rains[day] === 0) {
      if (answer[day] > 0) full.delete(answer[day])
    } else {
      if (full.has(rains[day])) return false
      full.add(rains[day])
    }
  }
  return true
}

test('1488 random cities match an every-choice oracle', () => {
  let seed = 1488
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rains = Array.from({ length: 1 + rnd(7) }, () => rnd(4))
    const out = solve({ rains })
    assert.equal(out.length === 0, !feasible(rains), JSON.stringify(rains))
    if (out.length) assert.ok(validAnswer(rains, out), JSON.stringify(rains))
  }
})
