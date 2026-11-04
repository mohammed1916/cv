const MAX_PLAYERS = 16
const MAX_PASSES = 24
export const COLUMNS = ['pass_from', 'time_stamp', 'pass_to', 'from_team', 'to_team', 'half', 'score']
export const REPORT_COLUMNS = ['team_name', 'half_number', 'dominance']

const validStamp = stamp => {
  if (typeof stamp !== 'string' || !/^\d{2}:[0-5]\d$/.test(stamp)) return false
  return stamp <= '90:00'
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with teams and passes.')
  const { teams, passes } = input
  if (!Array.isArray(teams) || !Array.isArray(passes)) throw new Error('teams and passes must both be lists.')
  if (teams.length > MAX_PLAYERS) throw new Error(`The visualization shows at most ${MAX_PLAYERS} players.`)
  if (passes.length > MAX_PASSES) throw new Error(`The visualization shows at most ${MAX_PASSES} passes.`)
  const ids = new Set()
  for (const row of teams) {
    if (!row || !Number.isInteger(row.player_id)) throw new Error('Each Teams row needs an integer player_id.')
    if (typeof row.team_name !== 'string' || !row.team_name) throw new Error('Each Teams row needs a team_name.')
    if (ids.has(row.player_id)) throw new Error(`player_id ${row.player_id} appears twice.`)
    ids.add(row.player_id)
  }
  if (new Set(teams.map(row => row.team_name)).size > 2) throw new Error('A match has at most two teams.')
  const keys = new Set()
  for (const row of passes) {
    if (!row || !ids.has(row.pass_from) || !ids.has(row.pass_to)) throw new Error('pass_from and pass_to must be players listed in teams.')
    if (!validStamp(row.time_stamp)) throw new Error('time_stamp must look like MM:SS and lie between 00:00 and 90:00.')
    const key = `${row.pass_from}@${row.time_stamp}`
    if (keys.has(key)) throw new Error(`Player ${row.pass_from} already passes at ${row.time_stamp}.`)
    keys.add(key)
  }
  return {
    teams: teams.map(({ player_id, team_name }) => ({ player_id, team_name })),
    passes: passes.map(({ pass_from, time_stamp, pass_to }) => ({ pass_from, time_stamp, pass_to })),
  }
}

export const sql = `SELECT s.team_name,
       CASE WHEN p.time_stamp <= '45:00' THEN 1 ELSE 2 END AS half_number,
       SUM(CASE WHEN s.team_name = r.team_name THEN 1 ELSE -1 END) AS dominance
FROM Passes p
JOIN Teams s ON s.player_id = p.pass_from
JOIN Teams r ON r.player_id = p.pass_to
GROUP BY s.team_name, half_number
ORDER BY s.team_name, half_number;`

export const code = `dominance per team and half
  for each pass row
    find the sender's team
    find the receiver's team
    half is 1 when time_stamp is at most 45:00, otherwise 2
    score is +1 when both teams match, otherwise -1
    add the score to the group (sender's team, half)
  sort the groups by team name, then half
  return team_name, half_number, dominance`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def team_dominance(teams, passes):
    team_of = teams.set_index('player_id')['team_name']
    rows = passes.assign(
        team_name=passes['pass_from'].map(team_of),
        receiver_team=passes['pass_to'].map(team_of),
        half_number=(passes['time_stamp'] > '45:00').astype(int) + 1,
    )
    rows['dominance'] = (rows['team_name'] == rows['receiver_team']).map({True: 1, False: -1})
    report = rows.groupby(['team_name', 'half_number'], as_index=False)['dominance'].sum()
    return report.sort_values(['team_name', 'half_number'])[['team_name', 'half_number', 'dominance']]
