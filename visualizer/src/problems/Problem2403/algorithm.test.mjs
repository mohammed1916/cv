import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = power => buildTrace(power).result

// Independent oracle: simulate the day-by-day process for every kill order.
function simulate(order) {
  let energy = 0
  let rate = 1
  let days = 0
  for (const p of order) {
    while (energy < p) {
      energy += rate
      days++
    }
    energy = 0
    rate++
  }
  return days
}

function permutations(items) {
  if (items.length <= 1) return [items]
  return items.flatMap((x, i) => permutations([...items.slice(0, i), ...items.slice(i + 1)]).map(rest => [x, ...rest]))
}

function oracle(power) {
  return Math.min(...permutations(power).map(simulate))
}

test('2403 teaching examples', () => {
  assert.equal(solve([1]), 1)
  assert.equal(solve([1, 1, 1]), oracle([1, 1, 1]))
  assert.equal(solve([7, 3, 9, 5]), oracle([7, 3, 9, 5]))
  assert.equal(solve([4, 12, 6, 2, 9]), oracle([4, 12, 6, 2, 9]))
})

test('2403 a single kill waits power days at rate one', () => {
  assert.equal(solve([5]), 5)
})

test('2403 parseInput validates the list', () => {
  assert.deepEqual(parseInput('[3,4]'), [3, 4])
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[1,2,3,4,5,6,7]'))
})

test('2403 random inputs match the day-by-day simulation oracle', () => {
  let seed = 2403
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const power = Array.from({ length: 1 + rnd(5) }, () => 1 + rnd(20))
    assert.equal(solve(power), oracle(power), JSON.stringify(power))
  }
})

test('2403 frame invariants hold on every trace', () => {
  const run = buildTrace([7, 3, 9, 5])
  const phases = new Set(['start', 'settle', 'improve', 'keep', 'done'])
  for (const f of run.frames) {
    assert.ok(phases.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= python.trim().split('\n').length)
    assert.equal(f.best.length, 1 << 4)
  }
  const last = run.frames.at(-1)
  assert.equal(last.total, run.result)
  assert.equal(last.order.length, 4)
})
