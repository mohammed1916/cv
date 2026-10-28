import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (buses, passengers, capacity) => buildTrace(parseInput(JSON.stringify({ buses, passengers, capacity }))).result

test('2332 official examples', () => {
  assert.equal(solve([10, 20], [2, 17, 18, 19], 2), 16)
  assert.equal(solve([20, 30, 10], [19, 13, 26, 4, 25, 11, 21], 2), 20)
})

test('2332 a free seat on the last bus allows the bus time itself', () => {
  assert.equal(solve([10], [5], 2), 10)
})

test('2332 a passenger at the bus time pushes you one minute earlier', () => {
  assert.equal(solve([10], [10], 2), 9)
})

test('2332 rejects a capacity of zero', () => {
  assert.throws(() => parseInput('{"buses":[10],"passengers":[5],"capacity":0}'))
})

// Independent oracle: try each arrival time from the latest bus downward and simulate boarding with you included.
function oracle(buses, passengers, capacity) {
  const sortedBuses = [...buses].sort((a, b) => a - b)
  for (let t = sortedBuses[sortedBuses.length - 1]; t >= 1; t--) {
    if (passengers.includes(t)) continue
    const arrivals = [...passengers.map(time => ({ time, you: false })), { time: t, you: true }].sort((a, b) => a.time - b.time)
    let p = 0
    for (const bus of sortedBuses) {
      let seats = capacity
      while (p < arrivals.length && seats > 0 && arrivals[p].time <= bus) {
        if (arrivals[p].you) return t
        p++
        seats--
      }
    }
  }
  return -1
}

test('2332 random schedules match a simulation oracle', () => {
  let seed = 2332
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const buses = Array.from({ length: 1 + rnd(5) }, () => 2 + rnd(59))
    const passengers = Array.from({ length: 1 + rnd(8) }, () => 2 + rnd(59))
    const capacity = 1 + rnd(3)
    assert.equal(solve(buses, passengers, capacity), oracle(buses, passengers, capacity), JSON.stringify({ buses, passengers, capacity }))
  }
})
