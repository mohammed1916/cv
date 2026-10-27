import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('1575 official examples', () => {
  assert.equal(solve('{"locations":[2,3,6,8,4],"start":1,"finish":3,"fuel":5}'), 4)
  assert.equal(solve('{"locations":[4,3,1],"start":1,"finish":0,"fuel":6}'), 5)
  assert.equal(solve('{"locations":[5,2,1],"start":0,"finish":2,"fuel":3}'), 0)
})

test('1575 the route that stops at the start counts when start equals finish', () => {
  // With no fuel the only route is the empty one, which still counts.
  assert.equal(solve('{"locations":[1,2],"start":0,"finish":0,"fuel":0}'), 1)
})

test('1575 rejects invalid input', () => {
  assert.throws(() => parseInput('{"locations":[1,2],"start":0,"finish":1,"fuel":21}'))
  assert.throws(() => parseInput('{"locations":[1,1],"start":0,"finish":1,"fuel":2}'))
})

// Independent oracle: enumerate every move sequence explicitly and count the ones that end at finish.
function oracle({ locations, start, finish, fuel }) {
  let count = 0
  const walk = (city, left) => {
    if (city === finish) count++
    for (let next = 0; next < locations.length; next++) {
      if (next === city) continue
      const cost = Math.abs(locations[city] - locations[next])
      if (cost <= left) walk(next, left - cost)
    }
  }
  walk(start, fuel)
  return count
}

test('1575 random inputs match an explicit route enumeration', () => {
  let seed = 1575
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 2 + rnd(4)
    const locations = []
    while (locations.length < count) {
      const v = 1 + rnd(30)
      if (!locations.includes(v)) locations.push(v)
    }
    const input = { locations, start: rnd(count), finish: rnd(count), fuel: rnd(9) }
    assert.equal(buildTrace(parseInput(JSON.stringify(input))).result, oracle(input), JSON.stringify(input))
  }
})
