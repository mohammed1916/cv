// SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `WITH directed AS (
  SELECT user1_id AS user_id, user2_id AS friend_id FROM Friendship
  UNION
  SELECT user2_id, user1_id FROM Friendship
),
candidates AS (
  SELECT d.user_id, l.page_id, d.friend_id
  FROM directed d
  JOIN Likes l ON l.user_id = d.friend_id
  WHERE NOT EXISTS (
    SELECT 1 FROM Likes own
    WHERE own.user_id = d.user_id AND own.page_id = l.page_id
  )
)
SELECT user_id, page_id, COUNT(DISTINCT friend_id) AS friends_likes
FROM candidates
GROUP BY user_id, page_id
ORDER BY user_id, page_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def page_recommendations(friendship, likes):
    directed = pd.concat([
        friendship.rename(columns={"user1_id": "user_id", "user2_id": "friend_id"}),
        friendship.rename(columns={"user2_id": "user_id", "user1_id": "friend_id"}),
    ])[["user_id", "friend_id"]].drop_duplicates()
    fan_out = directed.merge(likes, left_on="friend_id", right_on="user_id", suffixes=("", "_liked"))
    own = set(zip(likes["user_id"], likes["page_id"]))
    fresh = fan_out[[(u, p) not in own for u, p in zip(fan_out["user_id"], fan_out["page_id"])]]
    counted = fresh.groupby(["user_id", "page_id"])["friend_id"].nunique().reset_index(name="friends_likes")
    return counted.sort_values(["user_id", "page_id"])`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'load', label: 'Friendships', description: 'Read the friendship pairs.' },
  { id: 'directed', label: 'Both ways', description: 'Count each friendship from both users.' },
  { id: 'candidates', label: 'Candidates', description: 'Keep friend-liked pages the user has not liked.' },
  { id: 'count', label: 'Count', description: 'Count distinct friends behind each page.' },
  { id: 'done', label: 'Result', description: 'Return the recommendations.' },
]

const FRIEND_COLUMNS = ['user1_id', 'user2_id']
const DIRECTED_COLUMNS = ['user_id', 'friend_id']
const CANDIDATE_COLUMNS = ['user_id', 'page_id', 'friend_id']
const RESULT_COLUMNS = ['user_id', 'page_id', 'friends_likes']

const frame = (phase, sqlKey, pyKey, message, columns, rows, extra = {}) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })), ...extra,
})

function tableRows(input, name, columns, max = 12) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > max) throw new Error(`${name} needs 1 to ${max} rows.`)
  return rows.map(row => {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
    return Object.fromEntries(columns.map(column => [column, row[column]]))
  })
}

const isInt = (value, min, max) => Number.isInteger(value) && value >= min && value <= max

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Friendship and Likes tables.')
  const Friendship = tableRows(input, 'Friendship', FRIEND_COLUMNS)
  const Likes = tableRows(input, 'Likes', ['user_id', 'page_id'])
  for (const row of Friendship) {
    if (!isInt(row.user1_id, 1, 20) || !isInt(row.user2_id, 1, 20) || row.user1_id === row.user2_id) throw new Error('Friendship rows need two different user ids from 1 to 20.')
  }
  for (const row of Likes) {
    if (!isInt(row.user_id, 1, 20) || !isInt(row.page_id, 1, 99)) throw new Error('Likes rows need user_id 1-20 and page_id 1-99.')
  }
  return { Friendship, Likes }
}

export function buildTrace(input) {
  const { Friendship, Likes } = input
  const frames = [frame('load', 'WITH directed', 'def ', 'Read the friendship pairs.', FRIEND_COLUMNS, Friendship)]

  const directed = []
  for (const row of Friendship) {
    directed.push({ user_id: row.user1_id, friend_id: row.user2_id }, { user_id: row.user2_id, friend_id: row.user1_id })
  }
  directed.sort((a, b) => a.user_id - b.user_id || a.friend_id - b.friend_id)
  frames.push(frame('directed', 'UNION', 'directed = ', 'Each friendship counts from both users.', DIRECTED_COLUMNS, directed))

  const liked = new Set(Likes.map(row => `${row.user_id}:${row.page_id}`))
  const candidates = []
  for (const pair of directed) {
    for (const like of Likes) {
      if (like.user_id !== pair.friend_id) continue
      if (liked.has(`${pair.user_id}:${like.page_id}`)) continue
      candidates.push({ user_id: pair.user_id, page_id: like.page_id, friend_id: pair.friend_id })
    }
  }
  candidates.sort((a, b) => a.user_id - b.user_id || a.page_id - b.page_id || a.friend_id - b.friend_id)
  frames.push(frame('candidates', 'NOT EXISTS', 'fresh = ', `${candidates.length} friend-liked page(s) are new to their user.`, CANDIDATE_COLUMNS, candidates))

  const grouped = new Map()
  for (const row of candidates) {
    const key = `${row.user_id}:${row.page_id}`
    if (!grouped.has(key)) grouped.set(key, { user_id: row.user_id, page_id: row.page_id, friends: new Set() })
    grouped.get(key).friends.add(row.friend_id)
  }
  const counted = [...grouped.values()]
    .map(row => ({ user_id: row.user_id, page_id: row.page_id, friends_likes: row.friends.size }))
    .sort((a, b) => a.user_id - b.user_id || a.page_id - b.page_id)
  frames.push(frame('count', 'COUNT(DISTINCT', 'counted = ', 'Count the distinct friends behind each page.', RESULT_COLUMNS, counted))
  frames.push(frame('done', 'ORDER BY user_id', 'return', 'Return the recommendations.', RESULT_COLUMNS, counted))
  return { input, result: counted, frames }
}
