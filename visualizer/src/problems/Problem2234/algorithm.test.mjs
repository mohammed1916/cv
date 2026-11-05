import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (flowers, newFlowers, target, full, partial) => buildTrace({ flowers, newFlowers, target, full, partial }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = a => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(maximum_beauty([${a[0].join(',')}], ${a.slice(1).join(', ')}))`]).toString().trim())

test('2234 worked examples', () => {
  assert.equal(solve([1, 3, 1, 1], 7, 6, 12, 1), brute([1, 3, 1, 1], 7, 6, 12, 1))
  assert.equal(solve([2, 4, 5, 3], 10, 5, 2, 6), brute([2, 4, 5, 3], 10, 5, 2, 6))
  assert.equal(solve([3, 1, 6], 9, 7, 4, 2), brute([3, 1, 6], 9, 7, 4, 2))
})

test('2234 already complete gardens are never counted as incomplete', () => {
  assert.equal(solve([5, 5], 1, 5, 3, 7), 6)
  assert.equal(solve([7, 7, 7], 4, 5, 2, 9), 6)
})

test('2234 frames point at real python lines', () => {
  for (const f of buildTrace({ flowers: [1, 3, 2], newFlowers: 3, target: 3, full: 2, partial: 1 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2234 rejects bad input', () => {
  assert.throws(() => parseInput('{"flowers":[],"newFlowers":1,"target":1,"full":1,"partial":1}'))
  assert.throws(() => parseInput('{"flowers":[1],"newFlowers":0,"target":1,"full":1,"partial":1}'))
})

function brute(flowers, newFlowers, target, full, partial) {
  let best = 0
  const rec = (i, left, arr) => {
    if (i === arr.length) {
      const complete = arr.filter(x => x >= target).length
      const inc = arr.filter(x => x < target)
      const beauty = complete * full + (inc.length ? Math.min(...inc) * partial : 0)
      best = Math.max(best, beauty)
      return
    }
    for (let t = 0; t <= left; t++) {
      arr[i] = flowers[i] + t
      rec(i + 1, left - t, arr)
    }
    arr[i] = flowers[i]
  }
  rec(0, newFlowers, [...flowers])
  return best
}

test('2234 matches an exhaustive search over every way to plant the flowers', () => {
  let seed = 2234
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const flowers = Array.from({ length: 1 + rnd(3) }, () => 1 + rnd(6))
    const newFlowers = 1 + rnd(6)
    const target = 1 + rnd(6)
    const full = 1 + rnd(5)
    const partial = 1 + rnd(5)
    assert.equal(solve(flowers, newFlowers, target, full, partial), brute(flowers, newFlowers, target, full, partial), JSON.stringify({ flowers, newFlowers, target, full, partial }))
    if (t < 8) assert.equal(runPy([flowers, newFlowers, target, full, partial]), brute(flowers, newFlowers, target, full, partial))
  }
})
