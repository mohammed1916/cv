import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, sql } from './algorithm.js'

const pyLines = python.split('\n')
const ids = new Set(phases.map(phase => phase.id))
const run = text => buildTrace(parseInput(text))
const make = rows => ({ TeamStats: rows.map(([team_name, wins, draws], index) => ({ team_id: index + 1, team_name, matches_played: wins + draws, wins, draws, losses: 0 })) })
const solve = rows => buildTrace(parseInput(JSON.stringify(make(rows)))).result

function checkFrames(trace) {
  for (const frame of trace.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(pyLines[frame.pythonLine - 1]?.trim())
    assert.ok(frame.message.length > 0)
    assert.equal(frame.table.length, trace.input.TeamStats.length)
  }
  assert.equal(trace.frames.at(-1).phase, 'done')
}

test('3252 ties across the first cutoff stay in Tier 1', () => {
  const trace = run(examples[0].input)
  assert.deepEqual(trace.result.map(row => [row.team_name, row.points, row.position, row.tier]), [
    ['Harbor Rovers', 29, 1, 'Tier 1'],
    ['Mill Lane', 27, 2, 'Tier 1'],
    ['Ashford Town', 25, 3, 'Tier 1'],
    ['Beacon City', 25, 3, 'Tier 1'],
    ['Copper Vale', 19, 5, 'Tier 2'],
    ['Delta Athletic', 15, 6, 'Tier 3'],
    ['Elm Park', 11, 7, 'Tier 3'],
  ])
  checkFrames(trace)
  const tierFrame = trace.frames.filter(frame => frame.phase === 'tier').at(-1)
  assert.equal(tierFrame.ladder.filter(row => row.pulledUp).length, 1)
})

test('3252 everyone level means position 1 and Tier 1, listed by name', () => {
  const trace = run(examples[1].input)
  assert.deepEqual(trace.result, [
    { team_name: 'Oakford', points: 4, position: 1, tier: 'Tier 1' },
    { team_name: 'Pine Bank', points: 4, position: 1, tier: 'Tier 1' },
    { team_name: 'Quarry Hill', points: 4, position: 1, tier: 'Tier 1' },
  ])
  checkFrames(trace)
})

test('3252 a tie across the second cutoff stays in Tier 2', () => {
  const result = solve([['A', 3, 0], ['B', 2, 2], ['C', 2, 1], ['D', 2, 0], ['E', 1, 3], ['F', 1, 2]])
  assert.deepEqual(result.map(row => [row.team_name, row.points, row.position, row.tier]), [
    ['A', 9, 1, 'Tier 1'], ['B', 8, 2, 'Tier 1'], ['C', 7, 3, 'Tier 2'],
    ['D', 6, 4, 'Tier 2'], ['E', 6, 4, 'Tier 2'], ['F', 5, 6, 'Tier 3'],
  ])
})

test('3252 single team and two teams', () => {
  assert.deepEqual(solve([['Solo', 0, 0]]), [{ team_name: 'Solo', points: 0, position: 1, tier: 'Tier 1' }])
  // Two teams: both cutoffs round up, to 1 and 2.
  assert.deepEqual(solve([['Low', 0, 1], ['High', 1, 0]]).map(row => [row.team_name, row.tier]), [['High', 'Tier 1'], ['Low', 'Tier 2']])
})

test('3252 agrees with a brute-force oracle on random leagues', () => {
  let seed = 3252
  const next = limit => (seed = (seed * 1103515245 + 12345) % 2147483648) % limit
  for (let round = 0; round < 400; round++) {
    const size = 1 + next(12)
    const rows = Array.from({ length: size }, (_, index) => [`T${next(100)}x${index}`, next(4), next(4)])
    const points = rows.map(([, wins, draws]) => wins * 3 + draws)
    const expected = rows.map(([name], index) => {
      let above = 0
      for (const other of points) if (other > points[index]) above++
      const position = above + 1
      // Integer ceilings, independent of the floating division in the solution.
      const tier = position * 3 <= size + 2 - ((size + 2) % 3) ? 'Tier 1' : position * 3 <= 2 * size + 2 - ((2 * size + 2) % 3) ? 'Tier 2' : 'Tier 3'
      return { team_name: name, points: points[index], position, tier }
    }).sort((a, b) => b.points - a.points || (a.team_name < b.team_name ? -1 : 1))
    const trace = buildTrace(parseInput(JSON.stringify(make(rows))))
    assert.deepEqual(trace.result, expected)
    checkFrames(trace)
  }
})

test('3252 frames fill in points, then positions, then tiers', () => {
  const { frames } = run(examples[0].input)
  assert.equal(frames.filter(frame => frame.phase === 'points').length, 7)
  assert.equal(frames.filter(frame => frame.phase === 'tier').length, 7)
  assert.ok(frames[0].table.every(row => row.points === null))
  assert.ok(frames.find(frame => frame.phase === 'cutoffs').ladder.every(row => row.position !== null && row.tier === null))
  assert.ok(sql.includes('RANK()'))
})

test('3252 rejects malformed input', () => {
  assert.throws(() => parseInput('{"TeamStats":[]}'))
  assert.throws(() => parseInput('{"TeamStats":[{"team_id":1,"team_name":"A","matches_played":1,"wins":-1,"draws":0,"losses":0}]}'))
  assert.throws(() => parseInput('{"TeamStats":[{"team_id":1,"team_name":"A","matches_played":0,"wins":0,"draws":0,"losses":0},{"team_id":1,"team_name":"B","matches_played":0,"wins":0,"draws":0,"losses":0}]}'))
})
