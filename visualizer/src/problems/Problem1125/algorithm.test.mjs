import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1125 official example', () => {
  assert.deepEqual(solve({ req_skills: ['java', 'nodejs', 'reactjs'], people: [['java'], ['nodejs'], ['nodejs', 'reactjs']] }), [0, 2])
})

test('1125 one person who has every skill is the team', () => {
  assert.deepEqual(solve({ req_skills: ['a', 'b'], people: [['a'], ['a', 'b'], ['b']] }), [1])
})

test('1125 rejects a skill nobody holds', () => {
  assert.throws(() => parseInput('{"req_skills":["a","b"],"people":[["a"]]}'))
})

// Independent oracle: try every subset of people, and keep the smallest one that covers every skill.
function oracle(req, people) {
  let best = Infinity
  for (let mask = 1; mask < 1 << people.length; mask++) {
    const covered = new Set()
    let size = 0
    for (let p = 0; p < people.length; p++) {
      if (!(mask & (1 << p))) continue
      size++
      people[p].forEach(s => covered.add(s))
    }
    if (req.every(s => covered.has(s))) best = Math.min(best, size)
  }
  return best
}

test('1125 seeded random inputs match a subset oracle', () => {
  let seed = 1125
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const pool = ['a', 'b', 'c', 'd', 'e']
  for (let t = 0; t < 200; t++) {
    const req = pool.slice(0, 1 + rnd(5))
    const people = Array.from({ length: 1 + rnd(6) }, () => req.filter(() => rnd(2) === 1))
    const held = new Set(people.flat())
    for (const s of req) if (!held.has(s)) people[0] = [...people[0], s]
    const input = { req_skills: req, people }
    const team = solve(input)
    const covered = new Set(team.flatMap(p => people[p]))
    assert.ok(req.every(s => covered.has(s)), JSON.stringify(input))
    assert.equal(team.length, oracle(req, people), JSON.stringify(input))
    assert.deepEqual(team, [...team].sort((x, y) => x - y))
  }
})
