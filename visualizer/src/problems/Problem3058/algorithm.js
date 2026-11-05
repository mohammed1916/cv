// Teaching teaching model. The sample table is invented for this visualization.
// Friendships are undirected: each pair is normalized to (smaller id, larger id) and duplicates are removed.
export const sql = `WITH pairs AS (
  SELECT DISTINCT
    CASE WHEN user_id1 < user_id2 THEN user_id1 ELSE user_id2 END AS u,
    CASE WHEN user_id1 < user_id2 THEN user_id2 ELSE user_id1 END AS v
  FROM Friends
),
edges AS (
  SELECT u AS a, v AS b FROM pairs
  UNION ALL
  SELECT v AS a, u AS b FROM pairs
)
SELECT p.u AS user1, p.v AS user2
FROM pairs p
WHERE NOT EXISTS (
  SELECT 1
  FROM edges e1
  JOIN edges e2 ON e2.a = p.v AND e2.b = e1.b
  WHERE e1.a = p.u
)
ORDER BY user1, user2`

export const python = `import pandas as pd

def no_mutual_friends(friends):
    low = friends[["user_id1", "user_id2"]].min(axis=1)
    high = friends[["user_id1", "user_id2"]].max(axis=1)
    pairs = pd.DataFrame({"user1": low, "user2": high}).drop_duplicates()
    neighbors = {}
    for a, b in pairs.itertuples(index=False):
        neighbors.setdefault(a, set()).add(b)
        neighbors.setdefault(b, set()).add(a)
    keep = [(a, b) for a, b in pairs.itertuples(index=False) if not (neighbors[a] & neighbors[b])]
    return pd.DataFrame(keep, columns=["user1", "user2"]).sort_values(["user1", "user2"])`

const sqlLines = sql.split('\n')
const pyLines = python.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))

function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frame = (phase, sqlText, pyText, message, columns, rows) => ({
  phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the friendship rows.' },
  { id: 'normalize', label: 'Normalize', description: 'Put the smaller id first in each pair.' },
  { id: 'dedupe', label: 'Dedupe', description: 'Keep one row per friendship.' },
  { id: 'check', label: 'Check', description: 'Look for a common friend of each pair.' },
  { id: 'order', label: 'Order', description: 'Sort the pairs.' },
  { id: 'done', label: 'Result', description: 'Output the pairs with no common friend.' },
]

const RAW_COLS = ['user_id1', 'user_id2']
const PAIR_COLS = ['user1', 'user2']
const CHECK_COLS = ['user1', 'user2', 'common']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.Friends)) throw new Error('Use an object with a Friends list.')
  if (input.Friends.length < 1 || input.Friends.length > 20) throw new Error('Friends has 1 to 20 rows.')
  for (const row of input.Friends) {
    if (!Number.isInteger(row?.user_id1) || !Number.isInteger(row.user_id2)) throw new Error('Each row needs integer user_id1 and user_id2.')
    if (row.user_id1 === row.user_id2) throw new Error('A user cannot be a friend of themselves.')
  }
  return { Friends: input.Friends.map(row => ({ user_id1: row.user_id1, user_id2: row.user_id2 })) }
}

export function buildTrace(input) {
  const friends = input.Friends
  const frames = [frame('load', 'FROM Friends', 'def no_mutual_friends', `Load ${friends.length} friendship rows.`, RAW_COLS, friends)]
  const normalized = friends.map(row => ({
    user1: Math.min(row.user_id1, row.user_id2), user2: Math.max(row.user_id1, row.user_id2),
  }))
  frames.push(frame('normalize', 'CASE WHEN user_id1 < user_id2', 'low = friends', 'Each pair now lists the smaller id first.', PAIR_COLS, normalized))
  const seen = new Set()
  const pairs = []
  for (const row of normalized) {
    const key = `${row.user1}-${row.user2}`
    if (!seen.has(key)) { seen.add(key); pairs.push(row) }
  }
  frames.push(frame('dedupe', 'SELECT DISTINCT', 'pairs = pd.DataFrame', `${pairs.length} distinct friendships remain.`, PAIR_COLS, pairs))
  const neighbors = new Map()
  const link = (a, b) => neighbors.set(a, new Set([...(neighbors.get(a) || []), b]))
  for (const { user1, user2 } of pairs) { link(user1, user2); link(user2, user1) }
  const checked = []
  for (const { user1, user2 } of pairs) {
    const common = [...(neighbors.get(user1) || [])].filter(id => (neighbors.get(user2) || new Set()).has(id)).sort((a, b) => a - b)
    const label = common.length ? String(common[0]) : 'none'
    checked.push({ user1, user2, common: label })
    const message = common.length
      ? `${user1} and ${user2} share friend ${common[0]}, so they are dropped.`
      : `${user1} and ${user2} share no friend, so they are kept.`
    frames.push(frame('check', 'WHERE NOT EXISTS', 'keep = [(a, b)', message, CHECK_COLS, checked))
  }
  const keep = checked.filter(row => row.common === 'none').map(({ user1, user2 }) => ({ user1, user2 }))
  const result = [...keep].sort((a, b) => a.user1 - b.user1 || a.user2 - b.user2)
  frames.push(frame('order', 'ORDER BY user1, user2', 'return pd.DataFrame', 'Sort the kept pairs.', PAIR_COLS, result))
  frames.push(frame('done', 'SELECT p.u AS user1', 'return pd.DataFrame', 'Output the pairs with no common friend.', PAIR_COLS, result))
  return { input, result, frames }
}
