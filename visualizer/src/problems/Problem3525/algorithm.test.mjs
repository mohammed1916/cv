import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = (nums, k, queries) => buildTrace(parseInput(JSON.stringify({ nums, k, queries }))).result

// Oracle: apply each update, then multiply outward from start for every end.
function oracle(input, k, queries) {
  const nums = [...input]
  return queries.map(([index, value, start, x]) => {
    nums[index] = value
    let running = 1 % k
    let count = 0
    for (let end = start; end < nums.length; end++) {
      running = (running * (nums[end] % k)) % k
      if (running === x) count++
    }
    return count
  })
}

test('3525 hand-computed cases', () => {
  // [6,3,2,5,3] mod 4 from 0: products 2,2,0,0,0, so remainder 2 occurs twice.
  // Then [6,3,2,5,6], from index 2: 2 mod 4 = 2, 10 mod 4 = 2, 60 mod 4 = 0, so remainder 1 never occurs.
  assert.deepEqual(solve([6, 7, 2, 5, 3], 4, [[1, 3, 0, 2], [4, 6, 2, 1]]), [2, 0])
  // [2,3,4,5,6,9] mod 5 from 3: 5, 30, 270 are all 0, so remainder 4 never occurs.
  assert.deepEqual(solve([2, 3, 4, 5, 6, 7], 5, [[5, 9, 3, 4]]), [0])
  // Modulo 3: 7 has remainder 1, the sole end position.
  assert.deepEqual(solve([10], 3, [[0, 7, 0, 1]]), [1])
})

test('3525 edge cases', () => {
  assert.deepEqual(solve([8, 9], 1, [[0, 3, 1, 0]]), [1], 'with k = 1 every remainder is 0')
  assert.deepEqual(solve([8, 9], 1, [[0, 3, 0, 0]]), [2])
  assert.deepEqual(solve([4, 4, 4], 2, [[0, 4, 0, 1]]), [0], 'multiples of k never give remainder 1')
  assert.deepEqual(solve([1000000000, 999999999], 3, [[1, 1000000000, 0, 1]]), [2], 'large values reduce before multiplying')
})

test('3525 an update persists into later queries', () => {
  assert.deepEqual(solve([1, 1, 1], 2, [[1, 2, 0, 1], [0, 1, 0, 1]]), [1, 1])
})

test('3525 parseInput rejects bad input', () => {
  const bad = obj => assert.throws(() => parseInput(JSON.stringify(obj)))
  bad({ nums: [], k: 2, queries: [[0, 1, 0, 0]] })
  bad({ nums: [0], k: 2, queries: [[0, 1, 0, 0]] })
  bad({ nums: [1], k: 6, queries: [[0, 1, 0, 0]] })
  bad({ nums: [1], k: 0, queries: [[0, 1, 0, 0]] })
  bad({ nums: [1], k: 2, queries: [] })
  bad({ nums: [1], k: 2, queries: [[1, 1, 0, 0]] })
  bad({ nums: [1], k: 2, queries: [[0, 1, 1, 0]] })
  bad({ nums: [1], k: 2, queries: [[0, 1, 0, 2]] })
  bad({ nums: Array(13).fill(1), k: 2, queries: [[0, 1, 0, 0]] })
})

function randomCase(rnd) {
  const n = 1 + rnd(12)
  const k = 1 + rnd(5)
  const nums = Array.from({ length: n }, () => 1 + rnd(30))
  const queries = Array.from({ length: 1 + rnd(6) }, () => [rnd(n), 1 + rnd(30), rnd(n), rnd(k)])
  return { nums, k, queries }
}

test('3525 random inputs match direct multiplication', () => {
  let seed = 3525
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let run = 0; run < 2000; run++) {
    const { nums, k, queries } = randomCase(rnd)
    assert.deepEqual(solve(nums, k, queries), oracle(nums, k, queries), JSON.stringify({ nums, k, queries }))
  }
})

test('3525 frames are well formed and the tree stays consistent', () => {
  const ids = new Set(phases.map(phase => phase.id))
  const pyCount = python.split('\n').length
  let seed = 41
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let run = 0; run < 150; run++) {
    const { nums, k, queries } = randomCase(rnd)
    const trace = buildTrace({ nums, k, queries })
    assert.equal(trace.frames.at(-1).phase, 'done')
    for (const frame of trace.frames) {
      assert.ok(ids.has(frame.phase))
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
      assert.ok(frame.message.length > 0)
    }
    // After every merge frame, the merged node must describe its range of the array at that moment.
    for (const frame of trace.frames.filter(item => item.shift?.kind === 'merge')) {
      const node = frame.tree.find(item => item.id === frame.node)
      const expected = Array(k).fill(0)
      let running = 1 % k
      for (let i = node.lo; i <= node.hi; i++) {
        running = (running * (frame.nums[i] % k)) % k
        expected[running]++
      }
      assert.deepEqual(node.cnt, expected)
      assert.equal(node.prod, running)
    }
    // The answer shown in each query matches the end-position strip the viewer sees.
    trace.frames.filter(item => item.phase === 'answer').forEach(frame => {
      const [, , start, x] = frame.query
      assert.equal(frame.ends.length, frame.nums.length - start)
      assert.equal(frame.ends.filter(entry => entry.remainder === x).length, frame.total[x])
    })
  }
})
