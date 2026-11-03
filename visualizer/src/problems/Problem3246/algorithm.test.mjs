import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const sample = {
  TeamStats: [
    { team_id: 1, team_name: 'Ashford', matches_played: 5, wins: 3, draws: 1, losses: 1 },
    { team_id: 2, team_name: 'Brackley', matches_played: 5, wins: 2, draws: 2, losses: 1 },
    { team_id: 3, team_name: 'Cressy', matches_played: 5, wins: 3, draws: 1, losses: 1 },
    { team_id: 4, team_name: 'Dunmore', matches_played: 4, wins: 0, draws: 2, losses: 2 },
    { team_id: 5, team_name: 'Elmsby', matches_played: 4, wins: 2, draws: 0, losses: 2 },
  ],
}

test('3246 ranks by points with RANK gaps and name order inside a tie', () => {
  // Points: Ashford 10, Brackley 8, Cressy 10, Dunmore 2, Elmsby 6.
  // Ashford and Cressy share position 1, Brackley is 3, Elmsby 4, Dunmore 5.
  const { result } = buildTrace(sample)
  assert.deepEqual(result, [
    { team_id: 1, team_name: 'Ashford', points: 10, position: 1 },
    { team_id: 3, team_name: 'Cressy', points: 10, position: 1 },
    { team_id: 2, team_name: 'Brackley', points: 8, position: 3 },
    { team_id: 5, team_name: 'Elmsby', points: 6, position: 4 },
    { team_id: 4, team_name: 'Dunmore', points: 2, position: 5 },
  ])
})

test('3246 two teams with only draws share first place', () => {
  const input = parseInput('{"TeamStats":[{"team_id":7,"team_name":"Fenwick","matches_played":3,"wins":0,"draws":3,"losses":0},{"team_id":8,"team_name":"Garston","matches_played":3,"wins":0,"draws":3,"losses":0}]}')
  const { result } = buildTrace(input)
  assert.deepEqual(result.map(r => [r.team_name, r.points, r.position]), [['Fenwick', 3, 1], ['Garston', 3, 1]])
})

test('3246 rejects a row whose results do not add up, and frame invariants hold', () => {
  assert.throws(() => parseInput('{"TeamStats":[{"team_id":1,"team_name":"Ashford","matches_played":5,"wins":2,"draws":2,"losses":2}]}'))
  const { frames } = buildTrace(sample)
  assert.ok(frames.length > 0)
  for (const f of frames) {
    assert.ok(phases.some(p => p.id === f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= python.split('\n').length)
    assert.equal(typeof f.message, 'string')
    assert.ok(f.message.length > 0)
    assert.ok(Array.isArray(f.rows))
  }
})
