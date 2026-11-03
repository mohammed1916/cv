const SQL = `WITH old_rank AS (
  SELECT team_id, name, points,
    ROW_NUMBER() OVER (ORDER BY points DESC, name ASC) AS old_rnk
  FROM TeamPoints
),
new_points AS (
  SELECT t.team_id, t.name, t.points + COALESCE(c.points_change, 0) AS new_pts
  FROM TeamPoints t
  LEFT JOIN PointsChange c ON c.team_id = t.team_id
),
new_rank AS (
  SELECT team_id, name,
    ROW_NUMBER() OVER (ORDER BY new_pts DESC, name ASC) AS new_rnk
  FROM new_points
)
SELECT o.name, o.old_rnk - n.new_rnk AS rank_diff
FROM old_rank o
JOIN new_rank n ON n.team_id = o.team_id
ORDER BY o.name;`

const PY = `import pandas as pd

def change_in_global_rankings(team_points, points_change):
    old = team_points.sort_values(["points", "name"], ascending=[False, True]).reset_index(drop=True)
    old["old_rank"] = old.index + 1
    merged = team_points.merge(points_change, on="team_id", how="left")
    merged["points_change"] = merged["points_change"].fillna(0)
    merged["new_points"] = merged["points"] + merged["points_change"]
    new = merged.sort_values(["new_points", "name"], ascending=[False, True]).reset_index(drop=True)
    new["new_rank"] = new.index + 1
    out = old[["team_id", "name", "old_rank"]].merge(new[["team_id", "new_rank"]], on="team_id")
    out["rank_diff"] = (out["old_rank"] - out["new_rank"]).astype(int)
    return out[["name", "rank_diff"]].sort_values("name")
`

const SQL_LINES = SQL.split('\n')
const PY_LINES = PY.split('\n')
const snap = rows => JSON.parse(JSON.stringify(rows))
function lineOf(lines, fragment, label) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`${label} has no line containing "${fragment}"`)
  return index + 1
}
const frame = (phase, sqlFragment, pyFragment, message, rows) => ({
  phase,
  activeLine: lineOf(SQL_LINES, sqlFragment, 'SQL'),
  pythonLine: lineOf(PY_LINES, pyFragment, 'Python'),
  message,
  rows: snap(rows),
})

export const sql = SQL
export const python = PY
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))
export const phases = [
  { id: 'old', label: 'Before', description: 'Rank teams by current points; ties go to the name.' },
  { id: 'apply', label: 'Change', description: 'Add each change; teams without a change keep their points.' },
  { id: 'new', label: 'After', description: 'Rank again with the new points.' },
  { id: 'diff', label: 'Diff', description: 'Old rank minus new rank for each team.' },
  { id: 'done', label: 'Result', description: 'Team names with their rank change, by name.' },
]
export const sample = {
  team_points: [
    { team_id: 1, name: 'Arsenal', points: 10 },
    { team_id: 2, name: 'Bruins', points: 12 },
    { team_id: 3, name: 'Cobras', points: 8 },
    { team_id: 4, name: 'Dragons', points: 9 },
  ],
  points_change: [
    { team_id: 1, points_change: 3 },
    { team_id: 3, points_change: 2 },
    { team_id: 4, points_change: 1 },
  ],
}

const byName = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.team_points) || !Array.isArray(input.points_change)) throw new Error('Provide team_points and points_change arrays.')
  if (input.team_points.length > 10) throw new Error('Use at most 10 teams.')
  const ids = new Set(input.team_points.map(t => t.team_id))
  const names = new Set(input.team_points.map(t => t.name))
  if (ids.size !== input.team_points.length || names.size !== input.team_points.length) throw new Error('team_id and name must be unique.')
  for (const t of input.team_points) if (!Number.isInteger(t.points)) throw new Error('points is an integer.')
  const changed = new Set()
  for (const c of input.points_change) {
    if (!ids.has(c.team_id)) throw new Error(`Change names unknown team ${c.team_id}.`)
    if (changed.has(c.team_id)) throw new Error('Each team has at most one change.')
    if (!Number.isInteger(c.points_change)) throw new Error('points_change is an integer.')
    changed.add(c.team_id)
  }
  return input
}

export function buildTrace(input) {
  const frames = []
  const changes = new Map(input.points_change.map(c => [c.team_id, c.points_change]))
  const oldOrder = [...input.team_points]
    .sort((a, b) => b.points - a.points || byName(a, b))
    .map((t, i) => ({ name: t.name, points: t.points, old_rank: i + 1 }))
  frames.push(frame('old', 'ROW_NUMBER() OVER (ORDER BY points DESC', 'old = team_points.sort_values', 'Rank teams by current points, ties by name.', oldOrder))
  const applied = input.team_points.map(t => {
    const change = changes.get(t.team_id) ?? 0
    return { name: t.name, points: t.points, change, new_points: t.points + change }
  })
  frames.push(frame('apply', 'LEFT JOIN PointsChange', 'merged = team_points.merge', 'Apply each change; teams with no change keep their points.', applied))
  const newOrder = [...applied]
    .sort((a, b) => b.new_points - a.new_points || byName(a, b))
    .map((t, i) => ({ name: t.name, new_points: t.new_points, new_rank: i + 1 }))
  frames.push(frame('new', 'ROW_NUMBER() OVER (ORDER BY new_pts DESC', 'new = merged.sort_values', 'Rank again with the new points.', newOrder))
  const diffRows = oldOrder.map(o => {
    const n = newOrder.find(x => x.name === o.name)
    return { name: o.name, old_rank: o.old_rank, new_rank: n.new_rank, rank_diff: o.old_rank - n.new_rank }
  })
  frames.push(frame('diff', 'o.old_rnk - n.new_rnk', 'out["rank_diff"]', 'Old rank minus new rank for each team.', diffRows))
  const result = diffRows.map(r => ({ name: r.name, rank_diff: r.rank_diff })).sort(byName)
  frames.push(frame('done', 'ORDER BY o.name', 'return out[[', 'Rows listed by team name.', result))
  return { input, result, frames }
}
