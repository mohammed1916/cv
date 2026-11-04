import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, sql, phases, examples } from './algorithm.js'

const R = (team_name, half_number, dominance) => ({ team_name, half_number, dominance })

test('3384 hand-computed examples', () => {
  const big = buildTrace(parseInput(examples[0].input))
  assert.deepEqual(big.result, [R('Falcons', 1, 1), R('Falcons', 2, 0), R('Otters', 1, 0), R('Otters', 2, 2)])
  const silent = buildTrace(parseInput(examples[1].input))
  assert.deepEqual(silent.result, [R('Reds', 1, 0), R('Reds', 2, 1)])
  assert.deepEqual(buildTrace(parseInput(examples[2].input)).result, [])
})

test('3384 45:00 is first half and 45:01 is second half', () => {
  const teams = [{ player_id: 1, team_name: 'A' }, { player_id: 2, team_name: 'A' }]
  const passes = [{ pass_from: 1, time_stamp: '45:00', pass_to: 2 }, { pass_from: 2, time_stamp: '45:01', pass_to: 1 }]
  assert.deepEqual(buildTrace({ teams, passes }).result, [R('A', 1, 1), R('A', 2, 1)])
})

test('3384 points go to the sender team only', () => {
  const teams = [{ player_id: 1, team_name: 'B' }, { player_id: 2, team_name: 'A' }]
  const passes = [{ pass_from: 1, time_stamp: '01:00', pass_to: 2 }, { pass_from: 1, time_stamp: '02:00', pass_to: 2 }]
  assert.deepEqual(buildTrace({ teams, passes }).result, [R('B', 1, -2)])
})

function oracle(teams, passes) {
  const team = id => teams.find(t => t.player_id === id).team_name
  const names = [...new Set(teams.map(t => t.team_name))].sort()
  const out = []
  for (const name of names) {
    for (const half of [1, 2]) {
      const mine = passes.filter(p => team(p.pass_from) === name && (half === 1) === (p.time_stamp <= '45:00'))
      if (!mine.length) continue
      const same = mine.filter(p => team(p.pass_to) === name).length
      out.push(R(name, half, same - (mine.length - same)))
    }
  }
  return out
}

test('3384 random matches agree with a per-group filter oracle', () => {
  let seed = 3384
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const teams = Array.from({ length: 2 + rnd(6) }, (_, i) => ({ player_id: i + 1, team_name: rnd(2) ? 'East' : 'West' }))
    const seen = new Set()
    const passes = []
    for (let p = rnd(15); p > 0; p--) {
      const from = teams[rnd(teams.length)].player_id
      const stamp = `${String(40 + rnd(10)).padStart(2, '0')}:${String(rnd(60)).padStart(2, '0')}`
      if (seen.has(`${from}@${stamp}`)) continue
      seen.add(`${from}@${stamp}`)
      passes.push({ pass_from: from, time_stamp: stamp, pass_to: teams[rnd(teams.length)].player_id })
    }
    assert.deepEqual(buildTrace({ teams, passes }).result, oracle(teams, passes))
  }
})

test('3384 parseInput enforces keys and the time format', () => {
  const teams = [{ player_id: 1, team_name: 'A' }]
  const parse = (t, p) => parseInput(JSON.stringify({ teams: t, passes: p }))
  assert.throws(() => parse([...teams, ...teams], []))
  assert.throws(() => parse(teams, [{ pass_from: 9, time_stamp: '01:00', pass_to: 1 }]))
  assert.throws(() => parse(teams, [{ pass_from: 1, time_stamp: '90:01', pass_to: 1 }]))
  assert.throws(() => parse(teams, [{ pass_from: 1, time_stamp: '1:00', pass_to: 1 }]))
  assert.throws(() => parse(teams, [{ pass_from: 1, time_stamp: '10:60', pass_to: 1 }]))
  const dup = { pass_from: 1, time_stamp: '01:00', pass_to: 1 }
  assert.throws(() => parse(teams, [dup, dup]))
  assert.throws(() => parse([...teams, { player_id: 2, team_name: 'B' }, { player_id: 3, team_name: 'C' }], []))
  assert.doesNotThrow(() => parse(teams, [{ pass_from: 1, time_stamp: '90:00', pass_to: 1 }]))
})

test('3384 examples run and frames map to real lines', () => {
  const ids = new Set(phases.map(p => p.id))
  const lines = python.trim().split('\n')
  assert.ok(sql.includes('GROUP BY'))
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const { frames, input } = buildTrace(parseInput(example.input))
    assert.equal(frames[0].phase, 'load')
    assert.equal(frames.at(-1).phase, 'done')
    assert.equal(frames.filter(f => f.phase === 'add').length, input.passes.length)
    for (const f of frames) {
      assert.ok(ids.has(f.phase))
      assert.ok(f.message.length > 0)
      assert.ok(code.some(c => c.line === f.activeLine))
      assert.ok(lines[f.pythonLine - 1]?.trim(), `python line ${f.pythonLine}`)
    }
    assert.deepEqual(frames.at(-1).report, buildTrace(input).result)
  }
})
