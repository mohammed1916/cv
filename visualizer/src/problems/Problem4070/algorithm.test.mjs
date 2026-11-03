import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = s => buildTrace(s).result

function checkFrames(run) {
  const pyLines = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length, 'pseudocode line')
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pyLines, 'python line')
    assert.ok(frame.message.length > 0)
  }
}

// Independent oracle: a breadth-first search over dial positions for each step.
function bfsCost(from, to) {
  const dist = new Array(10).fill(Infinity)
  dist[from] = 0
  const queue = [from]
  while (queue.length) {
    const cur = queue.shift()
    for (const next of [(cur + 1) % 10, (cur + 9) % 10]) {
      if (dist[next] === Infinity) {
        dist[next] = dist[cur] + 1
        queue.push(next)
      }
    }
  }
  return dist[to]
}

function oracle(s) {
  let cur = 0
  let total = 0
  for (const ch of s) {
    const d = Number(ch)
    total += bfsCost(cur, d)
    cur = d
  }
  return total
}

test('4070 the given digit string costs the sum of short-way turns', () => {
  assert.equal(solve('0000000000'), 0)
  assert.equal(solve('0123456789'), 9)
  assert.equal(solve('9999999999'), 1)
})

test('4070 turning the short way round from nine to zero costs one', () => {
  assert.equal(solve('9000000000'), 2) // 0 to 9 is one step, then 9 back to 0 is one more
  assert.equal(solve('1000000000'), 2) // 0 to 1 and back to 0
  assert.equal(solve('5555555555'), 5)
})

test('4070 quoted and raw inputs are both accepted', () => {
  assert.equal(solve(parseInput('"4321098765"')), oracle('4321098765'))
  assert.equal(parseInput('"0123456789"'), '0123456789')
})

test('4070 every ten digit string of this form matches the breadth-first oracle', () => {
  let seed = 4070
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 10 }, () => String(rnd(10))).join('')
    assert.equal(solve(s), oracle(s), s)
    checkFrames(buildTrace(s))
  }
})

test('4070 rejects strings that are not exactly ten digits', () => {
  assert.throws(() => parseInput('123'))
  assert.throws(() => parseInput('12345678901'))
  assert.throws(() => parseInput('12a4567890'))
})
