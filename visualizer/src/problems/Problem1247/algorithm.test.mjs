import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

const ids = phases.map(phase => phase.id)

// Independent oracle: breadth-first search over every state reachable by cross-string swaps.
function oracle(a, b) {
  const key = (s1, s2) => `${s1}|${s2}`
  const seen = new Set([key(a, b)])
  let frontier = [[a, b]]
  for (let depth = 0; frontier.length; depth++) {
    const next = []
    for (const [s1, s2] of frontier) {
      if (s1 === s2) return depth
      for (let i = 0; i < s1.length; i++) {
        for (let j = 0; j < s2.length; j++) {
          const t1 = s1.slice(0, i) + s2[j] + s1.slice(i + 1)
          const t2 = s2.slice(0, j) + s1[i] + s2.slice(j + 1)
          const k = key(t1, t2)
          if (!seen.has(k)) { seen.add(k); next.push([t1, t2]) }
        }
      }
    }
    frontier = next
  }
  return -1
}

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.message.length > 10)
  }
}

test('sample inputs give the expected answers', () => {
  const mixed = buildTrace(parseInput(examples[0].input))
  checkFrames(mixed)
  assert.equal(mixed.result, 2)
  assert.equal(buildTrace(parseInput(examples[1].input)).result, 2)
  const impossible = buildTrace(parseInput(examples[2].input))
  checkFrames(impossible)
  assert.equal(impossible.result, -1)
})

test('every pair of x/y strings of length up to 4 matches the BFS oracle', () => {
  const strings = []
  for (let n = 1; n <= 4; n++) {
    for (let code = 0; code < 2 ** n; code++) {
      let s = ''
      for (let i = 0; i < n; i++) s += (code >> i) & 1 ? 'y' : 'x'
      strings.push(s)
    }
  }
  for (const a of strings) {
    for (const b of strings) {
      if (a.length !== b.length) continue
      assert.equal(buildTrace([a, b]).result, oracle(a, b), `${a} ${b}`)
    }
  }
})

test('random longer strings agree with the closed form for their mismatch counts', () => {
  let state = 5
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rand(40)
    const a = Array.from({ length: n }, () => (rand(2) ? 'x' : 'y')).join('')
    const b = Array.from({ length: n }, () => (rand(2) ? 'x' : 'y')).join('')
    let xy = 0
    let yx = 0
    for (let i = 0; i < n; i++) {
      if (a[i] === 'x' && b[i] === 'y') xy++
      if (a[i] === 'y' && b[i] === 'x') yx++
    }
    const expected = (xy + yx) % 2 ? -1 : Math.floor(xy / 2) + Math.floor(yx / 2) + (xy % 2 ? 2 : 0)
    assert.equal(buildTrace([a, b]).result, expected, `${a} ${b}`)
  }
})

test('invalid input is rejected', () => {
  assert.throws(() => parseInput('["xy"]'))
  assert.throws(() => parseInput('["xy","xyz"]'))
  assert.throws(() => parseInput('["xa","yx"]'))
  assert.throws(() => parseInput('["",""]'))
  assert.throws(() => parseInput('nope'))
})
