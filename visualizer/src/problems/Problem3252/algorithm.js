const MAX_TEAMS = 12

export const sql = `WITH scored AS (
  SELECT team_name,
         3 * wins + draws AS points,
         RANK() OVER (ORDER BY 3 * wins + draws DESC) AS position,
         COUNT(*) OVER () AS teams
  FROM TeamStats
)
SELECT team_name, points, position,
       CASE WHEN position <= CEIL(teams / 3.0) THEN 'Tier 1'
            WHEN position <= CEIL(2 * teams / 3.0) THEN 'Tier 2'
            ELSE 'Tier 3'
       END AS tier
FROM scored
ORDER BY points DESC, team_name ASC;`

export const python = `import math
import pandas as pd

def league_tiers(team_stats):
    table = team_stats.copy()
    table["points"] = 3 * table["wins"] + table["draws"]
    table["position"] = table["points"].rank(method="min", ascending=False).astype(int)
    teams = len(table)
    cut_one = math.ceil(teams / 3)
    cut_two = math.ceil(2 * teams / 3)

    def tier_of(position):
        if position <= cut_one:
            return "Tier 1"
        if position <= cut_two:
            return "Tier 2"
        return "Tier 3"

    table["tier"] = table["position"].map(tier_of)
    table = table.sort_values(["points", "team_name"], ascending=[False, True])
    return table[["team_name", "points", "position", "tier"]]`

const pseudo = `read TeamStats
points = 3 times wins plus draws for each team
position = 1 plus the number of teams with more points
cut one = ceiling of teams / 3, cut two = ceiling of 2 * teams / 3
position up to cut one is Tier 1
position up to cut two is Tier 2
any other position is Tier 3
order by points high to low, then team_name A to Z
return team_name, points, position, tier`
const pseudoLines = pseudo.split('\n')
export const code = pseudoLines.map((text, index) => ({ line: index + 1, text }))

