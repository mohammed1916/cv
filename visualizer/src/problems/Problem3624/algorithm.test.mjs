import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, depthChain, parseInput, code, python, phases } from './algorithm.js'

const solve = (nums, queries) => buildTrace({ nums, queries }).result

test('3624 hand-computed depth chains', () => {
  assert.deepEqual(depthChain(1), [1])
  assert.deepEqual(depthChain(8), [8, 1])
  assert.deepEqual(depthChain(15), [15, 4, 1])
  assert.deepEqual(depthChain(31), [31, 5, 2, 1])
  assert.deepEqual(depthChain(6), [6, 2, 1])
})

test('3624 hand-computed queries', () => {
  // Depths of 7, 8, 3, 1, 15, 6 are 3, 1, 2, 0, 2, 2. Then position 3 becomes 31, depth 3.
  assert.deepEqual(solve([7, 8, 3, 1, 15, 6], [[1, 0, 5, 2], [2, 3, 31], [1, 1, 4, 3], [1, 2, 2, 0]]), [3, 1, 0])
  // 5, 9, 12 all have two set bits, so depth 2; 6 keeps depth 2 at position 1.
  assert.deepEqual(solve([5, 9, 12], [[1, 0, 2, 2], [2, 1, 6], [1, 1, 2, 2]]), [3, 2])
  assert.deepEqual(solve([4], [[2, 0, 2], [1, 0, 0, 1]]), [1])
  assert.deepEqual(solve([4], [[2, 0, 2]]), [])
})

test('3624 values above 32 bits are counted exactly', () => {
  const big = 1000000000000000
  const bits = BigInt(big).toString(2).replace(/0/g, '').length
  assert.equal(depthChain(big)[1], bits)
  const two = 2 ** 49
  assert.deepEqual(depthChain(two), [two, 1])
  assert.deepEqual(depthChain(2 ** 49 + 1), [2 ** 49 + 1, 2, 1])
})

test('3624 parseInput enforces the rules', () => {
  assert.doesNotThrow(() => parseInput('{"nums":[1],"queries":[[1,0,0,0]]}'))
  assert.throws(() => parseInput('{"nums":[0],"queries":[[1,0,0,0]]}'))
  assert.throws(() => parseInput('{"nums":[1],"queries":[[1,0,0,6]]}'))
  assert.throws(() => parseInput('{"nums":[1,1],"queries":[[1,1,0,0]]}'))
  assert.throws(() => parseInput('{"nums":[1],"queries":[[1,0,1,0]]}'))
  assert.throws(() => parseInput('{"nums":[1],"queries":[[2,0,0]]}'))
  assert.throws(() => parseInput('{"nums":[1],"queries":[[3,0,1]]}'))
  assert.throws(() => parseInput('{"nums":[1],"queries":[[2,0,1000000000000001]]}'))
})

// Oracle: recompute every depth with BigInt on each query and rescan the range.
function bigDepth(x) {
  let value = BigInt(x), depth = 0
  while (value !== 1n) { value = BigInt(value.toString(2).replace(/0/g, '').length); depth++ }
  return depth
}
function oracle(nums, queries) {
  const a = nums.slice(), out = []
  for (const q of queries) {
    if (q[0] === 1) {
      let count = 0
      for (let j = q[1]; j <= q[2]; j++) if (bigDepth(a[j]) === q[3]) count++
      out.push(count)
    } else a[q[1]] = q[2]
  }
  return out
}

test('3624 random streams match a rescanning oracle', () => {
  let seed = 3624
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  const value = () => (rnd(4) === 0 ? 1 + rnd(32768) * 2 ** 34 + rnd(1024) : 1 + rnd(200))
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const nums = Array.from({ length: n }, value)
    const queries = Array.from({ length: 1 + rnd(8) }, () => {
      if (rnd(2)) return [2, rnd(n), value()]
      const l = rnd(n), r = l + rnd(n - l)
      return [1, l, r, rnd(6)]
    })
    const parsed = parseInput(JSON.stringify({ nums, queries }))
    assert.deepEqual(buildTrace(parsed).result, oracle(nums, queries), JSON.stringify({ nums, queries }))
  }
})

test('3624 trees stay consistent: each position counted in exactly one depth', () => {
  const { frames } = buildTrace({ nums: [7, 8, 3], queries: [[2, 0, 1], [1, 0, 2, 0]] })
  const last = frames.at(-1)
  assert.deepEqual(last.depths, [0, 1, 2])
  const total = tree => { let sum = 0; for (let i = tree.length; i > 0; i -= i & -i) sum += tree[i - 1]; return sum }
  assert.deepEqual(last.trees.map(total), [1, 1, 1, 0, 0, 0])
})

test('3624 frames are well formed and a query reads only tree k', () => {
  const known = new Set(phases.map(p => p.id))
  const pythonLines = python.split('\n')
  const { frames } = buildTrace({ nums: [7, 8, 3, 1, 15, 6], queries: [[1, 0, 5, 2], [2, 3, 31], [1, 1, 4, 3]] })
  assert.equal(frames[0].phase, 'start')
  assert.equal(frames.at(-1).phase, 'done')
  for (const f of frames) {
    assert.ok(known.has(f.phase), f.phase)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(pythonLines[f.pythonLine - 1]?.trim(), `python line ${f.pythonLine}`)
    assert.ok(f.message.length > 0)
    if (f.phase === 'prefix') assert.equal(f.activeTree, f.k)
  }
})
