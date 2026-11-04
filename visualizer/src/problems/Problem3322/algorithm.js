const MAX_ROWS = 12
const NUMBER_FIELDS = ['matches_played', 'wins', 'draws', 'losses', 'goals_for', 'goals_against']

const SQL_LINES = [
  'WITH scored AS (',
  '  SELECT season_id, team_id, team_name,',
  '         wins * 3 + draws AS points,',
  '         goals_for - goals_against AS goal_difference',
  '  FROM SeasonStats',
  ')',
  'SELECT season_id, team_id, team_name, points, goal_difference,',
  '       RANK() OVER (',
  '         PARTITION BY season_id',
  '         ORDER BY points DESC, goal_difference DESC, team_name ASC',
  '       ) AS position',
  'FROM scored',
  'ORDER BY season_id, position, team_name;',
]

export const sql = SQL_LINES.join('\n')
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))

export const python = `def season_table(season_stats):
    rows = []
    for team in season_stats:
        points = team["wins"] * 3 + team["draws"]
        goal_difference = team["goals_for"] - team["goals_against"]
        rows.append({"season_id": team["season_id"], "team_id": team["team_id"], "team_name": team["team_name"], "points": points, "goal_difference": goal_difference})
    rows.sort(key=lambda row: (row["season_id"], -row["points"], -row["goal_difference"], row["team_name"].lower()))
    season, position = None, 0
    for row in rows:
        if row["season_id"] != season:
            season, position = row["season_id"], 0
        position += 1
        row["position"] = position
    return rows
`

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the SeasonStats rows.' },
  { id: 'points', label: 'Points', description: 'Three for a win, one for a draw.' },
  { id: 'difference', label: 'Goal difference', description: 'Goals scored minus goals conceded.' },
  { id: 'partition', label: 'Partition', description: 'Each season gets its own league table.' },
  { id: 'compare', label: 'Compare', description: 'Walk the tie-break ladder between two teams.' },
  { id: 'position', label: 'Position', description: 'Number the teams from the top of each table.' },
  { id: 'order', label: 'Order', description: 'Sort the output by season, position and name.' },
  { id: 'done', label: 'Result', description: 'The finished table.' },
]

const lineOf = (lines, fragment) => {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`No line contains "${fragment}"`)
  return index + 1
}
const S = fragment => lineOf(SQL_LINES, fragment)
const PY = python.trim().split('\n')
const P = fragment => lineOf(PY, fragment)

export function parseInput(text) {
  const input = JSON.parse(text)
  const stats = input?.season_stats
  if (!Array.isArray(stats) || stats.length < 1 || stats.length > MAX_ROWS) throw new Error(`season_stats has 1 to ${MAX_ROWS} rows in this view.`)
  const ids = new Set(), names = new Set()
  for (const row of stats) {
    if (!row || !Number.isInteger(row.season_id) || !Number.isInteger(row.team_id)) throw new Error('season_id and team_id are integers.')
    if (typeof row.team_name !== 'string' || !row.team_name.trim()) throw new Error('team_name is a non-empty string.')
    for (const field of NUMBER_FIELDS) if (!Number.isInteger(row[field]) || row[field] < 0) throw new Error(`${field} is a non-negative integer.`)
    const id = `${row.season_id}|${row.team_id}`
    if (ids.has(id)) throw new Error('Each team appears once per season.')
    ids.add(id)
    const name = `${row.season_id}|${row.team_name.toLowerCase()}`
    if (names.has(name)) throw new Error('Team names are distinct within a season in this view.')
    names.add(name)
  }
  return { season_stats: stats.map(row => ({ ...row })) }
}

// Compare two scored teams through the tie-break ladder; the ladder says which rung settled it.
export function compareTeams(a, b) {
  const nameA = a.team_name.toLowerCase(), nameB = b.team_name.toLowerCase()
  const rungs = [
    { key: 'points', label: 'Points', a: a.points, b: b.points, winner: a.points === b.points ? null : a.points > b.points ? 'a' : 'b' },
    { key: 'goal_difference', label: 'Goal difference', a: a.goal_difference, b: b.goal_difference, winner: a.goal_difference === b.goal_difference ? null : a.goal_difference > b.goal_difference ? 'a' : 'b' },
    { key: 'team_name', label: 'Name', a: a.team_name, b: b.team_name, winner: nameA === nameB ? null : nameA < nameB ? 'a' : 'b' },
  ]
  let winner = null, deciding = null
  const ladder = rungs.map(rung => {
    if (winner) return { ...rung, state: 'unused' }
    if (!rung.winner) return { ...rung, state: 'tie' }
    winner = rung.winner
    deciding = rung.key
    return { ...rung, state: 'decides' }
  })
  return { ladder, winner, deciding }
}

