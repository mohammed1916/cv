// Knowledge-derived walkthrough: posts are the rows without a parent; each distinct reply is counted once against its post, and posts with no replies keep zero.
export const phases = [
  { id: 'load', label: 'Rows', description: 'Drop exact duplicate rows first.' },
  { id: 'posts', label: 'Posts', description: 'Rows with no parent are the posts.' },
  { id: 'count', label: 'Replies', description: 'Each distinct reply is counted for its post.' },
  { id: 'done', label: 'Result', description: 'Report every post in id order.' },
]

const SQL_SOURCE = `WITH posts AS (
  SELECT DISTINCT sub_id AS post_id FROM Submissions WHERE parent_id IS NULL
), comments AS (
  SELECT DISTINCT sub_id, parent_id FROM Submissions WHERE parent_id IS NOT NULL
)
SELECT p.post_id, COUNT(c.sub_id) AS number_of_comments
FROM posts p
LEFT JOIN comments c ON c.parent_id = p.post_id
GROUP BY p.post_id
ORDER BY p.post_id;`

const PY_SOURCE = `import pandas as pd

def comments_per_post(submissions):
    rows = submissions.drop_duplicates()
    posts = rows[rows["parent_id"].isna()][["sub_id"]].drop_duplicates()
    posts = posts.rename(columns={"sub_id": "post_id"})
    replies = rows[rows["parent_id"].notna()][["sub_id", "parent_id"]].drop_duplicates()
    counts = replies.groupby("parent_id")["sub_id"].nunique()
    posts["number_of_comments"] = posts["post_id"].map(counts).fillna(0).astype(int)
    return posts.sort_values("post_id").reset_index(drop=True)`

const SQL_LINES = SQL_SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const PY_LINES = PY_SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
export const code = SQL_LINES
export const sql = SQL_SOURCE
export const python = PY_SOURCE

const ROW_COLUMNS = ['sub_id', 'parent_id']
const POST_COLUMNS = ['post_id', 'number_of_comments']
const at = (lines, fragment) => {
  const hit = lines.find(line => line.text.includes(fragment))
  if (!hit) throw new Error(`No line contains "${fragment}"`)
  return hit.line
}
const copy = rows => JSON.parse(JSON.stringify(rows))
const intOrNull = value => value === null || (Number.isInteger(value) && value >= 1 && value <= 999)

export function parseInput(text) {
  const input = JSON.parse(text)
  const rows = input?.submissions
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error('submissions has 1 to 12 rows.')
  const parentOf = new Map()
  for (const row of rows) {
    if (!Number.isInteger(row?.sub_id) || row.sub_id < 1 || row.sub_id > 999 || !intOrNull(row.parent_id)) throw new Error('Each row needs an integer sub_id and a parent_id that is null or an integer.')
    if (parentOf.has(row.sub_id) && parentOf.get(row.sub_id) !== row.parent_id) throw new Error('A sub_id has one parent_id.')
    parentOf.set(row.sub_id, row.parent_id)
  }
  for (const parent of parentOf.values()) {
    if (parent !== null && parentOf.get(parent) !== null) throw new Error('A comment must point at a post, not at another comment.')
  }
  return { submissions: rows.map(row => ({ sub_id: row.sub_id, parent_id: row.parent_id })) }
}

export function buildTrace(input) {
  const { submissions } = input
  const frames = []
  const distinct = []
  const seenRows = new Set()
  for (const row of submissions) {
    const key = `${row.sub_id}|${row.parent_id}`
    if (!seenRows.has(key)) { seenRows.add(key); distinct.push(row) }
  }
  const push = (phase, sqlFragment, pyFragment, message, rows, columns) => frames.push({
    phase, activeLine: at(SQL_LINES, sqlFragment), pythonLine: at(PY_LINES, pyFragment),
    message, columns, rows: copy(rows),
  })
  push('load', 'SELECT DISTINCT sub_id, parent_id', 'rows = submissions.drop_duplicates()', `${submissions.length} rows read; ${distinct.length} remain after removing exact duplicates.`, distinct, ROW_COLUMNS)

  const posts = distinct.filter(row => row.parent_id === null).map(row => ({ post_id: row.sub_id, number_of_comments: 0 }))
  posts.sort((a, b) => a.post_id - b.post_id)
  push('posts', 'SELECT DISTINCT sub_id AS post_id', 'posts = rows[', `${posts.length} posts found; each starts at zero comments.`, posts, POST_COLUMNS)

  const counted = new Set()
  for (const row of distinct) {
    if (row.parent_id === null) continue
    const post = posts.find(entry => entry.post_id === row.parent_id)
    if (!post || counted.has(row.sub_id)) continue
    counted.add(row.sub_id)
    post.number_of_comments += 1
    push('count', 'SELECT DISTINCT sub_id, parent_id', 'replies = rows[', `Reply ${row.sub_id} is counted for post ${post.post_id}.`, posts, POST_COLUMNS)
  }

  push('done', 'ORDER BY p.post_id', 'return posts.sort_values', 'Report every post with its distinct comment count.', posts, POST_COLUMNS)
  return { input, result: copy(posts), columns: POST_COLUMNS, frames }
}
