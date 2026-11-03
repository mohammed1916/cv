import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, examples } from './algorithm.js'

// Independent reference: try every decrement amount for every element (small inputs only) and keep the cheapest zigzag.
const K = 12
function isZigzag(b) {
  const n = b.length
  const lowFirst = b.every((v, i) => i === n - 1 || (i % 2 === 0 ? b[i] < b[i + 1] : b[i] > b[i + 1]))
  const highFirst = b.every((v, i) => i === n - 1 || (i % 2 === 0 ? b[i] > b[i + 1] : b[i] < b[i + 1]))
  return lowFirst || highFirst
}
function reference(a) {
  let best = Infinity
  const b = Array(a.length)
  const search = (i, cost) => {
    if (cost >= best) return
    if (i === a.length) { if (isZigzag(b)) best = cost; return }
    for (let d = 0; d <= K; d++) { b[i] = a[i] - d; search(i + 1, cost + d) }
  }
  search(0, 0)
  return best
}

function randomValues(seed) {
  let state = seed
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  return Array.from({ length: 1 + rand(5) }, () => 1 + rand(6))
}

test('examples and small random arrays agree with the exhaustive reference', () => {
  for (const example of examples) {
    const nums = parseInput(example.input)
    if (nums.length <= 5) assert.equal(buildTrace(nums).result, reference(nums), example.label)
  }
  for (let seed = 1; seed <= 120; seed++) {
    const nums = randomValues(seed)
    assert.equal(buildTrace(nums).result, reference(nums), JSON.stringify(nums))
  }
})

test('a single value needs no work', () => {
  assert.equal(buildTrace([4]).result, 0)
})

test('every frame has a declared phase, a valid code line, narration and a snapshot', () => {
  const ids = new Set(phases.map(phase => phase.id))
  const run = buildTrace(parseInput(examples[0].input))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('invalid values are rejected with a readable message', () => {
  assert.throws(() => parseInput('[0,2]'), /Value 1/)
  assert.throws(() => parseInput('[]'), /1 to 12/)
})
