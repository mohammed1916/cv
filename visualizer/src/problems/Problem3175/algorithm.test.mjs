import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3175 official examples', () => {
  assert.equal(solve('{"skills":[4,2,6,3,9],"k":2}'), 2)
  assert.equal(solve('{"skills":[2,5,4],"k":3}'), 1)
})

test('3175 rejects repeated skills', () => {
  assert.throws(() => parseInput('{"skills":[3,3],"k":1}'), /distinct/)
})

// Independent oracle: the champion of a game is the stronger player; find the first index whose winning run reaches k
// by replaying each game on a fresh array of rounds.
function oracle({ skills, k }) {
  let order = skills.map((_, i) => i)
  let streak = 0
  let front = order[0]
  order = order.slice(1)
  for (;;) {
    const rival = order[0]
    const rest = order.slice(1)
    const winner = skills[front] > skills[rival] ? front : rival
    const loser = winner === front ? rival : front
    streak = winner === front ? streak + 1 : 1
    front = winner
    order = [...rest, loser]
    if (streak === k) return front
  }
}

test('3175 seeded random cases match a replay oracle', () => {
  let seed = 3175
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(8)
    const pool = Array.from({ length: 100 }, (_, i) => i + 1)
    const skills = []
    for (let i = 0; i < n; i++) skills.push(pool.splice(rnd(pool.length), 1)[0])
    const input = { skills, k: 1 + rnd(6) }
    assert.equal(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
