import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (s, chars, vals) => buildTrace(parseInput(JSON.stringify({ s, chars, vals }))).result

function runPython(call) {
  const r = spawnSync('python3', ['-I', '-c', `${python}\nprint(${call})`], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  return r.stdout.trim()
}

test('2606 worked examples', () => {
  assert.equal(solve('adaa', 'd', [-1000]), 2)
  assert.equal(solve('abc', 'abc', [-1, -1, -1]), 0)
  assert.equal(solve('bz', 'z', [-5]), 2)
})

test('2606 every frame points at an executable python line', () => {
  const lines = python.split('\n')
  for (const frame of buildTrace(parseInput('{"s": "adaa", "chars": "d", "vals": [-1000]}')).frames) {
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= lines.length)
    assert.ok(lines[frame.pythonLine - 1].trim().length > 0)
  }
})

test('2606 python export agrees with the trace', () => {
  assert.equal(runPython('maximumCostSubstring("adaa", "d", [-1000])'), '2')
  assert.equal(runPython('maximumCostSubstring("abc", "abc", [-1, -1, -1])'), '0')
  assert.equal(runPython('maximumCostSubstring("bz", "z", [-5])'), '2')
})

test('2606 random inputs match an all-substrings brute force', () => {
  let seed = 2606
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % k }
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(12) }, () => letters[rnd(6)]).join('')
    const pool = letters.slice(0, 6).split('')
    const chosen = pool.filter(() => rnd(2) === 0)
    if (chosen.length === 0) chosen.push(pool[0])
    const chars = chosen.join('')
    const vals = chosen.map(() => rnd(2001) - 1000)
    const custom = new Map(chosen.map((ch, i) => [ch, vals[i]]))
    let expected = 0
    for (let i = 0; i < s.length; i++) {
      let sum = 0
      for (let j = i; j < s.length; j++) {
        const ch = s[j]
        sum += custom.has(ch) ? custom.get(ch) : ch.charCodeAt(0) - 96
        expected = Math.max(expected, sum)
      }
    }
    assert.equal(solve(s, chars, vals), expected, JSON.stringify({ s, chars, vals }))
  }
})

test('2606 rejects duplicate characters in chars', () => {
  assert.throws(() => parseInput('{"s": "ab", "chars": "aa", "vals": [1, 2]}'))
})
