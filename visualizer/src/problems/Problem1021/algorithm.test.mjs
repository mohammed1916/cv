import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code } from './algorithm.js'

const ids = phases.map(phase => phase.id)

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
  }
}

// Independent oracle: cut the string into primitive balanced sections with a separate scan,
// then drop the first and last character of each section.
function oracle(s) {
  const sections = []
  let start = 0
  let balance = 0
  for (let i = 0; i < s.length; i++) {
    balance += s[i] === '(' ? 1 : -1
    if (balance === 0) {
      sections.push(s.slice(start + 1, i))
      start = i + 1
    }
  }
  return sections.join('')
}

test('sample inputs give the expected text', () => {
  assert.equal(buildTrace({ s: '(()())(())' }).result, '()()()')
  assert.equal(buildTrace({ s: '()()' }).result, '')
  assert.equal(buildTrace({ s: '(((())))' }).result, '((()))')
  for (const example of examples) checkFrames(buildTrace(parseInput(example.input)))
})

test('seeded random balanced strings match the section oracle', () => {
  let seed = 1021
  const next = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed >> 16 }
  const balanced = pairs => {
    let out = ''
    let open = 0
    let remaining = pairs
    while (remaining > 0 || open > 0) {
      if (remaining > 0 && (open === 0 || next() % 2 === 0)) { out += '('; open++; remaining-- } else { out += ')'; open-- }
    }
    return out
  }
  for (let t = 0; t < 300; t++) {
    const s = balanced(1 + (next() % 40))
    const trace = buildTrace({ s })
    assert.equal(trace.result, oracle(s), s)
    checkFrames(trace)
  }
})

test('invalid strings are rejected', () => {
  assert.throws(() => parseInput('{"s":")("}'))
  assert.throws(() => parseInput('{"s":"(()"}'))
  assert.throws(() => parseInput('{"s":"(a)"}'))
  assert.throws(() => parseInput('{"s":""}'))
})
