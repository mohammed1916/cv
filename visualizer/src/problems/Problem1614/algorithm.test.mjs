import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent reference: depth at every prefix, taking the maximum.
function reference(expr) {
  let max = 0
  for (let end = 1; end <= expr.length; end++) {
    const prefix = expr.slice(0, end)
    const depth = [...prefix].reduce((d, c) => d + (c === '(' ? 1 : c === ')' ? -1 : 0), 0)
    max = Math.max(max, depth)
  }
  return max
}

function assertFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(f.message.length > 10)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length, `code line ${f.activeLine}`)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= python.split('\n').length, `python line ${f.pythonLine}`)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('sample product with nested groups has depth 2', () => {
  const run = buildTrace(parseInput('2*(3+(4-1)*(5))'))
  assert.equal(run.result, 2)
  assertFrames(run)
})

test('deep chain, flat expression and separate groups', () => {
  assert.equal(buildTrace('((((1))))+(2)').result, 4)
  assert.equal(buildTrace('12*3+4').result, 0)
  assert.equal(buildTrace('(1+2)*(3-4)').result, 1)
})

test('random balanced expressions agree with the reference', () => {
  let seed = 11
  const rand = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % m }
  for (let t = 0; t < 200; t++) {
    let expr = ''
    let open = 0
    for (let k = 0; k < 20; k++) {
      const pick = rand(4)
      if (pick === 0 && open < 5) { expr += '('; open++ } else if (pick === 1 && open > 0) { expr += ')'; open-- } else expr += String(rand(10))
      if (rand(3) === 0) expr += '+'
    }
    while (open > 0) { expr += ')'; open-- }
    const run = buildTrace(expr)
    assert.equal(run.result, reference(expr), expr)
    assertFrames(run)
  }
})

test('unbalanced or unsupported input is rejected', () => {
  assert.throws(() => parseInput('(1+2'), /closing/)
  assert.throws(() => parseInput(')1('), /before/)
  assert.throws(() => parseInput('(1 % 2)'), /Use digits/)
})
