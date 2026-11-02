import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python, code } from './algorithm.js'

const solve = k => buildTrace({ k }).answer

test('2802 worked examples', () => {
  assert.equal(solve(1), '4')
  assert.equal(solve(4), '47')
  assert.equal(solve(5), '74')
  assert.equal(solve(7), '444')
})

test('2802 edge cases', () => {
  assert.equal(solve(2), '7')
  assert.equal(solve(3), '44')
  assert.equal(solve(6), '77')
  assert.equal(solve(126), '777777')
  assert.throws(() => parseInput('0'))
  assert.throws(() => buildTrace({ k: 127 }))
})

// Independent oracle: list lucky numbers by length, then by digit order (4 before 7), which is numeric order.
function oracle(k) {
  const list = []
  for (let len = 1; list.length < k; len++) {
    for (let mask = 0; mask < 2 ** len && list.length < k; mask++) {
      let text = ''
      for (let p = len - 1; p >= 0; p--) text += (mask >> p) & 1 ? '7' : '4'
      list.push(text)
    }
  }
  return list[k - 1]
}

test('2802 every k up to the visual cap matches an enumeration oracle', () => {
  for (let k = 1; k <= 126; k++) assert.equal(solve(k), oracle(k), `k=${k}`)
})

test('2802 frame invariants', () => {
  const codeLines = new Set(code.map(c => c.line))
  const pyLines = python.split('\n').length
  for (const frame of buildTrace({ k: 5 }).frames) {
    assert.ok(codeLines.has(frame.activeLine), `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, `pythonLine ${frame.pythonLine}`)
    assert.equal(typeof frame.message, 'string')
  }
})

test('2802 python export runs on the first example', () => {
  const out = execFileSync('python3', ['-I', '-c', python], { input: '5' }).toString().trim()
  assert.equal(out, '74')
})
