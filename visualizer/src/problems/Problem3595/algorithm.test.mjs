import test from 'node:test'
import assert from 'node:assert/strict'
import { bitWidth, buildTrace, parseInput, python, code } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3595 hand-computed cases', () => {
  assert.deepEqual(solve([5, 9, 7, 9, 7, 9]), [5, 7])
  assert.deepEqual(solve([12, 6, 12, 12, 1, 6]), [1, 6])
  assert.deepEqual(solve([8, 2, 2]), [8, 2])
  assert.deepEqual(solve([2, 8, 8]), [2, 8])
})

test('3595 zero and negatives', () => {
  assert.deepEqual(solve([0, -2, 4, -2, 4, 4]), [0, -2])
  assert.deepEqual(solve([-1, 0, 0]), [-1, 0])
  assert.deepEqual(solve([0, -1, -1]), [0, -1])
  assert.deepEqual(solve([-5, -3, -3]), [-5, -3])
})

test('3595 32-bit extremes, including a pick on the sign bit', () => {
  const low = -(2 ** 31)
  const high = 2 ** 31 - 1
  assert.deepEqual(solve([low, high, high]), [low, high])
  assert.deepEqual(solve([high, low, low]), [high, low])
  assert.deepEqual(solve([low, 0, 0]), [low, 0])
  assert.deepEqual(solve([0, low, low]), [0, low])
})

test('3595 shared bits really do vanish in the first pass', () => {
  const { frames } = buildTrace({ nums: [5, 9, 7, 9, 7, 9] })
  const diff = frames.find(f => f.phase === 'diff')
  assert.equal(diff.firstPass.ones, 5 & ~7)
  assert.equal(diff.firstPass.twos, 7 & ~5)
  assert.equal(diff.diff, 2)
  assert.equal(frames.find(f => f.phase === 'pick').pick, 2)
})

test('3595 input validation', () => {
  assert.throws(() => parseInput('{"nums":[1,1]}'))
  assert.throws(() => parseInput('{"nums":[1,2,3]}'))
  assert.throws(() => parseInput('{"nums":[1,1,1,2,2,2]}'))
  assert.throws(() => parseInput('{"nums":[1,1,1,1,2,2,3]}'))
  assert.throws(() => parseInput('{"nums":[1.5,2,2]}'))
  assert.throws(() => parseInput('{"nums":[2147483648,2,2]}'))
  assert.deepEqual(parseInput('{"nums":[3,4,4]}').nums, [3, 4, 4])
})

function oracle(nums) {
  const counts = new Map()
  for (const v of nums) counts.set(v, (counts.get(v) ?? 0) + 1)
  let once
  let twice
  for (const [v, c] of counts) {
    if (c === 1) once = v
    if (c === 2) twice = v
  }
  return [once, twice]
}

test('3595 random arrays match a counting oracle', () => {
  let seed = 3595
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const value = wide => (wide ? ((rnd(65536) * 65536 + rnd(65536)) | 0) : rnd(17) - 8)
  for (let t = 0; t < 2000; t++) {
    const wide = t % 2 === 0
    const pool = new Set()
    const triples = rnd(4)
    while (pool.size < triples + 2) pool.add(value(wide))
    const [x, y, ...rest] = [...pool]
    const nums = [x, y, y, ...rest.flatMap(v => [v, v, v])]
    for (let i = nums.length - 1; i > 0; i--) {
      const j = rnd(i + 1)
      ;[nums[i], nums[j]] = [nums[j], nums[i]]
    }
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
    assert.deepEqual(parseInput(JSON.stringify({ nums })).nums, nums)
  }
})

test('3595 the drawn width loses no bit of any value', () => {
  for (const nums of [[5, 9, 7, 9, 7, 9], [0, -2, 4, -2, 4, 4], [0, -(2 ** 31), -(2 ** 31)], [8, 2, 2], [0, 1, 1]]) {
    const w = bitWidth(nums)
    for (const v of nums) {
      if (w === 32) continue
      const kept = v < 0 ? (v >> (w - 1)) : (v >>> w)
      assert.equal(kept, v < 0 ? -1 : 0, `${v} in ${w} columns`)
    }
  }
  assert.equal(bitWidth([0, 0, 0]), 1)
})

test('3595 frames track both passes and map to real lines', () => {
  const nums = [12, 6, 12, 12, 1, 6]
  const { frames } = buildTrace({ nums })
  const pyLines = python.split('\n')
  for (const f of frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(pyLines[f.pythonLine - 1].trim().length > 0)
    assert.ok(f.message.length > 0)
  }
  assert.equal(frames.filter(f => f.phase === 'count').length, nums.length)
  assert.equal(frames.filter(f => f.phase === 'group').length, nums.length)
  const end = frames.at(-1)
  assert.equal(end.groups[0].members.length + end.groups[1].members.length, nums.length)
  for (const f of frames.filter(g => g.phase === 'group')) {
    const line = pyLines[f.pythonLine - 1]
    assert.ok(line.includes(`ones${f.group} =`), line)
  }
})
