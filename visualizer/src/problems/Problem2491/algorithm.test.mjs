import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = skill => buildTrace({ skill }).result

test('2491 official examples', () => {
  assert.equal(solve([3, 2, 5, 1, 3, 4]), 22)
  assert.equal(solve([3, 4]), 12)
  assert.equal(solve([1, 1, 2, 3]), -1)
})

test('2491 rejects an odd number of players', () => {
  assert.throws(() => parseInput('{"skill":[1,2,3]}'))
})

// Independent oracle: a team total T must equal twice the average skill; then pair values with counts.
function oracle(skill) {
  const sum = skill.reduce((a, b) => a + b, 0)
  if ((2 * sum) % skill.length !== 0) return -1
  const total = (2 * sum) / skill.length
  const count = new Map()
  for (const v of skill) count.set(v, (count.get(v) || 0) + 1)
  let chemistry = 0
  for (const v of [...count.keys()].sort((a, b) => a - b)) {
    const need = total - v
    const c = count.get(v) || 0
    if (c === 0) continue
    if (need === v) {
      if (c % 2 !== 0) return -1
      chemistry += (c / 2) * v * v
      count.set(v, 0)
    } else {
      const d = count.get(need) || 0
      if (c !== d) return -1
      chemistry += c * v * need
      count.set(v, 0)
      count.set(need, 0)
    }
  }
  return chemistry
}

test('2491 random teams match a count-based oracle', () => {
  let seed = 2491
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const pairs = 1 + rnd(5)
    const base = 1 + rnd(6)
    const skill = []
    for (let p = 0; p < pairs; p++) {
      const a = 1 + rnd(8)
      // Usually build a valid split; sometimes break it so both outcomes are tested.
      const b = rnd(5) === 0 ? 1 + rnd(8) : base - a + 1 + 1
      skill.push(a, b)
    }
    const clean = skill.map(v => Math.max(1, Math.min(100, v)))
    assert.equal(solve(clean), oracle(clean), JSON.stringify(clean))
  }
})
