import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: unbounded coin-change DP over the Fibonacci values 1, 2, 3, 5, ...
function referenceTable(limit) {
  const coins = [1, 2]
  while (coins.at(-1) <= limit) coins.push(coins.at(-1) + coins.at(-2))
  const best = new Array(limit + 1).fill(Infinity)
  best[0] = 0
  for (let x = 1; x <= limit; x++) {
    for (const c of coins) if (c <= x && best[x - c] + 1 < best[x]) best[x] = best[x - c] + 1
  }
  return best
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

test('sample targets 7, 10 and 19 need 2, 2 and 3 numbers', () => {
  assert.equal(buildTrace(7).result, 2)
  assert.equal(buildTrace(10).result, 2)
  assert.equal(buildTrace(19).result, 3)
})

test('exact Fibonacci target and the smallest target', () => {
  assert.equal(buildTrace(13).result, 1)
  assert.equal(buildTrace(1).result, 1)
})

test('every target up to 400 matches the coin-change oracle', () => {
  const best = referenceTable(400)
  for (let k = 1; k <= 400; k++) assert.equal(buildTrace(k).result, best[k], `k=${k}`)
})

test('the picks in the trace really sum to the target', () => {
  const run = buildTrace(1000)
  const last = run.frames.at(-1).snapshot.picks
  assert.equal(last.reduce((a, b) => a + b, 0), 1000)
})

test('every frame is well formed', () => {
  checkFrames(buildTrace(19))
})

test('parser enforces the target range', () => {
  assert.equal(parseInput('19'), 19)
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('1000000001'))
})
