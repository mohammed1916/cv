export const phases = [
  { id: 'join', label: 'Join', description: 'Look up the team of the sender and of the receiver.' },
  { id: 'sort', label: 'Sort', description: 'Streaks follow match time, so order the passes by time_stamp.' },
  { id: 'extend', label: 'Extend', description: 'A pass kept inside the team adds one to that team\'s run.' },
  { id: 'break', label: 'Break', description: 'A pass lost to another team resets that team\'s run.' },
  { id: 'done', label: 'Result', description: 'Report each team\'s best run, ordered by name.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with teams and passes.')
  const { teams, passes } = input
  if (!teams || typeof teams !== 'object' || Array.isArray(teams)) throw new Error('teams maps each team name to a list of player ids.')
  const names = Object.keys(teams)
  if (names.length < 1 || names.length > 6) throw new Error('Use 1 to 6 teams in this visualization.')
  const seen = new Set()
  for (const name of names) {
    if (!name || !Array.isArray(teams[name])) throw new Error('teams maps each team name to a list of player ids.')
    for (const id of teams[name]) {
      if (!Number.isInteger(id)) throw new Error('Player ids are integers.')
      if (seen.has(id)) throw new Error(`Player ${id} is listed twice; player_id is unique.`)
      seen.add(id)
    }
  }
  if (!Array.isArray(passes) || passes.length > 20) throw new Error('passes is a list of up to 20 [from, "MM:SS", to] entries in this visualization.')
  const times = new Set()
  for (const pass of passes) {
    if (!Array.isArray(pass) || pass.length !== 3) throw new Error('Each pass is [from, "MM:SS", to].')
    const [from, time, to] = pass
    if (!seen.has(from) || !seen.has(to)) throw new Error('Both players of a pass must appear in teams.')
    if (typeof time !== 'string' || !/^\d{2}:[0-5]\d$/.test(time) || time > '90:00') throw new Error('time_stamp runs from 00:00 to 90:00.')
    if (times.has(time)) throw new Error(`Two passes share ${time}; this visualization needs distinct times so the order is unambiguous.`)
    times.add(time)
  }
  return { teams, passes }
}

const byName = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

export function buildTrace({ teams, passes }) {
  const teamOf = new Map()
  for (const [name, players] of Object.entries(teams)) for (const id of players) teamOf.set(id, name)
  const names = Object.keys(teams).sort(byName)
  const frames = []
  const pending = passes.map(([pass_from, time_stamp, pass_to]) => ({ pass_from, time_stamp, pass_to, team_from: '?', team_to: '?', kept: '?' }))
  let rows = pending
  let chips = []
  const streak = Object.fromEntries(names.map(name => [name, 0]))
  const best = {}
  const output = () => names.filter(name => name in best).map(name => ({ team_name: name, longest_streak: best[name] }))
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, names, rows: rows.map(row => ({ ...row })), activeRow: -1, chips: chips.map(chip => ({ ...chip })), activeChip: -1,
    streak: { ...streak }, best: { ...best }, output: [], ...extra,
  })

  if (!passes.length) push('join', L('look up the team of both'), P('team_of = {'), 'There are no passes to join.')
  rows = pending.map(row => ({ ...row }))
  rows.forEach((row, at) => {
    row.team_from = teamOf.get(row.pass_from)
    row.team_to = teamOf.get(row.pass_to)
    row.kept = row.team_from === row.team_to ? 'yes' : 'no'
    push('join', L('look up the team of both'), P('team_of = {'), row.kept === 'yes'
      ? `Players ${row.pass_from} and ${row.pass_to} are both on ${row.team_from}, so this pass stays inside the team.`
      : `Player ${row.pass_from} is on ${row.team_from} but ${row.pass_to} is on ${row.team_to}, so the ball was lost.`, { activeRow: at })
  })
  rows = [...rows].sort((a, b) => byName(a.time_stamp, b.time_stamp))
  chips = rows.map(row => ({ time: row.time_stamp, from: row.pass_from, to: row.pass_to, team: row.team_from, kept: row.kept === 'yes', run: null, seen: false }))
  push('sort', L('order the passes'), P('sorted(passes'), 'Put the passes in match order. Each one lands in the lane of the team that sent it, so a team\'s run is read along its own lane.')
  rows.forEach((row, at) => {
    const team = row.team_from
    const chip = chips[at]
    chip.seen = true
    if (row.kept === 'yes') {
      streak[team] += 1
      chip.run = streak[team]
      const improved = streak[team] > (best[team] ?? 0)
      if (improved) best[team] = streak[team]
      push('extend', L('add one to that team'), P('streak.get(team, 0) + 1'), `${row.time_stamp}: ${team} keeps the ball, so its run is ${streak[team]}.${improved ? ' That is its best so far.' : ` Its best stays ${best[team]}.`}`, { activeRow: at, activeChip: at })
    } else {
      const ended = streak[team]
      streak[team] = 0
      push('break', L('reset that team'), P('streak[team] = 0'), ended
        ? `${row.time_stamp}: ${team} passes to ${row.team_to}. Its run of ${ended} ends and restarts at 0.`
        : `${row.time_stamp}: ${team} passes to ${row.team_to}. It had no run going, so nothing is lost.`, { activeRow: at, activeChip: at })
    }
  })
  const result = output()
  const missing = names.filter(name => !(name in best))
  push('done', L('report each team'), P('return sorted'), `${result.length ? `Longest runs: ${result.map(row => `${row.team_name} ${row.longest_streak}`).join(', ')}.` : 'No team completed a pass inside itself.'}${missing.length ? ` ${missing.join(', ')} never kept a pass, so no row appears for ${missing.length === 1 ? 'it' : 'them'}.` : ''}`, { output: result })
  return { input: { teams, passes }, result, frames }
}

export const code = `longest run of same-team passes for each team
  look up the team of both players in every pass
  order the passes by time
  for each pass, take the sender's team
    if the receiver is on that team, add one to that team's run and keep its best
    otherwise reset that team's run to 0
  report each team with a best run, ordered by name`.split('\n').map((text, index) => ({ line: index + 1, text }))
function L(s) {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def longest_streaks(teams, passes):
    team_of = {p: name for name, players in teams.items() for p in players}
    streak, best = {}, {}
    for sender, _, receiver in sorted(passes, key=lambda p: p[1]):
        team = team_of[sender]
        if team_of[receiver] == team:
            streak[team] = streak.get(team, 0) + 1
            best[team] = max(best.get(team, 0), streak[team])
        else:
            streak[team] = 0
    return sorted(best.items())
`
function P(s) {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}

export const sql = `WITH labelled AS (
  SELECT sender.team_name, p.time_stamp,
         sender.team_name = receiver.team_name AS kept
  FROM Passes p
  JOIN Teams sender ON sender.player_id = p.pass_from
  JOIN Teams receiver ON receiver.player_id = p.pass_to
), runs AS (
  SELECT team_name, kept,
         SUM(NOT kept) OVER (PARTITION BY team_name ORDER BY time_stamp) AS run_id
  FROM labelled
), run_sizes AS (
  SELECT team_name, run_id, COUNT(*) AS size
  FROM runs
  WHERE kept
  GROUP BY team_name, run_id
)
SELECT team_name, MAX(size) AS longest_streak
FROM run_sizes
GROUP BY team_name
ORDER BY team_name;
`
