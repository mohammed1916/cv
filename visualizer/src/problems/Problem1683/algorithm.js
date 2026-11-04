// Teaching version of the query. The sample table is invented for this visualization.
export const sql = `SELECT tweet_id
FROM Tweets
WHERE CHAR_LENGTH(content) > 15
ORDER BY tweet_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = { select: 1, from: 2, where: 3, order: 4 }

export const python = `def invalid_tweets(tweets):
    kept = []
    for row in tweets:
        if len(row["content"]) > 15:
            kept.append(row["tweet_id"])
    return sorted(kept)
`
const PY = { def: 1, loop: 3, test: 4, keep: 5, done: 6 }

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the tweet rows; nothing is filtered yet.' },
  { id: 'measure', label: 'Measure', description: 'Count the characters in the content of the current row.' },
  { id: 'keep', label: 'Keep', description: 'The content is longer than fifteen characters, so the id is kept.' },
  { id: 'skip', label: 'Skip', description: 'The content has at most fifteen characters, so the row is dropped.' },
  { id: 'done', label: 'Result', description: 'Sort the kept ids to make the output order fixed.' },
]

export const inputLabel = 'Object with a Tweets table (JSON)'
export const complexity = 'O(n) over the tweet rows plus a sort of the kept ids. The visualizer caps the table at 12 rows.'
export const examples = [
  {
    label: 'Sample',
    input: '{"Tweets":[{"tweet_id":1,"content":"Hello world"},{"tweet_id":2,"content":"Learning graphs"},{"tweet_id":3,"content":"Dynamic programming"},{"tweet_id":4,"content":"Two words"},{"tweet_id":5,"content":"Segment tree lazy"}]}',
  },
  {
    label: 'Boundary',
    input: '{"Tweets":[{"tweet_id":10,"content":"abcdefghijklmno"},{"tweet_id":11,"content":"abcdefghijklmnop"},{"tweet_id":12,"content":"short"}]}',
  },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.Tweets)) throw new Error('Use an object with a Tweets list, such as {"Tweets": [{"tweet_id": 1, "content": "hi"}]}.')
  const rows = input.Tweets
  if (rows.length < 1 || rows.length > 12) throw new Error('Tweets needs 1 to 12 rows.')
  const ids = new Set()
  for (const row of rows) {
    if (!row || !Number.isInteger(row.tweet_id) || row.tweet_id < 1) throw new Error('Each row needs a positive integer tweet_id.')
    if (typeof row.content !== 'string' || row.content.length > 40) throw new Error('Each content must be text of at most 40 characters.')
    if (ids.has(row.tweet_id)) throw new Error('tweet_id values must be unique.')
    ids.add(row.tweet_id)
  }
  return rows.map(row => ({ tweet_id: row.tweet_id, content: row.content }))
}

export function buildTrace(rows) {
  const frames = []
  const kept = []
  const statusByRow = {}
  const COLUMNS = ['tweet_id', 'content', 'length', 'status']
  // Rows up to `current` have been measured; rows after it are still waiting.
  const view = current => rows.map((row, i) => ({
    tweet_id: row.tweet_id,
    content: row.content,
    length: i <= current ? row.content.length : null,
    status: statusByRow[i] ?? (i === current ? 'checking' : 'waiting'),
  }))
  const push = (phase, sqlKey, pyKey, current, message) => frames.push({
    phase, activeLine: SQL[sqlKey], pythonLine: PY[pyKey], message, current,
    columns: COLUMNS, rows: view(current), kept: [...kept],
  })
  push('load', 'from', 'def', -1, `Read ${rows.length} tweet row${rows.length === 1 ? '' : 's'}. The filter runs on each row's content.`)
  rows.forEach((row, index) => {
    const length = row.content.length
    push('measure', 'where', 'test', index, `Row ${row.tweet_id} has ${length} characters. ${length > 15 ? 'That is more than fifteen.' : 'That is not more than fifteen.'}`)
    if (length > 15) {
      kept.push(row.tweet_id)
      statusByRow[index] = 'kept'
      push('keep', 'select', 'keep', index, `Keep tweet ${row.tweet_id}.`)
    } else {
      statusByRow[index] = 'dropped'
      push('skip', 'where', 'test', index, `Drop tweet ${row.tweet_id}. It is not longer than fifteen characters.`)
    }
  })
  const output = [...kept].sort((a, b) => a - b)
  frames.push({
    phase: 'done', activeLine: SQL.order, pythonLine: PY.done, current: rows.length,
    columns: COLUMNS, rows: view(rows.length), kept: output,
    message: `Output ${output.length ? output.join(', ') : 'no ids'} in ascending order.`,
  })
  return { input: rows, result: output, frames }
}
