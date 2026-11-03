// Knowledge-derived teaching model. The SQL, pandas code, sample rows and wording were written for this visualizer.
const SQL = `WITH counts AS (
  SELECT user_id, reaction, COUNT(*) AS n
  FROM reactions
  GROUP BY user_id, reaction
), totals AS (
  SELECT user_id, SUM(n) AS total, MAX(n) AS top_n
  FROM counts
  GROUP BY user_id
)
SELECT c.user_id, c.reaction AS dominant_reaction,
  ROUND(t.top_n * 1.0 / t.total, 2) AS reaction_ratio
FROM counts c
JOIN totals t ON t.user_id = c.user_id AND c.n = t.top_n
WHERE t.total >= 5 AND t.top_n * 5 >= t.total * 3
ORDER BY reaction_ratio DESC, c.user_id ASC`

export const code = SQL.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def emotionally_consistent(reactions):
    counts = reactions.groupby(["user_id", "reaction"]).size().reset_index(name="n")
    totals = counts.groupby("user_id").agg(total=("n", "sum"), top_n=("n", "max")).reset_index()
    merged = counts.merge(totals, on="user_id")
    merged = merged[merged["n"] == merged["top_n"]]
    merged = merged[(merged["total"] >= 5) & (merged["top_n"] * 5 >= merged["total"] * 3)]
    merged["reaction_ratio"] = (merged["top_n"] / merged["total"]).round(2)
    result = merged.rename(columns={"reaction": "dominant_reaction"})
    result = result.sort_values(["reaction_ratio", "user_id"], ascending=[False, True])
    return result[["user_id", "dominant_reaction", "reaction_ratio"]]`

const sqlLines = code.map(entry => entry.text)
const pythonLines = python.split('\n')

function lineOf(lines, fragment) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`No line contains "${fragment}"`)
  return index + 1
}

const COLUMNS_ALL = ['user_id', 'content_id', 'reaction']
const COLUMNS_SUMMARY = ['user_id', 'total', 'dominant_reaction', 'top_n']
const COLUMNS_KEPT = ['user_id', 'dominant_reaction', 'reaction_ratio']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.reactions)) throw new Error('Use an object with a reactions list.')
  if (input.reactions.length > 60) throw new Error('Keep at most 60 reaction rows.')
  const seen = new Set()
  for (const row of input.reactions) {
    if (!Number.isInteger(row.user_id) || !Number.isInteger(row.content_id)) throw new Error('user_id and content_id are integers.')
    if (typeof row.reaction !== 'string' || row.reaction.length === 0) throw new Error('reaction is non-empty text.')
    const key = `${row.user_id}:${row.content_id}`
    if (seen.has(key)) throw new Error('Each user and content pair appears once.')
    seen.add(key)
  }
  return input
}

export function buildTrace(input) {
  const rows = input.reactions
  const frames = []
  const push = (phase, sql, py, message, columns, tableRows) => frames.push({
    phase,
    activeLine: lineOf(sqlLines, sql),
    pythonLine: lineOf(pythonLines, py),
    message,
    table: { columns, rows: tableRows },
  })

  push('load', 'FROM reactions', 'def emotionally', `Load ${rows.length} reaction rows.`, COLUMNS_ALL, rows)

  const byUser = new Map()
  for (const row of rows) {
    if (!byUser.has(row.user_id)) byUser.set(row.user_id, new Map())
    const reactions = byUser.get(row.user_id)
    reactions.set(row.reaction, (reactions.get(row.reaction) || 0) + 1)
  }

  const summary = []
  for (const user of [...byUser.keys()].sort((a, b) => a - b)) {
    const reactions = byUser.get(user)
    const total = [...reactions.values()].reduce((sum, n) => sum + n, 0)
    const [reaction, top] = [...reactions.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0]
    summary.push({ user_id: user, total, dominant_reaction: reaction, top_n: top })
    push('group', 'GROUP BY user_id, reaction', 'counts = reactions', `User ${user}: ${total} reactions, most common ${reaction} with ${top}.`, COLUMNS_SUMMARY, [...summary])
  }

  const kept = []
  for (const entry of summary) {
    const enough = entry.total >= 5
    const share = entry.top_n * 5 >= entry.total * 3
    const ok = enough && share
    if (ok) kept.push({ user_id: entry.user_id, dominant_reaction: entry.dominant_reaction, reaction_ratio: Math.round((entry.top_n * 100) / entry.total) / 100 })
    const why = !enough ? `only ${entry.total} items` : share ? `${entry.top_n} of ${entry.total} reaches 60 percent` : `${entry.top_n} of ${entry.total} is under 60 percent`
    push('filter', 'WHERE t.total >= 5', 'merged = merged[(merged', `User ${entry.user_id} ${ok ? 'kept' : 'dropped'}: ${why}.`, COLUMNS_KEPT, [...kept])
  }

  const result = [...kept].sort((a, b) => b.reaction_ratio - a.reaction_ratio || a.user_id - b.user_id)
  push('order', 'ORDER BY reaction_ratio DESC', 'result = result.sort_values', 'Sort by ratio descending, then by user ascending.', COLUMNS_KEPT, result)
  push('done', 'SELECT c.user_id', 'return result[', 'The result rows are ready.', COLUMNS_KEPT, result)

  return { input, result, frames }
}

const rowsFor = (user_id, reaction, contents) => contents.map(content_id => ({ user_id, content_id, reaction }))

export const sampleInput = {
  reactions: [
    ...rowsFor(7, 'like', [1, 2, 3, 4]), ...rowsFor(7, 'love', [5]),
    ...rowsFor(9, 'love', [1, 2, 3, 4, 5]),
    ...rowsFor(5, 'angry', [1, 2, 3, 4, 5, 6]), ...rowsFor(5, 'wow', [7, 8, 9, 10]),
    ...rowsFor(3, 'like', [1, 2, 3]), ...rowsFor(3, 'dislike', [4, 5, 6]),
    ...rowsFor(2, 'like', [1, 2, 3, 4]),
  ],
}

export const sampleText = JSON.stringify(sampleInput)
