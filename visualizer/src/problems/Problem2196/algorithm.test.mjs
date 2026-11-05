import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const build = text => buildTrace(parseInput(text)).result

test('2196 worked examples', () => {
  assert.deepEqual(build('[[1,2,1],[1,3,0],[2,4,1]]'), { root: 1, levelOrder: [1, 2, 3, 4] })
  assert.deepEqual(build('[[5,6,0]]'), { root: 5, levelOrder: [5, 6] })
  assert.deepEqual(build('[[3,1,1],[1,2,0]]'), { root: 3, levelOrder: [3, 1, 2] })
})

test('2196 rejects invalid input', () => {
  assert.throws(() => parseInput('[[1,2,2]]'))
  assert.throws(() => parseInput('[[1,2,1],[3,2,0]]'))
  assert.throws(() => parseInput('[[1,2,1],[1,2,0]]'))
  assert.throws(() => parseInput('[[1,2,1],[1,3,1]]'))
  assert.throws(() => parseInput('[[1,2,1],[3,4,0]]'))
})

test('2196 random trees rebuild their level order', () => {
  let seed = 2196
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const count = 2 + rnd(7)
    const values = Array.from({ length: 15 }, (_, i) => i + 1).sort(() => rnd(3) - 1).slice(0, count)
    const kids = new Map(values.map(v => [v, [null, null]]))
    const rows = []
    for (const v of values.slice(1)) {
      // attach v to a random earlier node that still has a free side
      const hosts = values.slice(0, values.indexOf(v)).filter(h => kids.get(h).includes(null))
      const host = hosts[rnd(hosts.length)]
      const side = kids.get(host)[0] === null ? 0 : 1
      kids.get(host)[side] = v
      rows.push([host, v, side === 0 ? 1 : 0])
    }
    const expected = []
    let level = [values[0]]
    while (level.length) {
      expected.push(...level)
      level = level.flatMap(v => kids.get(v).filter(c => c !== null))
    }
    const got = build(JSON.stringify(rows))
    assert.equal(got.root, values[0])
    assert.deepEqual(got.levelOrder, expected, JSON.stringify(rows))
  }
})

test('2196 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('[[1,2,1],[1,3,0]]')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
