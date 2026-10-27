import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3248 official examples', () => {
  assert.equal(solve('{"n":2,"commands":["RIGHT","DOWN"]}'), 3)
  assert.equal(solve('{"n":3,"commands":["DOWN","RIGHT","UP"]}'), 1)
})

test('3248 rejects a move that leaves the grid', () => {
  assert.throws(() => parseInput('{"n":2,"commands":["UP"]}'), /inside/)
})

// Independent oracle: add up the displacement of every command, then read off the cell index.
function oracle({ n, commands }) {
  const delta = { UP: [-1, 0], DOWN: [1, 0], LEFT: [0, -1], RIGHT: [0, 1] }
  let r = 0
  let c = 0
  for (const cmd of commands) {
    r += delta[cmd][0]
    c += delta[cmd][1]
  }
  return r * n + c
}

test('3248 seeded random walks match a displacement oracle', () => {
  let seed = 3248
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const names = ['UP', 'DOWN', 'LEFT', 'RIGHT']
  const deltas = { UP: [-1, 0], DOWN: [1, 0], LEFT: [0, -1], RIGHT: [0, 1] }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(7)
    const commands = []
    let r = 0
    let c = 0
    // Only pick moves that keep the snake on the grid, as the problem guarantees.
    for (let step = 0; step < 1 + rnd(20); step++) {
      const options = names.filter(name => {
        const nr = r + deltas[name][0]
        const nc = c + deltas[name][1]
        return nr >= 0 && nc >= 0 && nr < n && nc < n
      })
      if (options.length === 0) break
      const pick = options[rnd(options.length)]
      commands.push(pick)
      r += deltas[pick][0]
      c += deltas[pick][1]
    }
    const input = { n, commands }
    assert.equal(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
