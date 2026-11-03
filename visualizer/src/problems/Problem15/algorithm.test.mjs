import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result
const key = t => t.join(',')
const sortTriples = list => [...list].sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])

// Independent oracle: every index triple, keeping each distinct value set once.
function brute(nums) {
  const seen = new Map()
  for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) for (let k = j + 1; k < nums.length; k++) {
    if (nums[i] + nums[j] + nums[k] === 0) {
      const t = [nums[i], nums[j], nums[k]].sort((a, b) => a - b)
      seen.set(key(t), t)
    }
  }
  return sortTriples([...seen.values()])
}

test('15 sample inputs give the expected triples', () => {
  assert.deepEqual(solve([4, -2, -2, 0, 6, -6, 1]), brute([4, -2, -2, 0, 6, -6, 1]))
  assert.deepEqual(solve([1, 2, 3, 4]), [])
  assert.deepEqual(solve([0, 0, 0, 0]), [[0, 0, 0]])
})

test('15 parseInput rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2]'), /3 to 12/)
  assert.throws(() => parseInput('[1,2,"3"]'), /integers/)
  assert.throws(() => parseInput('{"nums":[1,2,3]}'), /integers/)
})

test('15 random arrays match the brute-force oracle with no duplicate triples', () => {
  let seed = 21
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 3 + rnd(8) }, () => rnd(21) - 10)
    const got = solve(nums)
    assert.deepEqual(sortTriples(got), brute(nums), JSON.stringify(nums))
    assert.equal(new Set(got.map(key)).size, got.length, JSON.stringify(nums))
  }
})

test('15 every frame names a real phase, code lines and narration', () => {
  const run = buildTrace([4, -2, -2, 0, 6, -6, 1])
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
