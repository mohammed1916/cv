import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python, code } from './algorithm.js'

const solve = (demand, fuel) => buildTrace({ demand, fuel }).result

// Oracle: try every assignment with absolute clock times, with no state merging.
function brute(demand, fuel) {
  let bestServed = 0
  let bestWorst = Infinity
  const walk = (car, allowed, free, left, worst) => {
    const options = [0, 1].filter(d => car < demand.length && left[d] >= demand[car])
    if (options.length === 0) {
      if (car > bestServed || (car === bestServed && worst < bestWorst)) {
        bestServed = car
        bestWorst = worst
      }
      return
    }
    for (const d of options) {
      const start = Math.max(allowed, free[d])
      const nextFree = free.slice()
      nextFree[d] = start + demand[car]
      const nextLeft = left.slice()
      nextLeft[d] -= demand[car]
      walk(car + 1, start, nextFree, nextLeft, Math.max(worst, start - allowed))
    }
  }
  walk(0, 0, [0, 0], fuel.slice(), 0)
  return bestServed === 0 ? -1 : bestWorst
}

test('4009 hand-computed cases', () => {
  // Car 0 uses one dispenser, car 1 the other: nobody waits.
  assert.equal(solve([4, 2], [5, 5]), 0)
  // Neither dispenser holds 9.
  assert.equal(solve([9, 1], [4, 7]), -1)
  // Car 1 cannot fit, so the process ends even though car 2 would fit. One car, no wait.
  assert.equal(solve([5, 9, 2], [6, 6]), 0)
  // Only dispenser 0 can take the cars of 3: the second waits 3.
  assert.equal(solve([3, 3], [6, 1]), 3)
  // Only one plan: 7 on dispenser 0, 3 on dispenser 1, then the 2 fits only on dispenser 0, busy until 7.
  assert.equal(solve([7, 3, 2], [9, 3]), 7)
})

test('4009 serving more cars outranks a shorter wait', () => {
  // Putting 2 on dispenser 1 avoids any wait but strands the 6. Serving all three means waiting.
  assert.equal(brute([2, 3, 6], [5, 6]), solve([2, 3, 6], [5, 6]))
  assert.equal(solve([2, 3, 6], [5, 6]), 2)
  assert.equal(buildTrace({ demand: [2, 3, 6], fuel: [5, 6] }).served, 3)
})

test('4009 waits count from when the car becomes allowed, not from time zero', () => {
  // All on dispenser 0. Car 1 waits 5 and starts at 5, so car 2 becomes allowed at 5 and starts at 11:
  // a wait of 6, not 11.
  assert.equal(solve([5, 6, 2], [13, 1]), 6)
  assert.equal(brute([5, 6, 2], [13, 1]), 6)
})

test('4009 input validation', () => {
  assert.throws(() => parseInput('{"demand":[],"fuel":[1,1]}'))
  assert.throws(() => parseInput('{"demand":[21],"fuel":[1,1]}'))
  assert.throws(() => parseInput('{"demand":[1],"fuel":[1]}'))
  assert.throws(() => parseInput('{"demand":[1],"fuel":[51,1]}'))
  assert.throws(() => parseInput('{"demand":[1,1,1,1,1,1,1,1,1],"fuel":[9,9]}'))
  assert.deepEqual(parseInput('{"demand":[3],"fuel":[4,5]}'), { demand: [3], fuel: [4, 5] })
})

test('4009 random inputs match brute force', () => {
  let seed = 4009
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 1500; t++) {
    const demand = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(1 + rnd(10)))
    const fuel = [1 + rnd(30), 1 + rnd(30)]
    assert.equal(solve(demand, fuel), brute(demand, fuel), JSON.stringify({ demand, fuel }))
  }
})

test('4009 the drawn best plan is valid and achieves the answer', () => {
  let seed = 40090
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const demand = Array.from({ length: 1 + rnd(7) }, () => 1 + rnd(9))
    const fuel = [1 + rnd(25), 1 + rnd(25)]
    const { frames, result, served } = buildTrace({ demand, fuel })
    if (result === -1) continue
    const plan = frames.at(-1).schedule
    assert.equal(plan.length, served)
    const left = fuel.slice()
    const free = [0, 0]
    let allowed = 0
    let worst = 0
    plan.forEach((s, i) => {
      assert.equal(s.car, i)
      assert.equal(s.allowed, allowed)
      assert.equal(s.start, Math.max(allowed, free[s.d]))
      assert.ok(left[s.d] >= demand[i])
      left[s.d] -= demand[i]
      free[s.d] = s.start + demand[i]
      worst = Math.max(worst, s.start - allowed)
      allowed = s.start
    })
    assert.equal(worst, result)
  }
})

test('4009 frames map to real lines and every example-shaped run terminates well', () => {
  for (const [demand, fuel] of [[[7, 3, 5, 4], [12, 7]], [[5, 9, 2], [6, 6]], [[9, 1], [4, 7]], [[4, 4, 2], [30, 30]]]) {
    const { frames } = buildTrace({ demand, fuel })
    const pyLines = python.split('\n')
    for (const f of frames) {
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(pyLines[f.pythonLine - 1].trim().length > 0)
      assert.ok(f.message.length > 0)
    }
    assert.equal(frames.at(-1).phase, 'done')
  }
  const dropping = buildTrace({ demand: [2, 2, 2, 2], fuel: [20, 20] }).frames
  assert.ok(dropping.some(f => f.phase === 'drop'))
})
