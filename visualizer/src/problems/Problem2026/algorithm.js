// SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `WITH rated AS (
  SELECT problem_id, likes * 100.0 / (likes + dislikes) AS like_pct
  FROM Problems
  WHERE likes + dislikes > 0
)
SELECT problem_id
FROM rated
WHERE like_pct < 60
ORDER BY problem_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def low_quality_problems(problems):
    total = problems["likes"] + problems["dislikes"]
    rated = problems[total > 0].assign(like_pct=lambda d: d["likes"] * 100.0 / (d["likes"] + d["dislikes"]))
    kept = rated[rated["like_pct"] < 60].sort_values("problem_id")
    return [{"problem_id": p} for p in kept["problem_id"]]`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'rate', label: 'Rate', description: 'Work out the like percentage for each problem with votes.' },
  { id: 'done', label: 'Result', description: 'Keep the problems strictly below 60 percent, sorted by id.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.Problems)) throw new Error('Use an object with a Problems array.')
  if (input.Problems.length < 1 || input.Problems.length > 12) throw new Error('Problems needs 1 to 12 rows.')
  return {
    Problems: input.Problems.map(row => {
      if (!row || typeof row !== 'object' || !('problem_id' in row) || !('likes' in row) || !('dislikes' in row)) {
        throw new Error('Problems rows need problem_id, likes and dislikes.')
      }
      return { problem_id: Number(row.problem_id), likes: Number(row.likes), dislikes: Number(row.dislikes) }
    }),
  }
}

export function buildTrace(input) {
  const rows = input.Problems
  const frames = []
  const summary = []
  const kept = []
  for (const row of rows) {
    const total = row.likes + row.dislikes
    if (total === 0) {
      summary.push({ problem_id: row.problem_id, likes: row.likes, dislikes: row.dislikes, like_pct: 'no votes', keep: 'no' })
      frames.push(frame('rate', 'WHERE likes + dislikes', 'total =', `Problem ${row.problem_id} has no votes, so the percentage is undefined and it is skipped.`, ['problem_id', 'likes', 'dislikes', 'like_pct', 'keep'], summary))
      continue
    }
    const pct = (row.likes * 100) / total
    const ok = pct < 60
    if (ok) kept.push({ problem_id: row.problem_id })
    summary.push({ problem_id: row.problem_id, likes: row.likes, dislikes: row.dislikes, like_pct: pct.toFixed(1), keep: ok ? 'yes' : 'no' })
    frames.push(frame('rate', 'WHERE like_pct', 'rated =', `Problem ${row.problem_id}: ${pct.toFixed(1)} percent liked, ${ok ? 'below' : 'not below'} 60.`, ['problem_id', 'likes', 'dislikes', 'like_pct', 'keep'], summary))
  }
  const result = kept.sort((a, b) => a.problem_id - b.problem_id)
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} problem${result.length === 1 ? '' : 's'} in id order.`, ['problem_id'], result))
  return { input, result, frames }
}
