import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = operations => buildTrace(parseInput(JSON.stringify({ operations }))).result

test('2296 official example', () => {
  const ops = [['addText', 'leetcode'], ['deleteText', 4], ['addText', 'practice'], ['cursorRight', 3], ['cursorLeft', 8], ['deleteText', 10], ['cursorLeft', 2], ['cursorRight', 6]]
  assert.deepEqual(solve(ops), [4, 'etpractice', 'leet', 4, '', 'practi'])
})

test('2296 the cursor cannot move past the ends', () => {
  assert.deepEqual(solve([['cursorLeft', 5], ['addText', 'ab'], ['cursorRight', 9], ['deleteText', 9]]), ['', 'ab', 2])
})

test('2296 rejects an addText with capital letters', () => {
  assert.throws(() => parseInput('{"operations":[["addText","Ab"]]}'))
})

// Independent oracle: an array of characters with an integer cursor, using splice for every edit.
function oracle(operations) {
  let text = []
  let cursor = 0
  const out = []
  const last10 = () => text.slice(Math.max(0, cursor - 10), cursor).join('')
  for (const [name, arg] of operations) {
    if (name === 'addText') { text.splice(cursor, 0, ...arg.split('')); cursor += arg.length }
    else if (name === 'deleteText') { const d = Math.min(arg, cursor); text.splice(cursor - d, d); cursor -= d; out.push(d) }
    else if (name === 'cursorLeft') { cursor -= Math.min(arg, cursor); out.push(last10()) }
    else { cursor += Math.min(arg, text.length - cursor); out.push(last10()) }
  }
  return out
}

test('2296 random operation lists match a splice-based oracle', () => {
  let seed = 2296
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const operations = Array.from({ length: 1 + rnd(14) }, () => {
      const kind = rnd(4)
      if (kind === 0) return ['addText', Array.from({ length: 1 + rnd(4) }, () => 'abc'[rnd(3)]).join('')]
      const names = ['deleteText', 'cursorLeft', 'cursorRight']
      return [names[kind - 1], 1 + rnd(10)]
    })
    assert.deepEqual(solve(operations), oracle(operations), JSON.stringify(operations))
  }
})
