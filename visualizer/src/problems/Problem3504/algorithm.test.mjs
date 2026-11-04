import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, examples, phases, code, python } from './algorithm.js'

const solve = (s, t) => buildTrace({ s, t }).result
const isPalindrome = text => text === [...text].reverse().join('')

test('3504 hand-computed pairs', () => {
  assert.equal(solve('tenoon', 'xnet'), 8) // tenoo + net
  assert.equal(solve('racxy', 'zcar'), 7) // rac + zcar
  assert.equal(solve('kl', 'mn'), 1)
  assert.equal(solve('q', 'level'), 5)
  assert.equal(solve('stats', 'q'), 5)
  assert.equal(solve('ab', 'ba'), 4)
  assert.equal(solve('ab', 'ab'), 3) // ab + a = aba
})

function oracle(s, t) {
  const pieces = text => {
    const all = ['']
    for (let i = 0; i < text.length; i++) for (let j = i + 1; j <= text.length; j++) all.push(text.slice(i, j))
    return all
  }
  let best = 0
  for (const a of pieces(s)) for (const b of pieces(t)) {
    const whole = a + b
    if (whole.length > best && isPalindrome(whole)) best = whole.length
  }
  return best
}

function randomPairs(count) {
  let seed = 3504
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % k }
  const word = (length, alphabet) => Array.from({ length }, () => 'abcd'[rnd(alphabet)]).join('')
  return Array.from({ length: count }, () => {
    const alphabet = 1 + rnd(4)
    return [word(1 + rnd(9), alphabet), word(1 + rnd(9), alphabet)]
  })
}

test('3504 random pairs match trying every pair of substrings', () => {
  for (const [s, t] of randomPairs(500)) assert.equal(solve(s, t), oracle(s, t), JSON.stringify({ s, t }))
})

test('3504 the reported palindrome is real and made of real pieces', () => {
  for (const [s, t] of [...randomPairs(300), ...examples.map(e => { const { s, t } = JSON.parse(e.input); return [s, t] })]) {
    const { frames, result } = buildTrace({ s, t })
    const { best } = frames.at(-1)
    assert.equal(best.a.length + best.b.length, result)
    assert.ok(s.includes(best.a), JSON.stringify({ s, t, best }))
    assert.ok(t.includes(best.b), JSON.stringify({ s, t, best }))
    assert.ok(isPalindrome(best.a + best.b), JSON.stringify({ s, t, best }))
    for (const frame of frames) {
      if (!frame.candidate) continue
      const { a, b, value } = frame.candidate
      assert.equal(a.length + b.length, value)
      assert.ok(s.includes(a) && t.includes(b) && isPalindrome(a + b), JSON.stringify({ s, t, a, b }))
    }
  }
})

test('3504 g arrays hold the longest palindrome starting at each index', () => {
  const frames = buildTrace({ s: 'abaxx', t: 'yy' }).frames
  assert.deepEqual(frames.at(-1).g1, [3, 1, 1, 2, 1, 0])
  assert.deepEqual(frames.at(-1).g2, [2, 1, 0])
})

test('3504 parseInput enforces the shape', () => {
  assert.throws(() => parseInput('{"s":"","t":"a"}'))
  assert.throws(() => parseInput('{"s":"A","t":"a"}'))
  assert.throws(() => parseInput('{"s":"a"}'))
  assert.throws(() => parseInput(`{"s":"${'a'.repeat(13)}","t":"a"}`))
  assert.deepEqual(parseInput('{"s":"a","t":"b"}'), { s: 'a', t: 'b' })
})

test('3504 frames are well formed and the table follows the recurrence', () => {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.trim().split('\n')
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const input = parseInput(example.input)
    const { frames } = buildTrace(input)
    for (const f of frames) {
      assert.ok(ids.has(f.phase), f.phase)
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines.length)
      assert.notEqual(pyLines[f.pythonLine - 1].trim(), '')
      assert.ok(f.message.length > 0)
      if (f.phase === 'match') {
        const [i, j] = f.cell
        assert.equal(f.f[i][j], f.f[i - 1][j - 1] + 1)
      }
    }
    assert.equal(frames.at(-1).phase, 'done')
    assert.ok(frames.at(-1).f.flat().every(value => value !== null))
  }
})
