import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (nums, forbidden) => buildTrace({ nums, forbidden }).result

test('3785 official examples', () => {
  assert.equal(solve([1, 2, 3], [3, 2, 1]), 1)
  assert.equal(solve([4, 6, 6, 5], [4, 6, 5, 5]), 2)
  assert.equal(solve([7, 7], [8, 7]), -1)
  assert.equal(solve([1, 2], [2, 1]), 0)
})

test('3785 example frames carry phase and python line', () => {
  const trace = buildTrace({ nums: [1, 2, 3], forbidden: [3, 2, 1] })
  const lines = python.split('\n')
  assert.ok(trace.frames.length > 0)
  for (const frame of trace.frames) {
    assert.ok(frame.phase && frame.message && frame.activeLine > 0)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= lines.length)
  }
})

// Brute force: BFS over arrangements reachable by swapping any two positions.
function brute(nums, forbidden) {
  const n = nums.length
  const start = nums.join(',')
  const seen = new Map([[start, 0]])
  const queue = [nums.slice()]
  while (queue.length) {
    const cur = queue.shift()
    const d = seen.get(cur.join(','))
    if (cur.every((v, i) => v !== forbidden[i])) return d
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const next = cur.slice()
        ;[next[i], next[j]] = [next[j], next[i]]
        const key = next.join(',')
        if (!seen.has(key)) {
          seen.set(key, d + 1)
          queue.push(next)
        }
      }
    }
  }
  return -1
}

test('3785 matches brute force on small inputs', () => {
  let seed = 12345
  const rand = k => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed % k
  }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rand(6)
    const values = 1 + rand(4)
    const nums = Array.from({ length: n }, () => 1 + rand(values))
    const forbidden = Array.from({ length: n }, () => 1 + rand(values))
    assert.equal(solve(nums, forbidden), brute(nums, forbidden), `nums=${nums} forbidden=${forbidden}`)
  }
})

test('3785 rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums":[1],"forbidden":[1,2]}'))
  assert.throws(() => parseInput('{"nums":[0],"forbidden":[1]}'))
  assert.throws(() => parseInput('[1]'))
  assert.deepEqual(parseInput('{"nums":[1,2],"forbidden":[2,1]}'), { nums: [1, 2], forbidden: [2, 1] })
})

const finalFrame = (nums, forbidden) => buildTrace({ nums, forbidden }).frames.at(-1)

test('3785 no conflicts reports zero bounds and chosen none', () => {
  const done = finalFrame([1, 2], [2, 1])
  const trace = buildTrace({ nums: [1, 2], forbidden: [2, 1] })
  assert.equal(trace.result, 0)
  assert.equal(done.phase, 'done')
  assert.deepEqual(done.bad, [])
  assert.equal(done.total, 0)
  assert.equal(done.chosen, 'none')
  assert.equal(done.violator, null)
})

test('3785 impossible capacity names the violating value', () => {
  const trace = buildTrace({ nums: [7, 7], forbidden: [8, 7] })
  const done = trace.frames.at(-1)
  assert.equal(trace.result, -1)
  assert.equal(done.violator, 7)
  assert.equal(done.capacity, 2)
  const counted = done.counts.find(c => c.value === 7)
  assert.equal(counted.count, 3)
  assert.equal(done.result, -1)
})

test('3785 balanced conflicts pick the half bound', () => {
  const done = finalFrame([1, 2, 3, 4], [1, 2, 3, 4])
  assert.equal(done.result, 2)
  assert.equal(done.total, 4)
  assert.equal(done.most, 1)
  assert.equal(done.half, 2)
  assert.equal(done.chosen, 'half')
  assert.deepEqual(done.bad, [0, 1, 2, 3])
  assert.deepEqual(done.groups.map(g => g.count), [1, 1, 1, 1])
})

test('3785 dominant group picks the group bound', () => {
  const done = finalFrame([1, 1, 2, 3], [1, 1, 4, 5])
  assert.equal(done.result, 2)
  assert.equal(done.total, 2)
  assert.equal(done.most, 2)
  assert.equal(done.half, 1)
  assert.equal(done.chosen, 'group')
  assert.deepEqual(done.bad, [0, 1])
  assert.deepEqual(done.groups, [{ value: 1, count: 2 }])
})

test('3785 frames snapshot partial state for the visual', () => {
  const trace = buildTrace({ nums: [1, 2, 3], forbidden: [3, 2, 1] })
  const conflictFrames = trace.frames.filter(f => f.phase === 'conflict')
  assert.deepEqual(conflictFrames.map(f => f.bad), [[], [1], [1]])
  const tally = trace.frames.find(f => f.phase === 'tally')
  assert.equal(tally.half, 1)
  assert.equal(tally.most, 1)
  assert.equal(trace.frames.at(-1).chosen, 'half')
})

test('3785 every frame line lookup resolves', () => {
  for (const [nums, forbidden] of [[[1, 1, 2, 3], [1, 1, 4, 5]], [[7, 7], [8, 7]], [[1, 2], [2, 1]]]) {
    for (const frame of buildTrace({ nums, forbidden }).frames) {
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= 9)
      assert.equal(typeof frame.message, 'string')
    }
  }
})
