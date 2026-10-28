import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

const nextLetter = c => String.fromCharCode((c.charCodeAt(0) - 97 + 1) % 26 + 97)

// Independent oracle: breadth-first search over screens for the fewest key presses to reach the target.
function shortestPresses(target) {
  const seen = new Map([['', 0]])
  let frontier = ['']
  while (frontier.length) {
    const next = []
    for (const s of frontier) {
      if (s === target) return seen.get(s)
      const moves = [s.length < target.length ? `${s}a` : null, s.length > 0 ? s.slice(0, -1) + nextLetter(s.at(-1)) : null]
      for (const m of moves) {
        if (m !== null && !seen.has(m)) {
          seen.set(m, seen.get(s) + 1)
          next.push(m)
        }
      }
    }
    frontier = next
  }
  return -1
}

test('3324 the screen sequence for abc', () => {
  assert.deepEqual(solve({ target: 'abc' }), ['a', 'aa', 'ab', 'aba', 'abb', 'abc'])
})

test('3324 a single letter shows every letter in turn', () => {
  assert.deepEqual(solve({ target: 'z' }).at(-1), 'z')
  assert.equal(solve({ target: 'z' }).length, 26)
})

test('3324 rejects an uppercase target', () => {
  assert.throws(() => parseInput('{"target":"AB"}'))
})

test('3324 random targets use the fewest presses and end on the target', () => {
  let seed = 3324
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(3)
    const target = Array.from({ length }, () => 'abcxyz'[rnd(6)]).join('')
    const screens = solve({ target })
    assert.equal(screens.length, shortestPresses(target), target)
    assert.equal(screens.at(-1), target)
    let prev = ''
    for (const cur of screens) {
      const appended = cur === `${prev}a`
      const advanced = prev.length > 0 && cur === prev.slice(0, -1) + nextLetter(prev.at(-1))
      assert.ok(appended || advanced, `${prev} -> ${cur}`)
      prev = cur
    }
  }
})
