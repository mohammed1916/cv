import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, code, python, phases } from './algorithm.js'

const CODE_LINES = new Map(code.map(entry => [entry.line, entry.text]))
const PYTHON_LINES = python.split('\n')
const PHASE_IDS = new Set(phases.map(phase => phase.id))

function assertFrameInvariants(run) {
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), `phase ${frame.phase}`)
    assert.ok(CODE_LINES.get(frame.activeLine)?.trim(), `pseudocode line ${frame.activeLine}`)
    assert.ok(PYTHON_LINES[frame.pythonLine - 1]?.trim(), `python line ${frame.pythonLine}`)
  }
}

// Independent oracle: transitive closure by breadth-first search, then every combination.
function oracle(synonyms, text) {
  const adj = new Map()
  const link = (a, b) => {
    if (!adj.has(a)) adj.set(a, new Set())
    if (!adj.has(b)) adj.set(b, new Set())
    adj.get(a).add(b)
    adj.get(b).add(a)
  }
  for (const [a, b] of synonyms) link(a, b)
  const optionsOf = word => {
    const seen = new Set([word])
    const queue = [word]
    while (queue.length) {
      const v = queue.shift()
      for (const w of adj.get(v) ?? []) if (!seen.has(w)) { seen.add(w); queue.push(w) }
    }
    return [...seen]
  }
  let sentences = ['']
  const words = text.split(' ')
  words.forEach((word, index) => {
    const next = []
    for (const prefix of sentences) {
      for (const option of optionsOf(word)) next.push(index === 0 ? option : `${prefix} ${option}`)
    }
    sentences = next
  })
  return [...new Set(sentences)].sort()
}

test('the two-group example merges happy, joy and cheerful transitively', () => {
  const text = '{"synonyms":[["happy","joy"],["sad","sorrow"],["joy","cheerful"]],"text":"I am happy today but was sad"}'
  const run = buildTrace(parseInput(text))
  assert.deepEqual(run.result, oracle(
    [['happy', 'joy'], ['sad', 'sorrow'], ['joy', 'cheerful']],
    'I am happy today but was sad',
  ))
  assert.ok(run.result.includes('I am cheerful today but was sorrow'))
  assert.equal(run.result.length, 6)
  assertFrameInvariants(run)
})

test('a single pair gives both spellings of the word', () => {
  assert.deepEqual(buildTrace(parseInput('{"synonyms":[["big","large"]],"text":"big house"}')).result, ['big house', 'large house'])
})

test('no synonyms leave the sentence unchanged', () => {
  assert.deepEqual(buildTrace(parseInput('{"synonyms":[],"text":"plain text"}')).result, ['plain text'])
})

test('parseInput rejects malformed pairs and sentences', () => {
  assert.throws(() => parseInput('{"synonyms":[["a"]],"text":"a"}'), /two words/)
  assert.throws(() => parseInput('{"synonyms":[],"text":"a  b"}'), /single spaces/)
  assert.throws(() => parseInput('{"synonyms":[],"text":"a b c d e f g h i"}'), /8 words/)
})

test('the trace agrees with the closure oracle on random small inputs', () => {
  let seed = 1258
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed
  }
  const vocabulary = ['a', 'b', 'c', 'd', 'e', 'f']
  for (let trial = 0; trial < 200; trial += 1) {
    const synonyms = Array.from({ length: next() % 4 }, () => [vocabulary[next() % 6], vocabulary[next() % 6]])
    const words = Array.from({ length: 1 + (next() % 3) }, () => vocabulary[next() % 6])
    const text = words.join(' ')
    const input = { synonyms, text }
    const serialised = JSON.stringify(input)
    const run = buildTrace(parseInput(serialised))
    assert.deepEqual(run.result, oracle(synonyms, text), serialised)
    assertFrameInvariants(run)
  }
})
