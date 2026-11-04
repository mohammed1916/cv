import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python, code, phases } from './algorithm.js'

const solve = (teams, passes) => buildTrace({ teams, passes }).result.map(r => [r.team_name, r.longest_streak])
const RC = { Rovers: [11, 12, 13], Comets: [21, 22] }

test('3390 hand-computed cases', () => {
  assert.deepEqual(solve(RC, [[11, '02:10', 12], [12, '03:40', 13], [21, '05:00', 22], [13, '06:20', 21], [22, '07:05', 21], [21, '08:15', 22], [11, '09:30', 13]]), [['Comets', 3], ['Rovers', 2]])
  assert.deepEqual(solve({ Aces: [1, 2], Bears: [3, 4] }, [[1, '10:00', 3], [2, '11:00', 4], [3, '12:00', 4]]), [['Bears', 1]])
  assert.deepEqual(solve({ Lynx: [5, 6, 7], Owls: [8] }, [[6, '30:00', 7], [5, '10:00', 6], [7, '20:00', 8], [7, '40:00', 5]]), [['Lynx', 2]])
  assert.deepEqual(solve({ Solo: [1] }, []), [])
})

test('3390 a rival pass in between does not end a run', () => {
  assert.deepEqual(solve({ A: [1, 2], B: [3, 4] }, [[1, '01:00', 2], [3, '02:00', 4], [2, '03:00', 1]]), [['A', 2], ['B', 1]])
})

// Oracle: the relational route. Split each team's own passes at its lost passes and measure the pieces.
function oracle(teams, passes) {
  const teamOf = {}
  for (const [name, players] of Object.entries(teams)) for (const p of players) teamOf[p] = name
  const out = []
  for (const name of Object.keys(teams).sort()) {
    const own = passes.filter(p => teamOf[p[0]] === name).sort((a, b) => (a[1] < b[1] ? -1 : 1))
    const flags = own.map(p => (teamOf[p[2]] === name ? 'k' : 'x')).join('')
    const longest = Math.max(0, ...flags.split('x').map(s => s.length))
    if (longest > 0) out.push([name, longest])
  }
  return out
}

test('3390 random matches a split-by-team oracle', () => {
  let seed = 3390
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const teams = { Zed: [1, 2, 3], Amber: [4, 5], Mid: [6] }
  for (let t = 0; t < 300; t++) {
    const count = rnd(15)
    const times = new Set()
    while (times.size < count) times.add(`${String(rnd(90)).padStart(2, '0')}:${String(rnd(60)).padStart(2, '0')}`)
    const passes = [...times].map(time => [1 + rnd(6), time, 1 + rnd(6)])
    assert.deepEqual(solve(teams, passes), oracle(teams, passes), JSON.stringify(passes))
  }
})

test('3390 parser validates players and times', () => {
  assert.doesNotThrow(() => parseInput('{"teams":{"A":[1]},"passes":[[1,"90:00",1]]}'))
  assert.throws(() => parseInput('{"teams":{"A":[1]},"passes":[[1,"90:01",1]]}'))
  assert.throws(() => parseInput('{"teams":{"A":[1]},"passes":[[2,"10:00",1]]}'))
  assert.throws(() => parseInput('{"teams":{"A":[1],"B":[1]},"passes":[]}'))
  assert.throws(() => parseInput('{"teams":{"A":[1,2]},"passes":[[1,"10:00",2],[2,"10:00",1]]}'))
  assert.throws(() => parseInput('{"teams":{"A":[1]},"passes":[[1,"1:00",1]]}'))
})

test('3390 frames are valid and counters follow the passes', () => {
  const pyLines = python.trim().split('\n')
  const ids = new Set(phases.map(p => p.id))
  const passes = [[11, '02:10', 12], [12, '03:40', 21], [11, '04:00', 13]]
  for (const [teams, list] of [[RC, passes], [{ Solo: [1] }, []]]) {
    const { frames } = buildTrace({ teams, passes: list })
    for (const f of frames) {
      assert.ok(ids.has(f.phase))
      assert.ok(f.message.length > 0)
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(pyLines[f.pythonLine - 1]?.trim(), `python line ${f.pythonLine}`)
    }
    assert.equal(frames.at(-1).phase, 'done')
  }
  const walk = buildTrace({ teams: RC, passes }).frames.filter(f => f.phase === 'extend' || f.phase === 'break')
  assert.deepEqual(walk.map(f => f.streak.Rovers), [1, 0, 1])
  assert.deepEqual(walk.map(f => f.phase), ['extend', 'break', 'extend'])
  assert.equal(walk.at(-1).best.Rovers, 1)
})
