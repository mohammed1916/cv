import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

function maxDepth(text) {
  let depth = 0, best = 0
  for (const ch of text) { depth += ch === '(' ? 1 : -1; best = Math.max(best, depth) }
  return best
}

// Splits s by labels and checks that each group is a valid parentheses string.
function groupsOf(s, labels) {
  const parts = [[], []]
  s.split('').forEach((ch, i) => parts[labels[i]].push(ch))
  return parts.map(part => part.join(''))
}

function isBalanced(text) {
  let depth = 0
  for (const ch of text) { depth += ch === '(' ? 1 : -1; if (depth < 0) return false }
  return depth === 0
}

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.message.length > 10)
  }
}

test('sample gives one group label per character with a depth of 3 split into 2', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [1, 0, 1, 1, 0, 0, 0, 1, 1, 1])
})

test('the sample splits into two balanced groups whose nesting depths are each at most 2', () => {
  const s = examples[0].input
  const [a, b] = groupsOf(s, run(s).result)
  assert.ok(isBalanced(a) && isBalanced(b))
  assert.ok(Math.max(maxDepth(a), maxDepth(b)) <= Math.ceil(maxDepth(s) / 2))
})

test('a single pair goes to group 1 and all-shallow pairs alternate with depth 1', () => {
  assert.deepEqual(run('()').result, [1, 1])
  assert.deepEqual(run('()()').result, [1, 1, 1, 1])
})

test('random balanced strings split into balanced groups with minimal maximum depth', () => {
  let state = 5
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    let s = '', open = 0
    const len = 2 * (1 + rand(20))
    for (let i = 0; i < len; i++) {
      const remaining = len - i
      if (open === 0 || (open < remaining && rand(2) === 0)) { s += '('; open++ } else { s += ')'; open-- }
    }
    const labels = run(s).result
    const [a, b] = groupsOf(s, labels)
    assert.ok(isBalanced(a) && isBalanced(b), s)
    assert.ok(Math.max(maxDepth(a), maxDepth(b)) <= Math.ceil(maxDepth(s) / 2), s)
  }
})

test('invalid strings are rejected', () => {
  assert.throws(() => parseInput('())('))
  assert.throws(() => parseInput('(()'))
  assert.throws(() => parseInput('(a)'))
})
