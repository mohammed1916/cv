import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, examples } from './algorithm.js'

// Independent reference: plain recursion on the two suffixes, with memoisation.
function reference([first, second]) {
  const memo = new Map()
  const solve = (i, j) => {
    if (i === first.length || j === second.length) return 0
    const key = `${i},${j}`
    if (memo.has(key)) return memo.get(key)
    const value = first[i] === second[j]
      ? 1 + solve(i + 1, j + 1)
      : Math.max(solve(i + 1, j), solve(i, j + 1))
    memo.set(key, value)
    return value
  }
  return solve(0, 0)
}

function randomWords(seed) {
  let state = seed
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const word = () => Array.from({ length: 1 + rand(8) }, () => String.fromCharCode(97 + rand(4))).join('')
  return [word(), word()]
}

test('examples and random word pairs agree with the recursive reference', () => {
  for (const example of examples) {
    const pair = parseInput(example.input)
    assert.equal(buildTrace(pair).result, reference(pair), example.label)
  }
  for (let seed = 1; seed <= 200; seed++) {
    const pair = randomWords(seed)
    assert.equal(buildTrace(pair).result, reference(pair), JSON.stringify(pair))
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

test('invalid words are rejected with a readable message', () => {
  assert.throws(() => parseInput('["abc"]'), /exactly two/)
  assert.throws(() => parseInput('["abC","de"]'), /lowercase/)
})
