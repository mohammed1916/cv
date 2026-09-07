import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace as vowels, parseInput as parseString } from './Problem3913/algorithm.js'
import { buildTrace as increments, parseInput as parseArray, valueAtStep } from './Problem3914/algorithm.js'

test('3913 official examples and first-occurrence tie order', () => {
  for (const [input, output] of [['leetcode', 'leetcedo'], ['aeiaaioooa', 'aaaaoooiie'], ['baeiou', 'baeiou'], ['uoaei', 'uoaei'], ['rhythm', 'rhythm']]) {
    const run = vowels(input)
    assert.equal(run.result, output)
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) {
      assert.equal(frame.counts.reduce((a, b) => a + b, 0), frame.phase === 'start' ? 0
        : frame.phase === 'count' ? [...input.slice(0, frame.index + 1)].filter(c => 'aeiou'.includes(c)).length : run.positions.length)
    }
  }
})

test('3913 exhaustive small strings preserve consonants, multiset and ranked groups', () => {
  function check(s) {
    const run = vowels(s)
    const chars = [...s].filter(c => 'aeiou'.includes(c))
    const freq = c => chars.filter(x => x === c).length
    const expected = [...chars].sort((a, b) => freq(b) - freq(a) || s.indexOf(a) - s.indexOf(b))
    assert.deepEqual([...run.result].filter(c => 'aeiou'.includes(c)), expected)
    for (let i = 0; i < s.length; i++) if (!'aeiou'.includes(s[i])) assert.equal(run.result[i], s[i])
  }
  function visit(s) { if (s) check(s); if (s.length < 5) for (const c of 'beua') visit(s + c) }
  visit('')
})

// Independent shortest-path reference: each legal +1 subarray move costs one.
function bruteCost(nums) {
  const sorted = a => a.every((v, i) => !i || a[i - 1] <= v)
  const queue = [[nums, 0]], seen = new Set([nums.join(',')])
  for (let q = 0; q < queue.length; q++) {
    const [a, cost] = queue[q]
    if (sorted(a)) return cost
    for (let l = 0; l < a.length; l++) for (let r = l; r < a.length; r++) {
      const b = a.map((v, i) => v + Number(i >= l && i <= r)), key = b.join(',')
      if (!seen.has(key)) { seen.add(key); queue.push([b, cost + 1]) }
    }
  }
}

test('3914 examples and exhaustive arrays match a shortest-path oracle', () => {
  assert.equal(increments([3, 3, 2, 1]).result, 2)
  assert.equal(increments([5, 1, 2, 3]).result, 4)
  function visit(a) {
    if (a.length) {
      const run = increments(a)
      assert.equal(run.result, bruteCost(a), JSON.stringify(a))
      const constructed = a.map((_, i) => valueAtStep(run, run.frames.at(-1), i))
      assert.ok(constructed.every((v, i) => !i || constructed[i - 1] <= v))
      for (let i = 1; i < run.frames.length; i++) {
        const previous = run.frames[i - 1], current = run.frames[i]
        if (current.phase !== 'apply') continue
        for (let j = 0; j < a.length; j++) assert.equal(valueAtStep(run, current, j) - valueAtStep(run, previous, j), j >= current.index ? current.drop : 0)
      }
    }
    if (a.length < 3) for (let n = 1; n <= 3; n++) visit([...a, n])
  }
  visit([])
})

test('constraint-sized inputs keep final results and every event without snapshot copies', () => {
  const s = 'eu'.repeat(50000), run = vowels(s)
  assert.equal(run.result, 'e'.repeat(50000) + 'u'.repeat(50000))
  assert.equal(run.frames.length, 200003)
  const nums = Array.from({ length: 100000 }, (_, i) => i % 2 ? 1 : 1000000000)
  const arrayRun = increments(nums)
  assert.equal(arrayRun.result, 50000 * 999999999)
  assert.equal(arrayRun.frames.length, 200000)
  assert.equal(nums[1], 1)
})

test('invalid inputs are rejected without substituting demo data', () => {
  for (const s of ['[]', '""', '"Abc"', 'null']) assert.throws(() => parseString(s))
  for (const s of ['[]', '[0]', '[1.5]', '[1000000001]', '"abc"']) assert.throws(() => parseArray(s))
})
