import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

const base = {
  foods: ['kimchi', 'miso', 'sushi', 'moussaka', 'ramen', 'bulgogi'],
  cuisines: ['korean', 'japanese', 'japanese', 'greek', 'japanese', 'korean'],
  ratings: [9, 12, 8, 15, 14, 7],
}

test('2353 official example', () => {
  const input = {
    ...base,
    operations: ['highestRated', 'highestRated', 'changeRating', 'highestRated', 'changeRating', 'highestRated'],
    arguments: [['korean'], ['japanese'], ['sushi', 16], ['japanese'], ['ramen', 16], ['japanese']],
  }
  assert.deepEqual(solve(input), ['kimchi', 'ramen', null, 'sushi', null, 'ramen'])
})

test('2353 a tie on rating goes to the smaller name', () => {
  const input = { foods: ['b', 'a'], cuisines: ['x', 'x'], ratings: [5, 5], operations: ['highestRated'], arguments: [['x']] }
  assert.deepEqual(solve(input), ['a'])
})

test('2353 rejects a change to a food that does not exist', () => {
  assert.throws(() => parseInput(JSON.stringify({ ...base, operations: ['changeRating'], arguments: [['pizza', 3]] })))
})

// Independent oracle: keep current ratings only and scan every food of the cuisine on each query.
function oracle({ foods, cuisines, ratings, operations, arguments: args }) {
  const rating = Object.fromEntries(foods.map((f, i) => [f, ratings[i]]))
  const cuisineOf = Object.fromEntries(foods.map((f, i) => [f, cuisines[i]]))
  return operations.map((op, i) => {
    if (op === 'changeRating') {
      rating[args[i][0]] = args[i][1]
      return null
    }
    let best = null
    for (const f of foods) {
      if (cuisineOf[f] !== args[i][0]) continue
      if (best === null || rating[f] > rating[best] || (rating[f] === rating[best] && f < best)) best = f
    }
    return best
  })
}

test('2353 random operation sequences match a scanning oracle', () => {
  let seed = 2353
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const names = ['a', 'bb', 'ccc', 'dd', 'e', 'ff']
  const cuisineNames = ['x', 'y', 'z']
  for (let t = 0; t < 300; t++) {
    const size = 1 + rnd(6)
    const foods = names.slice(0, size)
    const cuisines = foods.map(() => cuisineNames[rnd(3)])
    const ratings = foods.map(() => 1 + rnd(20))
    const operations = []
    const args = []
    for (let i = 0; i < 1 + rnd(10); i++) {
      if (rnd(2)) {
        operations.push('changeRating')
        args.push([foods[rnd(size)], 1 + rnd(20)])
      } else {
        const present = cuisines[rnd(size)]
        operations.push('highestRated')
        args.push([present])
      }
    }
    const input = { foods, cuisines, ratings, operations, arguments: args }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