const signed = value => (value > 0 ? `+${value}` : String(value))

export function buildTrace({ season_stats }) {
  const frames = []
  const table = season_stats.map(row => ({ ...row, points: null, goal_difference: null, position: null }))
  let seasons = null, output = null
  const emit = fields => frames.push({
    table: table.map(row => ({ ...row })),
    seasons: seasons && seasons.map(s => ({ season_id: s.season_id, order: [...s.order], waiting: [...s.waiting] })),
    output, at: -1, other: -1, calc: null, compare: null, ...fields,
  })

  emit({ phase: 'load', activeLine: S('FROM SeasonStats'), pythonLine: P('rows = []'), message: `Read ${table.length} row${table.length === 1 ? '' : 's'} from SeasonStats.` })

  table.forEach((row, at) => {
    row.points = row.wins * 3 + row.draws
    emit({ phase: 'points', activeLine: S('wins * 3'), pythonLine: P('points = team'), at, calc: `${row.wins} × 3 + ${row.draws} = ${row.points}`, message: `${row.team_name}, season ${row.season_id}: ${row.wins} wins and ${row.draws} draws make ${row.points} points. Losses add nothing.` })
    row.goal_difference = row.goals_for - row.goals_against
    emit({ phase: 'difference', activeLine: S('goals_for - goals_against'), pythonLine: P('goal_difference = team'), at, calc: `${row.goals_for} − ${row.goals_against} = ${signed(row.goal_difference)}`, message: `${row.team_name} scored ${row.goals_for} and conceded ${row.goals_against}: goal difference ${signed(row.goal_difference)}.` })
  })

  const seasonIds = [...new Set(table.map(row => row.season_id))].sort((a, b) => a - b)
  seasons = seasonIds.map(season_id => ({ season_id, order: [], waiting: table.flatMap((row, i) => (row.season_id === season_id ? [i] : [])) }))
  emit({ phase: 'partition', activeLine: S('PARTITION BY'), pythonLine: P('rows.sort('), message: `${seasonIds.length} season${seasonIds.length === 1 ? '' : 's'}: positions restart in each one, so teams only compete inside their own season.` })

  const sortLine = P('rows.sort(')
  const orderLine = S('ORDER BY points')
  for (const season of seasons) {
    while (season.waiting.length) {
      const at = season.waiting.shift()
      const team = table[at]
      season.order.push(at)
      let slot = season.order.length - 1
      if (slot === 0) {
        emit({ phase: 'compare', activeLine: orderLine, pythonLine: sortLine, at, message: `${team.team_name} is the first team placed in season ${season.season_id}.` })
        continue
      }
      while (slot > 0) {
        const other = season.order[slot - 1]
        const compare = compareTeams(team, table[other])
        const rung = compare.ladder.find(r => r.state === 'decides')
        const moves = compare.winner === 'a'
        const message = `${team.team_name} against ${table[other].team_name}: ${rung.label.toLowerCase()} decides. ${moves ? `${team.team_name} moves above.` : `${team.team_name} stays below.`}`
        emit({ phase: 'compare', activeLine: orderLine, pythonLine: sortLine, at, other, compare, message })
        if (!moves) break
        season.order[slot] = other
        season.order[slot - 1] = at
        slot--
      }
    }
  }

  for (const season of seasons) {
    season.order.forEach((at, index) => {
      table[at].position = index + 1
      emit({ phase: 'position', activeLine: S('RANK() OVER'), pythonLine: P('row["position"] = position'), at, message: `${table[at].team_name} is number ${index + 1} in season ${season.season_id}.` })
    })
  }

  const result = seasons.flatMap(season => season.order.map(at => {
    const { season_id, team_id, team_name, points, goal_difference, position } = table[at]
    return { season_id, team_id, team_name, points, goal_difference, position }
  }))
  output = result
  emit({ phase: 'order', activeLine: S('ORDER BY season_id'), pythonLine: P('return rows'), message: 'Output rows run by season, then position, then name.' })
  emit({ phase: 'done', activeLine: S('SELECT season_id, team_id, team_name, points'), pythonLine: P('return rows'), message: `Return ${result.length} row${result.length === 1 ? '' : 's'}.` })
  return { input: { season_stats }, result, frames }
}
