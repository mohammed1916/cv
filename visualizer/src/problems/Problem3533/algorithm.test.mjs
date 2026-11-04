import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('3533 hand-computed cases', () => {
  // 7,20,34 ends in 34 (no); 7,34,20 ends in 20 (73420 = 4 x 18355).
  assert.deepEqual(solve([34, 7, 20], 4), [7, 34, 20])
  // Digit sum 14 is never divisible by 3, whatever the order.
  assert.deepEqual(solve([1, 4, 7, 2], 3), [])
  // 925100 = 25 x 37004. Numeric order puts 9 first.
  assert.deepEqual(solve([100, 9, 25], 25), [9, 25, 100])
  assert.deepEqual(solve([13], 7), [])
  assert.deepEqual(solve([14], 7), [14])
  // Every number divides by 1.
  assert.deepEqual(solve([8, 2, 5], 1), [2, 5, 8])
  // Equal values are fine: 1616 = 16 x 101.
  assert.deepEqual(solve([16, 16], 16), [16, 16])
})

test('3533 rejects out-of-range input', () => {
  for (const bad of ['{"nums":[],"k":3}', '{"nums":[0],"k":3}', '{"nums":[100001],"k":3}', '{"nums":[1],"k":0}', '{"nums":[1],"k":101}', '{"nums":[1,2,3,4,5,6,7],"k":3}', '[]']) {
    assert.throws(() => parseInput(bad), undefined, bad)
  }
  assert.doesNotThrow(() => parseInput('{"nums":[100000],"k":100}'))
})

// Oracle: every permutation in numeric lexicographic order, with the full number held as a BigInt.
function oracle(nums, k) {
  const sorted = [...nums].sort((a, b) => a - b)
  const used = sorted.map(() => false)
  const prefix = []
  const walk = () => {
    if (prefix.length === sorted.length) return BigInt(prefix.join('')) % BigInt(k) === 0n ? [...prefix] : null
    for (let i = 0; i < sorted.length; i++) {
      if (used[i]) continue
      used[i] = true
      prefix.push(sorted[i])
      const found = walk()
      prefix.pop()
      used[i] = false
      if (found) return found
    }
    return null
  }
  return walk() ?? []
}

test('3533 agrees with a brute-force permutation oracle', () => {
  let seed = 3533
  const next = limit => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % limit }
  for (let round = 0; round < 2500; round++) {
    const size = 1 + next(6)
    const big = next(3) === 0
    const nums = Array.from({ length: size }, () => 1 + next(big ? 100000 : 60))
    const k = 1 + next(100)
    assert.deepEqual(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})

test('3533 every frame carries the true remainder of what is written', () => {
  for (const example of examples) {
    const input = parseInput(example.input)
    const run = buildTrace(input)
    const sorted = run.input.nums
    for (const frame of run.frames) {
      if (frame.nodeId === null) continue
      const written = frame.path.map(i => sorted[i]).join('')
      assert.equal(frame.r, written ? Number(BigInt(written) % BigInt(input.k)) : 0)
      if (frame.calc) assert.equal(frame.calc.next, Number(BigInt(written + sorted[frame.candidate]) % BigInt(input.k)))
    }
  }
})

test('3533 frames and tree are well formed', () => {
  const pythonLines = python.trim().split('\n')
  const ids = new Set(phases.map(phase => phase.id))
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    run.frames.forEach((frame, index) => {
      assert.equal(frame.at, index)
      assert.ok(ids.has(frame.phase), frame.phase)
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pythonLines.length)
      assert.ok(pythonLines[frame.pythonLine - 1].trim().length > 0)
      assert.ok(frame.message.length > 0)
    })
    for (const node of run.nodes) {
      assert.ok(node.exit !== null && node.exit >= node.enter)
      assert.ok(['found', 'miss', 'dead', 'seen'].includes(node.outcome))
      assert.equal(run.frames[node.enter].nodeId, node.id)
    }
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})

test('3533 the dead-state example really hits recorded states', () => {
  const run = buildTrace(parseInput('{"nums":[1,4,7,2],"k":3}'))
  assert.ok(run.frames.filter(frame => frame.phase === 'memo').length >= 3)
  const backtrack = buildTrace(parseInput('{"nums":[34,7,20],"k":4}'))
  assert.ok(backtrack.nodes.some(node => node.outcome === 'miss'))
})

test('3533 the largest input stays small enough to step through', () => {
  const run = buildTrace({ nums: [11, 13, 17, 19, 23, 29], k: 97 })
  assert.deepEqual(run.result, oracle([11, 13, 17, 19, 23, 29], 97))
  const worst = buildTrace({ nums: [1, 2, 4, 5, 7, 8], k: 3 })
  assert.ok(worst.frames.length < 6000, String(worst.frames.length))
})