const lineIn = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line: ${text}`)
  return index + 1
}
const pyLines = python.split('\n')
const L = text => lineIn(pseudoLines, text)
const P = text => lineIn(pyLines, text)

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the league table.' },
  { id: 'points', label: 'Points', description: 'Work out each team\'s points.' },
  { id: 'rank', label: 'Rank', description: 'Sort by points and assign positions; equal points share one.' },
  { id: 'cutoffs', label: 'Cutoffs', description: 'Convert the league size into two position cutoffs.' },
  { id: 'tier', label: 'Tier', description: 'Compare each position with the cutoffs.' },
  { id: 'order', label: 'Order', description: 'Break ties in the display order by name.' },
  { id: 'done', label: 'Result', description: 'Output the four columns.' },
]
export const inputLabel = 'Object with a TeamStats table (team_id, team_name, matches_played, wins, draws, losses)'
export const complexity = 'O(t log t) for t teams, dominated by sorting. The visualization caps the table at 12 teams.'
export const url = 'https://leetcode.com/problems/premier-league-table-ranking-ii/'

const team = (team_id, team_name, wins, draws, losses) => ({ team_id, team_name, matches_played: wins + draws + losses, wins, draws, losses })
export const examples = [
  { label: 'Tie on a boundary', input: JSON.stringify({ TeamStats: [
    team(1, 'Copper Vale', 5, 4, 3),
    team(2, 'Harbor Rovers', 9, 2, 1),
    team(3, 'Beacon City', 8, 1, 3),
    team(4, 'Elm Park', 2, 5, 5),
    team(5, 'Ashford Town', 7, 4, 1),
    team(6, 'Mill Lane', 8, 3, 1),
    team(7, 'Delta Athletic', 4, 3, 5),
  ] }) },
  { label: 'Everyone level', input: JSON.stringify({ TeamStats: [
    team(1, 'Quarry Hill', 1, 1, 1),
    team(2, 'Oakford', 1, 1, 1),
    team(3, 'Pine Bank', 1, 1, 1),
  ] }) },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a TeamStats list.')
  const rows = input.TeamStats
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > MAX_TEAMS) throw new Error(`TeamStats must list 1 to ${MAX_TEAMS} teams.`)
  const seen = new Set()
  rows.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`Row ${index + 1} must be an object.`)
    if (!Number.isInteger(row.team_id)) throw new Error(`Row ${index + 1} needs an integer team_id.`)
    if (seen.has(row.team_id)) throw new Error(`team_id ${row.team_id} appears twice; it must be unique.`)
    seen.add(row.team_id)
    if (typeof row.team_name !== 'string' || !row.team_name) throw new Error(`Row ${index + 1} needs a team_name.`)
    for (const key of ['matches_played', 'wins', 'draws', 'losses']) {
      if (!Number.isInteger(row[key]) || row[key] < 0) throw new Error(`Row ${index + 1} needs a non-negative whole number for ${key}.`)
    }
  })
  return { TeamStats: rows.map(({ team_id, team_name, matches_played, wins, draws, losses }) => ({ team_id, team_name, matches_played, wins, draws, losses })) }
}

const byName = (a, b) => (a.team_name < b.team_name ? -1 : a.team_name > b.team_name ? 1 : 0)

export function buildTrace({ TeamStats }) {
  const frames = []
  const table = TeamStats.map(row => ({ ...row, points: null }))
  let ladder = []
  let cutOne = null
  let cutTwo = null
  const push = (phase, pseudoText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: L(pseudoText), pythonLine: P(pyText), message, at: -1, ladderAt: -1,
    table: table.map(row => ({ ...row })), ladder: ladder.map(row => ({ ...row })), cutOne, cutTwo, ...extra,
  })
  const count = table.length
  push('load', 'read TeamStats', 'table = team_stats.copy()', `The league has ${count} team${count === 1 ? '' : 's'}.`)

  table.forEach((row, index) => {
    row.points = 3 * row.wins + row.draws
    push('points', 'points = 3 times', 'table["points"] =', `${row.team_name}: 3 × ${row.wins} wins + ${row.draws} draws = ${row.points} points. Losses add nothing.`, { at: index })
  })

  // Sorted by points only, so the display order of tied teams is still undecided until the Order step.
  const sorted = table.map(row => ({ team_id: row.team_id, team_name: row.team_name, points: row.points, position: null, tier: null, pulledUp: false }))
    .sort((a, b) => b.points - a.points)
  sorted.forEach((row, index) => {
    const tied = index > 0 && sorted[index - 1].points === row.points
    row.position = tied ? sorted[index - 1].position : index + 1
    ladder = sorted.slice(0, sorted.length)
    push('rank', 'position = 1 plus', 'table["position"] =', tied
      ? `${row.team_name} has the same ${row.points} points as the team above, so it shares position ${row.position}.`
      : `${index} team${index === 1 ? ' has' : 's have'} more points than ${row.team_name}, so it takes position ${row.position}.`, { ladderAt: index })
  })

  cutOne = Math.ceil(count / 3)
  cutTwo = Math.ceil(2 * count / 3)
  push('cutoffs', 'cut one =', 'cut_two =', `With ${count} teams: Tier 1 is positions up to ⌈${count}/3⌉ = ${cutOne}, Tier 2 is positions up to ⌈2×${count}/3⌉ = ${cutTwo}, and the rest are Tier 3.`)

  sorted.forEach((row, index) => {
    const line = row.position <= cutOne
      ? { tier: 'Tier 1', pseudo: 'up to cut one', py: 'return "Tier 1"', cut: cutOne, name: 'cut one' }
      : row.position <= cutTwo
        ? { tier: 'Tier 2', pseudo: 'up to cut two', py: 'return "Tier 2"', cut: cutTwo, name: 'cut two' }
        : { tier: 'Tier 3', pseudo: 'any other', py: 'return "Tier 3"', cut: null, name: null }
    row.tier = line.tier
    // Counting rows alone would have passed this team over the cutoff; its shared position keeps it above.
    row.pulledUp = line.cut !== null && index + 1 > line.cut
    const reason = line.cut === null
      ? `position ${row.position} is past both cutoffs`
      : `position ${row.position} ≤ ${line.name} (${line.cut})`
    push('tier', line.pseudo, line.py, `${row.team_name}: ${reason}, so ${line.tier}.${row.pulledUp ? ` It is row ${index + 1}, past the cutoff, but it ties a team inside it and moves to the higher tier.` : ''}`, { ladderAt: index })
  })

  ladder = [...sorted].sort((a, b) => b.points - a.points || byName(a, b))
  push('order', 'order by points', 'table = table.sort_values', 'Within equal points, teams are listed by name. Positions and tiers do not change.')
  const result = ladder.map(({ team_name, points, position, tier }) => ({ team_name, points, position, tier }))
  push('done', 'return team_name', 'return table[[', `Return ${result.length} row${result.length === 1 ? '' : 's'}. Tier 1 has ${result.filter(row => row.tier === 'Tier 1').length}, Tier 2 has ${result.filter(row => row.tier === 'Tier 2').length}, Tier 3 has ${result.filter(row => row.tier === 'Tier 3').length}.`)
  return { input: { TeamStats }, result, frames }
}
