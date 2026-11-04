import test from 'node:test'
import assert from 'node:assert/strict'
import { alignPiece, buildTrace, code, parseInput, phases, python } from './algorithm.js'

const solve = (word1, word2) => buildTrace({ word1, word2 }).result

// True search over operations on a single piece: state is the letters plus which
// indices have already been used for each operation kind. Shares nothing with the solver.
const pieceMemo = new Map()
function searchPiece(have, want) {
  const memoKey = `${have}|${want}`
  if (pieceMemo.has(memoKey)) return pieceMemo.get(memoKey)
  const n = have.length
  const letters = [...new Set([...have, ...want])]
  const full = (1 << n) - 1
  const stateKey = (s, r, w, f) => `${s}|${r}|${w}|${f}`
  let layer = [[have, 0, 0, 0]]
  const seen = new Set([stateKey(have, 0, 0, 0)])
  let depth = 0
  let answer = -1
  while (layer.length) {
    if (layer.some(([s]) => s === want)) { answer = depth; break }
    const next = []
    const add = (s, r, w, f) => {
      const k = stateKey(s, r, w, f)
      if (!seen.has(k)) { seen.add(k); next.push([s, r, w, f]) }
    }
    for (const [s, r, w, f] of layer) {
      for (let i = 0; i < n; i++) {
        if (!(r & (1 << i))) for (const c of letters) if (c !== s[i]) add(s.slice(0, i) + c + s.slice(i + 1), r | (1 << i), w, f)
        if (!(w & (1 << i))) for (let j = i + 1; j < n; j++) {
          if (w & (1 << j)) continue
          const a = [...s];
          [a[i], a[j]] = [a[j], a[i]]
          add(a.join(''), r, w | (1 << i) | (1 << j), f)
        }
      }
      if (!f) add([...s].reverse().join(''), r, w, full)
    }
    layer = next
    depth++
  }
  pieceMemo.set(memoKey, answer)
  return answer
}

function bruteForce(word1, word2) {
  const n = word1.length
  let best = Infinity
  for (let cuts = 0; cuts < 2 ** (n - 1); cuts++) {
    let total = 0, from = 0
    for (let i = 1; i <= n; i++) {
      if (i === n || (cuts & (1 << (i - 1)))) {
        total += searchPiece(word1.slice(from, i), word2.slice(from, i))
        from = i
      }
    }
    best = Math.min(best, total)
  }
  return best
}

test('3579 hand-computed cases', () => {
  assert.equal(solve('same', 'same'), 0)
  assert.equal(solve('q', 'z'), 1)
  assert.equal(solve('ab', 'zz'), 2)
  assert.equal(solve('drawer', 'reward'), 1)
  assert.equal(solve('trace', 'crate'), 1)
  assert.equal(solve('lemon', 'melon'), 1)
  assert.equal(solve('drawerkit', 'rewardkid'), 2)
  assert.equal(solve('lemonxy', 'melonyx'), 2)
})

test('3579 alignPiece labels swaps and replaces', () => {
  const a = alignPiece('trace', 'crate')
  assert.equal(a.cost, 1)
  assert.deepEqual(a.swaps, [[0, 3]])
  assert.deepEqual(a.replaces, [])
  const b = alignPiece('ab', 'zz')
  assert.equal(b.cost, 2)
  assert.deepEqual(b.replaces, [0, 1])
})

test('3579 matches an exhaustive operation search on short words', () => {
  let seed = 23
  const rand = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  const word = n => Array.from({ length: n }, () => 'abc'[rand(3)]).join('')
  for (let t = 0; t < 120; t++) {
    const n = 1 + rand(4)
    const a = word(n), b = word(n)
    assert.equal(solve(a, b), bruteForce(a, b), `${a} ${b}`)
  }
})

test('3579 the chosen plan really converts word1 at the reported cost', () => {
  let seed = 41
  const rand = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  const word = n => Array.from({ length: n }, () => 'abcd'[rand(4)]).join('')
  for (let t = 0; t < 150; t++) {
    const n = 1 + rand(9)
    const a = word(n), b = word(n)
    const run = buildTrace({ word1: a, word2: b })
    let out = '', ops = 0, covered = 0
    for (const p of run.plan) {
      assert.equal(p.start, covered)
      covered = p.end
      const s = [...a.slice(p.start, p.end)]
      if (p.reversed) { s.reverse(); ops++ }
      const used = new Set()
      for (const [i, j] of p.swaps) {
        assert.ok(!used.has(i) && !used.has(j))
        used.add(i); used.add(j);
        [s[i], s[j]] = [s[j], s[i]]
        ops++
      }
      for (const i of p.replaces) { s[i] = p.want[i]; ops++ }
      out += s.join('')
    }
    assert.equal(covered, n)
    assert.equal(out, b)
    assert.equal(ops, run.result)
  }
})

test('3579 parseInput validates', () => {
  assert.deepEqual(parseInput('{"word1":"ab","word2":"cd"}'), { word1: 'ab', word2: 'cd' })
  assert.throws(() => parseInput('{"word1":"ab","word2":"c"}'))
  assert.throws(() => parseInput('{"word1":"AB","word2":"cd"}'))
  assert.throws(() => parseInput('{"word1":"","word2":""}'))
  assert.throws(() => parseInput('{"word1":"abcdefghijklm","word2":"abcdefghijklm"}'))
})

test('3579 frames are consistent', () => {
  const run = buildTrace({ word1: 'drawerkit', word2: 'rewardkid' })
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.trim().split('\n')
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && pyLines[f.pythonLine - 1]?.trim())
    assert.ok(f.message.length > 0)
    assert.equal(f.dp.length, 10)
  }
  const last = run.frames.at(-1)
  assert.equal(last.phase, 'done')
  assert.equal(last.dp[9], run.result)
  assert.equal(run.frames.filter(f => f.phase === 'relax').length, 45)
})
