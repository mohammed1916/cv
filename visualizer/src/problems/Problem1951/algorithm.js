// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `WITH pair_counts AS (
  SELECT a.user_id AS user1_id, b.user_id AS user2_id, COUNT(*) AS common
  FROM Relations a
  JOIN Relations b ON a.follower_id = b.follower_id AND a.user_id < b.user_id
  GROUP BY a.user_id, b.user_id
)
SELECT user1_id, user2_id
FROM pair_counts
WHERE common = (SELECT MAX(common) FROM pair_counts)
ORDER BY user1_id, user2_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def max_common_follower_pairs(relations):
    followers = relations.groupby("user_id")["follower_id"].apply(set)
    pairs = {}
    for a, b in combinations(sorted(followers.index), 2):
        common = len(followers[a] & followers[b])
        if common > 0:
            pairs[(a, b)] = common
    best = max(pairs.values(), default=0)
    return [{"user1_id": a, "user2_id": b} for (a, b), c in sorted(pairs.items()) if c == best]`
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
  { id: 'load', label: 'Load', description: 'Read the follow relation.' },
  { id: 'pairs', label: 'Pairs', description: 'Join each pair of users on a shared follower and count.' },
  { id: 'max', label: 'Maximum', description: 'Find the greatest count.' },
  { id: 'done', label: 'Result', description: 'Output every pair tied for the greatest count.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.Relations)) throw new Error('Use an object with a Relations array.')
  if (input.Relations.length < 1 || input.Relations.length > 12) throw new Error('Relations needs 1 to 12 rows.')
  return {
    Relations: input.Relations.map(row => {
      if (!row || typeof row !== 'object' || !('user_id' in row) || !('follower_id' in row)) throw new Error('Relations rows need user_id and follower_id.')
      return { user_id: row.user_id, follower_id: row.follower_id }
    }),
  }
}

export function buildTrace(input) {
  const rows = input.Relations
  const followers = new Map()
  for (const row of rows) {
    if (!followers.has(row.user_id)) followers.set(row.user_id, new Set())
    followers.get(row.user_id).add(row.follower_id)
  }
  const users = [...followers.keys()].sort((a, b) => a - b)
  const frames = []
  frames.push(frame('load', 'FROM Relations a', 'followers =', 'Read the follow relation, one row per user and follower.', ['user_id', 'follower_id'], rows))

  const pairs = []
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const a = users[i]
      const b = users[j]
      const shared = [...followers.get(a)].filter(f => followers.get(b).has(f))
      if (shared.length > 0) pairs.push({ user1_id: a, user2_id: b, common: shared.length })
      frames.push(frame('pairs', 'JOIN Relations b', 'common =', `Users ${a} and ${b} share ${shared.length} follower${shared.length === 1 ? '' : 's'}.`, ['user1_id', 'user2_id', 'common'], pairs))
    }
  }

  const top = pairs.length ? Math.max(...pairs.map(pair => pair.common)) : 0
  frames.push(frame('max', 'WHERE common', 'best =', `The greatest count is ${top}.`, ['user1_id', 'user2_id', 'common'], pairs))
  const result = pairs.filter(pair => pair.common === top).map(pair => ({ user1_id: pair.user1_id, user2_id: pair.user2_id }))
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} pair${result.length === 1 ? '' : 's'}.`, ['user1_id', 'user2_id'], result))
  return { input, result, frames }
}
