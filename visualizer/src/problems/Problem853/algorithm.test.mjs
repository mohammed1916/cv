import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = (o) => buildTrace(parseInput(JSON.stringify(o)))
// Oracle: car i leads a fleet iff every car ahead of it arrives strictly earlier.
function brute(target, position, speed) {
  let c = 0
  for (let i = 0; i < position.length; i++) {
    let lead = true
    for (let j = 0; j < position.length; j++) if (position[j] > position[i] && (target - position[j]) * speed[i] >= (target - position[i]) * speed[j]) lead = false
    if (lead) c++
  }
  return c
}

test('official examples', () => {
  assert.equal(run({ target: 12, position: [10, 8, 0, 5, 3], speed: [2, 4, 1, 1, 3] }).result, 3)
  assert.equal(run({ target: 10, position: [3], speed: [3] }).result, 1)
  assert.equal(run({ target: 100, position: [0, 2, 4], speed: [4, 2, 1] }).result, 1)
})

test('random vs pairwise oracle', () => {
  for (let t = 0; t < 500; t++) {
    const target = 2 + Math.floor(Math.random() * 20)
    const position = [...Array(target).keys()].sort(() => Math.random() - 0.5).slice(0, 1 + Math.floor(Math.random() * Math.min(target, 8)))
    const speed = position.map(() => 1 + Math.floor(Math.random() * 6))
    const out = run({ target, position, speed })
    assert.equal(out.result, brute(target, position, speed))
    assert.equal(out.frames.at(-1).phase, 'done')
  }
})

test('invalid input rejected', () => {
  assert.throws(() => parseInput('x'))
  assert.throws(() => parseInput('{"target":10,"position":[1,1],"speed":[1,2]}'), /distinct/)
  assert.throws(() => parseInput('{"target":10,"position":[1],"speed":[0]}'))
  assert.throws(() => parseInput('{"target":10,"position":[10],"speed":[1]}'))
})
