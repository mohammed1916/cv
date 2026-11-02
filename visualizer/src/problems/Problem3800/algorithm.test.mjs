import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (s, t, flipCost, swapCost, crossCost) => buildTrace({ s, t, flipCost, swapCost, crossCost }).result

test('3800 official examples', () => {
  assert.equal(solve('01000', '10111', 10, 2, 2), 16)
  assert.equal(solve('001', '110', 2, 100, 100), 6)
  assert.equal(solve('1010', '1010', 5, 5, 5), 0)
})

test('3800 rejects bad input', () => {
  assert.throws(() => parseInput('{"s":"01","t":"1","flipCost":1,"swapCost":1,"crossCost":1}'))
  assert.throws(() => parseInput('{"s":"012","t":"110","flipCost":1,"swapCost":1,"crossCost":1}'))
  assert.throws(() => parseInput('{"s":"01","t":"10","flipCost":0,"swapCost":1,"crossCost":1}'))
})

test('3800 trace frames carry the python line they execute', () => {
  const lines = python.split('\n')
  const { frames } = buildTrace({ s: '01000', t: '10111', flipCost: 10, swapCost: 2, crossCost: 2 })
  for (const frame of frames) {
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= lines.length, JSON.stringify(frame))
    assert.ok(typeof frame.phase === 'string' && typeof frame.message === 'string' && typeof frame.activeLine === 'number')
  }
  assert.ok(frames.some(f => lines[f.pythonLine - 1].includes('return best')))
})

test('3800 scan frames reveal classification only up to the current index', () => {
  const { frames } = buildTrace({ s: '0110', t: '1001', flipCost: 3, swapCost: 4, crossCost: 1 })
  const scans = frames.filter(f => f.phase === 'scan')
  assert.equal(scans.length, 4)
  scans.forEach((f, i) => {
    f.kinds.forEach((k, j) => {
      if (j > i) assert.equal(k, null, `index ${j} leaked at scan ${i}`)
      else assert.notEqual(k, null, `index ${j} missing at scan ${i}`)
    })
  })
  assert.ok(frames.filter(f => f.phase === 'start').every(f => f.kinds.every(k => k === null)))
})

test('3800 persists the winning breakdown to the result and matches the optimum', () => {
  const cases = [
    ['01000', '10111', 10, 2, 2, 16],
    ['001', '110', 2, 100, 100, 6],
    ['1010', '1010', 5, 5, 5, 0],
  ]
  for (const [s, t, flipCost, swapCost, crossCost, expected] of cases) {
    const { frames, result } = buildTrace({ s, t, flipCost, swapCost, crossCost })
    const done = frames.at(-1)
    assert.equal(done.phase, 'done')
    assert.equal(result, expected)
    assert.ok(done.winner, 'done frame keeps the winner')
    assert.equal(done.winner.total, result)
    assert.equal(done.winner.mixedPart + done.winner.aPart + done.winner.bPart, result)
    // The winner stays visible from the point it is recorded to the end.
    const firstBest = frames.findIndex(f => f.phase === 'best')
    if (firstBest >= 0) assert.ok(frames.slice(firstBest).every(f => f.winner && f.winner.total === f.best))
    // Each tested count is listed and the winner is the cheapest of them.
    assert.equal(done.tested.length, Math.min(done.typeA, done.typeB) + 1)
    assert.equal(Math.min(...done.tested.map(b => b.total)), result)
    assert.equal(done.tested.find(b => b.mixed === done.winner.mixed).total, result)
  }
})

test('3800 winning breakdown reproduces the official example 1 split', () => {
  const { frames } = buildTrace({ s: '01000', t: '10111', flipCost: 10, swapCost: 2, crossCost: 2 })
  const done = frames.at(-1)
  assert.equal(done.winner.mixed, 1)
  assert.equal(done.winner.total, 16)
})

test('3800 every frame line refers to a real pseudocode and python line', () => {
  const pyLines = python.split('\n')
  for (const input of [
    { s: '01000', t: '10111', flipCost: 10, swapCost: 2, crossCost: 2 },
    { s: '1111', t: '0000', flipCost: 1, swapCost: 3, crossCost: 2 },
  ]) {
    const { frames } = buildTrace(input)
    for (const f of frames) {
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length, JSON.stringify(f))
      assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines.length, JSON.stringify(f))
    }
  }
})

// Independent oracle: Dijkstra over every (s, t) pair of strings, using every allowed operation.
function oracle(s, t, flipCost, swapCost, crossCost) {
  const n = s.length
  const key = (a, b) => `${a}|${b}`
  const dist = new Map([[key(s, t), 0]])
  const done = new Set()
  const bits = str => str.split('')
  const neighbours = (a, b) => {
    const out = []
    const x = bits(a), y = bits(b)
    for (let i = 0; i < n; i++) {
      const fx = [...x]; fx[i] = fx[i] === '0' ? '1' : '0'
      out.push([fx.join(''), b, flipCost])
      const fy = [...y]; fy[i] = fy[i] === '0' ? '1' : '0'
      out.push([a, fy.join(''), flipCost])
      const cx = [...x]; const cy = [...y]
      ;[cx[i], cy[i]] = [cy[i], cx[i]]
      out.push([cx.join(''), cy.join(''), crossCost])
      for (let j = 0; j < n; j++) {
        if (i === j) continue
        const sx = [...x]; ;[sx[i], sx[j]] = [sx[j], sx[i]]
        out.push([sx.join(''), b, swapCost])
        const sy = [...y]; ;[sy[i], sy[j]] = [sy[j], sy[i]]
        out.push([a, sy.join(''), swapCost])
      }
    }
    return out
  }
  for (;;) {
    let bestKey = null
    for (const [k, d] of dist) if (!done.has(k) && (bestKey === null || d < dist.get(bestKey))) bestKey = k
    if (bestKey === null) return null
    const [a, b] = bestKey.split('|')
    const d = dist.get(bestKey)
    if (a === b) return d
    done.add(bestKey)
    for (const [na, nb, w] of neighbours(a, b)) {
      const k = key(na, nb)
      if (!dist.has(k) || dist.get(k) > d + w) dist.set(k, d + w)
    }
  }
}

test('3800 random small inputs match a shortest-path oracle', () => {
  let seed = 3800
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const bitString = len => Array.from({ length: len }, () => String(rnd(2))).join('')
  for (let trial = 0; trial < 150; trial++) {
    const n = 1 + rnd(4)
    const s = bitString(n), t = bitString(n)
    const flipCost = 1 + rnd(10), swapCost = 1 + rnd(10), crossCost = 1 + rnd(10)
    assert.equal(solve(s, t, flipCost, swapCost, crossCost), oracle(s, t, flipCost, swapCost, crossCost), JSON.stringify({ s, t, flipCost, swapCost, crossCost }))
  }
})
