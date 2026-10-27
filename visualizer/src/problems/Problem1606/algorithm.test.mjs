import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1606 official examples', () => {
  assert.deepEqual(solve({ k: 3, arrival: [1, 2, 3, 4, 5], load: [5, 2, 3, 3, 3] }), [1])
  assert.deepEqual(solve({ k: 3, arrival: [1, 2, 3, 4], load: [1, 2, 1, 2] }), [0])
  assert.deepEqual(solve({ k: 3, arrival: [1, 2, 3], load: [10, 12, 11] }), [0, 1, 2])
})

test('1606 a request wraps around to the lowest free server', () => {
  // Request 3 prefers server 1, which is busy until 12, so it wraps to server 0, which is free since 4.
  assert.deepEqual(solve({ k: 2, arrival: [1, 2, 3, 5], load: [1, 10, 1, 1] }), [0])
})

test('1606 rejects arrival times that are not strictly increasing', () => {
  assert.throws(() => parseInput('{"k":2,"arrival":[1,1],"load":[1,1]}'))
})

// Independent oracle: keep the time each server becomes free and scan servers in circular order from i mod k.
function oracle({ k, arrival, load }) {
  const freeAt = Array(k).fill(-Infinity)
  const handled = Array(k).fill(0)
  arrival.forEach((t, i) => {
    for (let j = 0; j < k; j++) {
      const s = (i % k + j) % k
      if (freeAt[s] <= t) {
        handled[s]++
        freeAt[s] = t + load[i]
        return
      }
    }
  })
  const best = Math.max(...handled)
  return handled.map((c, s) => s).filter(s => handled[s] === best)
}

test('1606 random inputs match a circular-scan oracle', () => {
  let seed = 1606
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(10)
    const arrival = []
    let time = 0
    for (let i = 0; i < count; i++) { time += 1 + rnd(4); arrival.push(time) }
    const input = { k: 1 + rnd(4), arrival, load: arrival.map(() => 1 + rnd(6)) }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
