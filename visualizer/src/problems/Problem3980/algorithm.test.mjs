import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm.js'

const solve = (s1, s2) => buildTrace({ s1, s2 }).result

// Oracle: breadth-first search over every reachable string, applying the two operations literally.
function bfsAll(n, source) {
  const size = 1 << n
  const dist = new Int32Array(size).fill(-1)
  dist[source] = 0
  const queue = [source]
  for (let head = 0; head < queue.length; head++) {
    const cur = queue[head]
    const push = next => { if (dist[next] < 0) { dist[next] = dist[cur] + 1; queue.push(next) } }
    for (let i = 0; i < n; i++) {
      if (!(cur >> i & 1)) push(cur | 1 << i)
      if (i + 1 < n && (cur >> i & 1) && (cur >> (i + 1) & 1)) push(cur & ~(1 << i) & ~(1 << (i + 1)))
    }
  }
  return dist
}
// Bit i of the mask is character i of the string.
const str = (mask, n) => Array.from({ length: n }, (_, i) => (mask >> i & 1 ? '1' : '0')).join('')

test('3980 hand-computed cases', () => {
  assert.equal(solve('100', '000'), 2)      // set index 1, clear 0-1
  assert.equal(solve('0110', '0110'), 0)
  assert.equal(solve('0', '1'), 1)
  assert.equal(solve('1', '1'), 0)
  assert.equal(solve('0', '0'), 0)
  assert.equal(solve('101', '000'), 4)      // set 1, clear 0-1, set 1, clear 1-2
  assert.equal(solve('1111', '0000'), 2)
  assert.equal(solve('111', '000'), 3)      // clear 0-1, set 1, clear 1-2
})

test('3980 a lone 1 that must fall is the only impossible case', () => {
  assert.equal(solve('1', '0'), -1)
  const trace = buildTrace({ s1: '1', s2: '0' })
  assert.deepEqual(trace.plan, [])
  assert.ok(trace.frames.some(f => f.phase === 'blocked'))
})

test('3980 agrees with BFS for every pair of strings up to length 7', () => {
  for (let n = 1; n <= 7; n++) {
    for (let a = 0; a < 1 << n; a++) {
      const dist = bfsAll(n, a)
      for (let b = 0; b < 1 << n; b++) {
        assert.equal(solve(str(a, n), str(b, n)), dist[b], `${str(a, n)} -> ${str(b, n)}`)
      }
    }
  }
})

test('3980 the replayed plan is legal, reaches s2 and has exactly the answer length', () => {
  let seed = 3980
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rnd(16)
    const s1 = Array.from({ length: n }, () => String(rnd(2))).join('')
    const s2 = Array.from({ length: n }, () => String(rnd(2))).join('')
    const { result, plan } = buildTrace({ s1, s2 })
    if (result === -1) { assert.deepEqual(plan, []); assert.equal(n, 1); continue }
    assert.equal(plan.length, result)
    const cur = s1.split('')
    for (const op of plan) {
      if (op.kind === 'set') { assert.equal(cur[op.at], '0'); cur[op.at] = '1' } else {
        assert.equal(cur[op.at], '1')
        assert.equal(cur[op.at + 1], '1')
        cur[op.at] = '0'
        cur[op.at + 1] = '0'
      }
      assert.equal(cur.join(''), op.text)
    }
    assert.equal(cur.join(''), s2)
  }
})

test('3980 parseInput rejects bad strings', () => {
  assert.throws(() => parseInput('{"s1":"01","s2":"1"}'))
  assert.throws(() => parseInput('{"s1":"","s2":""}'))
  assert.throws(() => parseInput('{"s1":"02","s2":"01"}'))
  assert.throws(() => parseInput('{"s1":"01"}'))
  assert.throws(() => parseInput(JSON.stringify({ s1: '0'.repeat(17), s2: '0'.repeat(17) })))
})

test('3980 examples run, edges have one winner, and frames map to real lines', () => {
  const ids = new Set(phases.map(p => p.id))
  const lines = python.trim().split('\n')
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const input = parseInput(example.input)
    const { frames, result } = buildTrace(input)
    assert.equal(frames[0].phase, 'start')
    assert.equal(frames.at(-1).phase, 'done')
    assert.ok(result >= 0)
    assert.equal(frames.filter(f => f.phase === 'replay').length, result)
    assert.equal(frames.at(-1).current, input.s2)
    for (const edge of frames.at(-1).edges) assert.ok(['kept', 'worse', 'blocked'].includes(edge.status))
    for (let i = 0; i < input.s1.length; i++) {
      for (const right of [0, 1]) {
        assert.ok(frames.at(-1).edges.filter(e => e.i === i && e.right === right && e.status === 'kept').length <= 1)
      }
    }
    for (const f of frames) {
      assert.ok(ids.has(f.phase))
      assert.ok(f.message.length > 0)
      assert.ok(code.some(c => c.line === f.activeLine))
      assert.ok(lines[f.pythonLine - 1]?.trim(), `python line ${f.pythonLine}`)
    }
  }
})
