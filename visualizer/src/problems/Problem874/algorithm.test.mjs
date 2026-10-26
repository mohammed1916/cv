import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = (o) => buildTrace(parseInput(JSON.stringify(o)))
// Oracle: complex-number rotation, string-keyed obstacle lookup.
function brute(commands, obstacles) {
  const obs = new Set(obstacles.map((o) => o.join('|')))
  let pos = [0, 0]; let dir = [0, 1]; let best = 0
  for (const c of commands) {
    if (c === -1) dir = [dir[1], -dir[0]]
    else if (c === -2) dir = [-dir[1], dir[0]]
    else for (let s = 0; s < c; s++) {
      const nxt = [pos[0] + dir[0], pos[1] + dir[1]]
      if (obs.has(nxt.join('|'))) break
      pos = nxt; best = Math.max(best, pos[0] ** 2 + pos[1] ** 2)
    }
  }
  return best
}

test('official examples', () => {
  assert.equal(run({ commands: [4, -1, 3], obstacles: [] }).result, 25)
  assert.equal(run({ commands: [4, -1, 4, -2, 4], obstacles: [[2, 4]] }).result, 65)
  assert.equal(run({ commands: [6, -1, -1, 6], obstacles: [] }).result, 36)
})

test('random vs independent simulation', () => {
  const pick = () => [-2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9][Math.floor(Math.random() * 11)]
  for (let t = 0; t < 400; t++) {
    const commands = Array.from({ length: 1 + Math.floor(Math.random() * 15) }, pick)
    const obstacles = Array.from({ length: Math.floor(Math.random() * 12) }, () => [Math.floor(Math.random() * 11) - 5, Math.floor(Math.random() * 11) - 5])
    const out = run({ commands, obstacles })
    assert.equal(out.result, brute(commands, obstacles))
    assert.equal(out.frames[0].phase, 'start')
    assert.equal(out.frames.at(-1).phase, 'done')
  }
})

test('invalid input rejected', () => {
  assert.throws(() => parseInput('{'))
  assert.throws(() => parseInput('{"commands":[0],"obstacles":[]}'))
  assert.throws(() => parseInput('{"commands":[1],"obstacles":[[1]]}'))
  assert.throws(() => parseInput('{"commands":[10],"obstacles":[]}'))
})