`

const L = text => {
  const hit = code.find(line => line.text.includes(text))
  if (!hit) throw new Error(`Missing pseudocode line: ${text}`)
  return hit.line
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing Python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'load', label: 'Load', description: 'The two tables as stored.' },
  { id: 'sender', label: 'Sender', description: 'Join the passer to their team.' },
  { id: 'receiver', label: 'Receiver', description: 'Join the receiver to their team.' },
  { id: 'half', label: 'Half', description: 'Compare the time with 45:00.' },
  { id: 'score', label: 'Score', description: 'Same team is +1, other team is -1.' },
  { id: 'add', label: 'Add', description: 'Add to the group of the sending team in this half.' },
  { id: 'sort', label: 'Sort', description: 'Order groups by team, then half.' },
  { id: 'done', label: 'Output', description: 'The report table.' },
]

const order = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

export function buildTrace({ teams, passes }) {
  const teamOf = new Map(teams.map(row => [row.player_id, row.team_name]))
  const joined = passes.map(({ pass_from, time_stamp, pass_to }) => ({ pass_from, time_stamp, pass_to }))
  const groups = {}
  const frames = []
  const emit = (phase, activeLine, pythonLine, at, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, at, message,
    joined: joined.map(row => ({ ...row })),
    groups: { ...groups },
    report: [],
    ...extra,
  })
  emit('load', L('dominance per'), P("team_of = teams"), -1, `${teams.length} players and ${passes.length} passes are stored.`)
  passes.forEach((pass, i) => {
    const row = joined[i]
    row.from_team = teamOf.get(pass.pass_from)
    emit('sender', L("sender's team"), P('team_name=passes'), i, `Pass ${i}: player ${pass.pass_from} sends it and plays for ${row.from_team}.`)
    row.to_team = teamOf.get(pass.pass_to)
    emit('receiver', L("receiver's team"), P('receiver_team=passes'), i, `Player ${pass.pass_to} receives it and plays for ${row.to_team}.`)
    row.half = pass.time_stamp <= '45:00' ? 1 : 2
    emit('half', L('half is 1'), P('half_number=(passes'), i, `${pass.time_stamp} is ${row.half === 1 ? 'at or before' : 'after'} 45:00, so this is half ${row.half}.`)
    row.score = row.from_team === row.to_team ? 1 : -1
    emit('score', L('score is'), P("rows['dominance'] ="), i, row.score === 1 ? `${row.from_team} kept the ball: +1.` : `${row.to_team} intercepted it: -1 for ${row.from_team}.`)
    const key = `${row.from_team}|${row.half}`
    const before = groups[key] ?? 0
    groups[key] = before + row.score
    emit('add', L('add the score'), P("rows['dominance'] ="), i, `${row.from_team}, half ${row.half}: ${before} ${row.score > 0 ? '+ 1' : '- 1'} = ${groups[key]}.`, { touched: key })
  })
  const result = Object.entries(groups)
    .map(([key, dominance]) => {
      const cut = key.lastIndexOf('|')
      return { team_name: key.slice(0, cut), half_number: Number(key.slice(cut + 1)), dominance }
    })
    .sort((a, b) => order(a.team_name, b.team_name) || a.half_number - b.half_number)
  emit('sort', L('sort the groups'), P('report = rows'), -1, result.length ? `${result.length} group${result.length === 1 ? '' : 's'} had at least one pass, ordered by team then half.` : 'No pass means no group at all.', { report: result })
  emit('done', L('return team_name'), P('return report'), -1, `Report has ${result.length} row${result.length === 1 ? '' : 's'}. A team with no pass in a half gets no row, not a zero.`, { report: result })
  return { input: { teams, passes }, result, frames }
}

export const inputLabel = 'Object with teams (player_id, team_name) and passes (pass_from, time_stamp, pass_to)'
export const complexity = 'O(p + t + g log g) for p passes, t players and g output groups, using hashed player lookups. The visualization caps the tables at 16 players and 24 passes; time_stamp strings compare correctly because they are zero-padded.'
export const examples = [
  {
    label: 'Falcons v Otters',
    input: JSON.stringify({
      teams: [{ player_id: 11, team_name: 'Falcons' }, { player_id: 12, team_name: 'Falcons' }, { player_id: 13, team_name: 'Falcons' }, { player_id: 21, team_name: 'Otters' }, { player_id: 22, team_name: 'Otters' }, { player_id: 23, team_name: 'Otters' }],
      passes: [
        { pass_from: 11, time_stamp: '05:10', pass_to: 12 }, { pass_from: 12, time_stamp: '17:40', pass_to: 21 },
        { pass_from: 21, time_stamp: '22:05', pass_to: 22 }, { pass_from: 12, time_stamp: '30:00', pass_to: 13 },
        { pass_from: 22, time_stamp: '45:00', pass_to: 11 }, { pass_from: 13, time_stamp: '45:01', pass_to: 11 },
        { pass_from: 23, time_stamp: '60:30', pass_to: 21 }, { pass_from: 21, time_stamp: '71:15', pass_to: 23 },
        { pass_from: 11, time_stamp: '88:20', pass_to: 23 },
      ],
    }),
  },
  {
    label: 'One side never passes',
    input: JSON.stringify({
      teams: [{ player_id: 1, team_name: 'Reds' }, { player_id: 2, team_name: 'Reds' }, { player_id: 3, team_name: 'Blues' }],
      passes: [{ pass_from: 1, time_stamp: '10:00', pass_to: 2 }, { pass_from: 2, time_stamp: '12:00', pass_to: 3 }, { pass_from: 1, time_stamp: '50:00', pass_to: 2 }],
    }),
  },
  {
    label: 'No passes',
    input: JSON.stringify({ teams: [{ player_id: 7, team_name: 'Reds' }, { player_id: 8, team_name: 'Blues' }], passes: [] }),
  },
]
