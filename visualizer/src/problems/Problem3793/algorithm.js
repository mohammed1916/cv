// Knowledge-derived teaching model. The SQL, pandas code, sample rows and wording are written for this visualizer.
const COLUMNS = ['user_id', 'prompt', 'tokens']
const REPORT_COLUMNS = ['user_id', 'prompt_count', 'avg_tokens']

export const sql = `-- users with several prompts and at least one prompt above their own average
WITH stats AS (
  SELECT user_id, COUNT(*) AS prompt_count, AVG(tokens) AS avg_exact, MAX(tokens) AS top_tokens
  FROM prompts GROUP BY user_id
)
SELECT user_id, prompt_count, ROUND(avg_exact, 2) AS avg_tokens
FROM stats
WHERE prompt_count >= 3 AND top_tokens > avg_exact
ORDER BY avg_tokens DESC, user_id ASC;`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def high_token_users(prompts):
    g = prompts.groupby('user_id')['tokens']
    stats = g.agg(prompt_count='count', avg_exact='mean', top_tokens='max').reset_index()
    keep = stats[(stats['prompt_count'] >= 3) & (stats['top_tokens'] > stats['avg_exact'])].copy()
    keep['avg_tokens'] = keep['avg_exact'].round(2)
    keep = keep.sort_values(['avg_tokens', 'user_id'], ascending=[False, True])
    return keep[['user_id', 'prompt_count', 'avg_tokens']]
`

const SQL_LINE = text => {
  const hit = code.find(line => line.text.includes(text))
  if (!hit) throw new Error(`Missing SQL line: ${text}`)
  return hit.line
}
const PY_LINE = text => {
  const hit = python.split('\n').findIndex(line => line.includes(text))
  if (hit < 0) throw new Error(`Missing Python line: ${text}`)
  return hit + 1
}

export const phases = [
  { id: 'load', label: 'Load', description: 'The prompt rows as stored.' },
  { id: 'check', label: 'Check users', description: 'Compare each user\'s largest prompt with their exact average.' },
  { id: 'sort', label: 'Sort', description: 'Order by rounded average descending, then user id.' },
  { id: 'done', label: 'Output', description: 'The report table.' },
]

export const inputLabel = 'Object with a prompts list (user_id, prompt, tokens)'
export const complexity = 'O(p log p) for p prompt rows. The visualizer caps the table at 40 rows.'
export const examples = [
  {
    label: 'Mixed users',
    input: JSON.stringify({
      prompts: [
        { user_id: 1, prompt: 'intro', tokens: 10 }, { user_id: 1, prompt: 'data', tokens: 20 }, { user_id: 1, prompt: 'tune', tokens: 60 },
        { user_id: 2, prompt: 'a', tokens: 5 }, { user_id: 2, prompt: 'b', tokens: 5 }, { user_id: 2, prompt: 'c', tokens: 5 }, { user_id: 2, prompt: 'd', tokens: 5 },
        { user_id: 3, prompt: 'p1', tokens: 7 }, { user_id: 3, prompt: 'p2', tokens: 8 }, { user_id: 3, prompt: 'p3', tokens: 9 }, { user_id: 3, prompt: 'p4', tokens: 10 },
        { user_id: 4, prompt: 'x', tokens: 100 }, { user_id: 4, prompt: 'y', tokens: 1 },
        { user_id: 5, prompt: 'q1', tokens: 1 }, { user_id: 5, prompt: 'q2', tokens: 2 }, { user_id: 5, prompt: 'q3', tokens: 4 },
        { user_id: 6, prompt: 'r1', tokens: 3 }, { user_id: 6, prompt: 'r2', tokens: 3 }, { user_id: 6, prompt: 'r3', tokens: 4 },
        { user_id: 7, prompt: 's1', tokens: 2 }, { user_id: 7, prompt: 's2', tokens: 4 }, { user_id: 7, prompt: 's3', tokens: 6 },
        { user_id: 9, prompt: 't1', tokens: 1 }, { user_id: 9, prompt: 't2', tokens: 3 }, { user_id: 9, prompt: 't3', tokens: 8 },
      ],
    }),
  },
  {
    label: 'Two users',
    input: JSON.stringify({
      prompts: [
        { user_id: 8, prompt: 'a', tokens: 4 }, { user_id: 8, prompt: 'b', tokens: 6 }, { user_id: 8, prompt: 'c', tokens: 8 },
        { user_id: 3, prompt: 'x', tokens: 9 }, { user_id: 3, prompt: 'y', tokens: 9 }, { user_id: 3, prompt: 'z', tokens: 10 },
      ],
    }),
  },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.prompts)) throw new Error('Use an object with a prompts list.')
  const rows = input.prompts
  if (rows.length < 1 || rows.length > 40) throw new Error('Use 1 to 40 prompt rows.')
  const keys = new Set()
  for (const r of rows) {
    if (!Number.isInteger(r.user_id)) throw new Error('user_id is an integer.')
    if (typeof r.prompt !== 'string' || r.prompt.trim() === '') throw new Error('prompt is non-empty text.')
    if (!Number.isInteger(r.tokens) || r.tokens < 0 || r.tokens > 10000) throw new Error('tokens is an integer from 0 to 10000.')
    const key = `${r.user_id}/${r.prompt}`
    if (keys.has(key)) throw new Error('Each user and prompt pair appears once.')
    keys.add(key)
  }
  return { prompts: rows.map(r => ({ ...r })) }
}

// Average rounded half up to two decimals, using integer arithmetic so no float tie can drift.
const roundTwo = (sum, count) => Math.floor((sum * 200 + count) / (2 * count)) / 100

export function buildTrace(input) {
  const rows = input.prompts
  const frames = []
  const add = (phase, sqlKey, pyKey, message, columns, table) => frames.push({
    phase, activeLine: SQL_LINE(sqlKey), pythonLine: PY_LINE(pyKey), message, columns,
    rows: table.map(row => ({ ...row })),
  })

  add('load', 'FROM prompts', "g = prompts", 'Load every prompt row.', COLUMNS, rows)

  const userIds = [...new Set(rows.map(r => r.user_id))].sort((a, b) => a - b)
  const kept = []
  for (const id of userIds) {
    const mine = rows.filter(r => r.user_id === id)
    const count = mine.length
    const sum = mine.reduce((total, r) => total + r.tokens, 0)
    const top = Math.max(...mine.map(r => r.tokens))
    const avgText = `${sum}/${count}`
    let message
    let ok
    if (count < 3) {
      ok = false
      message = `User ${id} has only ${count} prompt${count === 1 ? '' : 's'}; drop.`
    } else if (top * count > sum) {
      ok = true
      message = `User ${id}: average ${avgText}, top ${top} is above it. Keep.`
    } else {
      ok = false
      message = `User ${id}: average ${avgText}, no prompt is above it. Drop.`
    }
    if (ok) kept.push({ user_id: id, prompt_count: count, avg_tokens: roundTwo(sum, count) })
    add('check', 'WHERE prompt_count', "keep = stats[", message, REPORT_COLUMNS, kept)
  }

  const result = kept
    .map(r => ({ ...r }))
    .sort((a, b) => b.avg_tokens - a.avg_tokens || a.user_id - b.user_id)
  add('sort', 'ORDER BY', "sort_values(['avg_tokens'", 'Order by average descending, then user id ascending.', REPORT_COLUMNS, result)
  add('done', 'ROUND(avg_exact', 'return keep[', `Report ${result.length} user${result.length === 1 ? '' : 's'}.`, REPORT_COLUMNS, result)
  return { input: { prompts: rows }, result, frames }
}
