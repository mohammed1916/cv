import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.equal(typeof frame.snapshot, 'object')
  }
}

// Independent oracle: repeatedly replace the first brace group with each of its alternatives.
function oracle(s) {
  const open = s.indexOf('{')
  if (open < 0) return new Set([s])
  let depth = 0
  let close = -1
  for (let i = open; i < s.length; i++) {
    if (s[i] === '{') depth++
    else if (s[i] === '}') { depth--; if (depth === 0) { close = i; break } }
  }
  const inner = s.slice(open + 1, close)
  const alternatives = []
  let level = 0
  let begin = 0
  for (let i = 0; i < inner.length; i++) {
    if (inner[i] === '{') level++
    else if (inner[i] === '}') level--
    else if (inner[i] === ',' && level === 0) { alternatives.push(inner.slice(begin, i)); begin = i + 1 }
  }
  alternatives.push(inner.slice(begin))
  const out = new Set()
  for (const alt of alternatives) for (const word of oracle(s.slice(0, open) + alt + s.slice(close + 1))) out.add(word)
  return out
}

test('sample expands the nested choices with every prefix', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, ['xzp', 'xzq', 'xzw', 'yzp', 'yzq', 'yzw'])
})

test('repeated words collapse and plain commas form a union', () => {
  assert.deepEqual(run(examples[1].input).result, ['mno', 'mo'])
  assert.deepEqual(run(examples[2].input).result, ['ab', 'c', 'd'])
  assert.deepEqual(run('"{p,p}q"').result, ['pq'])
})

test('matches the substitution oracle on seeded expressions', () => {
  let seed = 1096
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = () => 'abcxyz'.slice(0, 1 + rnd(3)).slice(rnd(2)) || 'a'
  const expr = depth => {
    const terms = Array.from({ length: 1 + rnd(3) }, () => {
      const factors = Array.from({ length: 1 + rnd(2) }, () => (depth < 2 && rnd(3) === 0 ? `{${expr(depth + 1)}}` : letters()))
      return factors.join('')
    })
    return terms.join(',')
  }
  for (let t = 0; t < 300; t++) {
    const text = expr(0)
    if (text.length > 20) continue
    const expression = JSON.stringify(text)
    const trace = buildTrace(parseInput(expression))
    checkFrames(trace)
    assert.deepEqual(trace.result, [...oracle('{' + text + '}')].sort(), text)
  }
})

test('rejects unbalanced braces, empty alternatives and foreign characters', () => {
  assert.throws(() => parseInput('"{a,b"'))
  assert.throws(() => parseInput('"a,,b"'))
  assert.throws(() => parseInput('"{}"'))
  assert.throws(() => parseInput('"A"'))
})
