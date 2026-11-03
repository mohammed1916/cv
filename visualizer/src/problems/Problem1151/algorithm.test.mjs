import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, examples } from './algorithm.js'

// Independent reference: breadth-first search over every reachable arrangement, using one swap per step.
function reference(bits) {
  const n = bits.length
  const encode = arr => arr.reduce((acc, v, i) => acc | (v << i), 0)
  const contiguous = mask => {
    const positions = []
    for (let i = 0; i < n; i++) if (mask & (1 << i)) positions.push(i)
    return positions.length === 0 || positions.at(-1) - positions[0] + 1 === positions.length
  }
  const start = encode(bits)
  const seen = new Map([[start, 0]])
  const queue = [start]
  for (let head = 0; head < queue.length; head++) {
    const mask = queue[head]
    if (contiguous(mask)) return seen.get(mask)
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      if (((mask >> i) & 1) === ((mask >> j) & 1)) continue
      const next = mask ^ (1 << i) ^ (1 << j)
      if (!seen.has(next)) { seen.set(next, seen.get(mask) + 1); queue.push(next) }
    }
  }
  throw new Error('unreachable')
}

function randomBits(seed) {
  let state = seed
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  return Array.from({ length: 1 + rand(8) }, () => rand(2))
}

test('examples and random binary arrays agree with a swap-by-swap search', () => {
  for (const example of examples) {
    const bits = parseInput(example.input)
    assert.equal(buildTrace(bits).result, reference(bits), example.label)
  }
  for (let seed = 1; seed <= 200; seed++) {
    const bits = randomBits(seed)
    assert.equal(buildTrace(bits).result, reference(bits), JSON.stringify(bits))
  }
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
  assert.throws(() => parseInput('[1,2]'), /must be 0 or 1/)
  assert.throws(() => parseInput('[]'), /1 to 16/)
})
