import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python } from './algorithm.js'

const pyLines = python.split('\n')
const ids = new Set(phases.map(phase => phase.id))

// Independent oracle: each pair of coordinate bits picks a base-4 digit, most significant first.
function byDigits(n) {
  const side = 2 ** n
  return Array.from({ length: side }, (_, r) => Array.from({ length: side }, (_, c) => {
    let value = 0
    for (let bit = n - 1; bit >= 0; bit--) {
      const down = (r >> bit) & 1
      const right = (c >> bit) & 1
      const digit = right ? down : 3 - down
      value = value * 4 + digit
    }
    return value
  }))
}

// Checks the rules from the problem directly, without using any fill order.
function isSpecial(grid, top = 0, left = 0, size = grid.length) {
  if (size === 1) return true
  const half = size / 2
  const part = (r, c) => {
    const values = []
    for (let i = 0; i < half; i++) for (let j = 0; j < half; j++) values.push(grid[r + i][c + j])
    return values
  }
  const order = [part(top, left + half), part(top + half, left + half), part(top + half, left), part(top, left)]
  for (let i = 0; i < 3; i++) if (Math.max(...order[i]) >= Math.min(...order[i + 1])) return false
  return isSpecial(grid, top, left, half) && isSpecial(grid, top, left + half, half)
    && isSpecial(grid, top + half, left, half) && isSpecial(grid, top + half, left + half, half)
}

function checkFrames(trace) {
  for (const frame of trace.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(pyLines[frame.pythonLine - 1]?.trim())
    assert.ok(frame.message.length > 0)
  }
  assert.equal(trace.frames.at(-1).phase, 'done')
  assert.deepEqual(trace.frames.at(-1).grid, trace.result)
}

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('3537 hand-computed rows of the 8 by 8 grid', () => {
  const grid = solve(3)
  assert.deepEqual(grid[0], [63, 60, 51, 48, 15, 12, 3, 0])
  assert.deepEqual(grid[7], [42, 41, 38, 37, 26, 25, 22, 21])
})

test('3537 base case', () => {
  const trace = buildTrace({ n: 0 })
  assert.deepEqual(trace.result, [[0]])
  assert.equal(trace.frames.filter(frame => frame.phase === 'place').length, 1)
  assert.equal(trace.frames.filter(frame => frame.phase === 'check').length, 0)
  checkFrames(trace)
})

test('3537 every n meets the rules and matches the digit oracle', () => {
  for (let n = 0; n <= 4; n++) {
    const trace = buildTrace(parseInput(JSON.stringify({ n })))
    assert.deepEqual(trace.result, byDigits(n))
    assert.ok(isSpecial(trace.result))
    const flat = trace.result.flat().sort((a, b) => a - b)
    assert.deepEqual(flat, Array.from({ length: flat.length }, (_, i) => i))
    checkFrames(trace)
  }
})

test('3537 the digit oracle itself satisfies the rules on larger grids', () => {
  for (let n = 0; n <= 6; n++) assert.ok(isSpecial(byDigits(n)))
})

test('3537 frames write one cell at a time and never overwrite', () => {
  const { frames } = buildTrace({ n: 2 })
  let filled = 0
  for (const frame of frames) {
    const now = frame.grid.flat().filter(value => value !== null).length
    assert.ok(now === filled || now === filled + 1)
    if (frame.phase === 'place') assert.equal(now, filled + 1)
    filled = now
  }
  assert.equal(filled, 16)
})

test('3537 the top-right quadrant finishes before the others start', () => {
  const { frames } = buildTrace({ n: 2 })
  const places = frames.filter(frame => frame.phase === 'place').map(frame => frame.placed)
  assert.ok(places.slice(0, 4).every(cell => cell.row < 2 && cell.col >= 2))
  assert.ok(places.slice(12).every(cell => cell.row < 2 && cell.col < 2))
})

test('3537 examples and validation', () => {
  for (const example of examples) checkFrames(buildTrace(parseInput(example.input)))
  assert.throws(() => parseInput('{"n":-1}'))
  assert.throws(() => parseInput('{"n":1.5}'))
  assert.throws(() => parseInput('{"n":11}'))
  assert.throws(() => parseInput('{"n":5}'), /visualization/)
})
