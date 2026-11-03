import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: one regular-expression pass. A match is consumed and never rescanned,
// so the decoded ampersand in "&amp;lt;" cannot decode again.
const MAP = { '&quot;': '"', '&apos;': "'", '&amp;': '&', '&gt;': '>', '&lt;': '<', '&frasl;': '/' }
function reference(text) {
  return text.replace(/&(quot|apos|amp|gt|lt|frasl);/g, m => MAP[m])
}

function checkFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(f.message.length > 0)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length, `activeLine ${f.activeLine}`)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine ${f.pythonLine}`)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('an escaped ampersand is decoded once, not twice', () => {
  assert.equal(buildTrace('&amp;lt;').result, '&lt;')
})

test('mixed sample text decodes supported entities and keeps unknown ones', () => {
  assert.equal(buildTrace('Tom &amp; Jerry &lt;3 &unknown;').result, 'Tom & Jerry <3 &unknown;')
})

test('a bare ampersand before an apostrophe entity', () => {
  assert.equal(buildTrace('&&apos;').result, "&'")
})

test('trailing ampersand and partial names stay literal', () => {
  assert.equal(buildTrace('end&').result, 'end&')
  assert.equal(buildTrace('&ampx; &gt').result, '&ampx; &gt')
})

test('random strings agree with the single-pass regular-expression oracle', () => {
  const pieces = ['&', 'a', 'm', 'p', ';', 'l', 't', 'g', 'q', 'u', 'o', 'x', 'f', 'r', 's', '&amp;', '&lt;', '&gt;', '&quot;', '&apos;', '&frasl;']
  let state = 5
  const rand = n => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % n }
  for (let t = 0; t < 400; t++) {
    let text = ''
    const len = 1 + rand(14)
    for (let k = 0; k < len; k++) text += pieces[rand(pieces.length)]
    assert.equal(buildTrace(text).result, reference(text), JSON.stringify(text))
  }
})

test('every frame is well formed', () => {
  checkFrames(buildTrace('a &amp; b'))
})

test('parser enforces the length limit', () => {
  assert.throws(() => parseInput(''), /between 1 and 100/)
  assert.throws(() => parseInput('x'.repeat(101)), /between 1 and 100/)
  assert.equal(parseInput('a &gt; b'), 'a &gt; b')
})
