// Teaching model. The SQL, pandas code, sample rows and wording were written for this visualizer.
const SQL = `WITH daily AS (
  SELECT DISTINCT user_id, day, song_id
  FROM Listens
), shared_by_day AS (
  SELECT a.user_id, b.user_id AS other_id, a.day, COUNT(DISTINCT a.song_id) AS common_songs
  FROM daily a
  JOIN daily b ON b.day = a.day AND b.song_id = a.song_id AND b.user_id > a.user_id
  GROUP BY a.user_id, b.user_id, a.day
), candidates AS (
  SELECT DISTINCT user_id, other_id
  FROM shared_by_day
  WHERE common_songs >= 3
), fresh AS (
  SELECT c.user_id, c.other_id
  FROM candidates c
  WHERE NOT EXISTS (
    SELECT 1 FROM Friendship f
    WHERE (f.user1_id = c.user_id AND f.user2_id = c.other_id)
       OR (f.user1_id = c.other_id AND f.user2_id = c.user_id)
  )
), directed AS (
  SELECT user_id, other_id AS recommended_id FROM fresh
  UNION ALL
  SELECT other_id, user_id FROM fresh
)
SELECT user_id, recommended_id
FROM directed
ORDER BY user_id, recommended_id`

export const code = SQL.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def leetcodify_friends(listens, friendship):
    daily = listens[["user_id", "day", "song_id"]].drop_duplicates()
    m = daily.merge(daily, on=["day", "song_id"], suffixes=("", "_o"))
    m = m[m["user_id"] < m["user_id_o"]]
    shared = m.groupby(["user_id", "user_id_o", "day"])["song_id"].nunique().reset_index(name="common_songs")
    candidates = shared[shared["common_songs"] >= 3][["user_id", "user_id_o"]].drop_duplicates()
    friends = set(frozenset(p) for p in zip(friendship["user1_id"], friendship["user2_id"]))
    keep = [frozenset(p) not in friends for p in zip(candidates["user_id"], candidates["user_id_o"])]
    fresh = candidates[keep]
    both = pd.concat([
        fresh.rename(columns={"user_id_o": "recommended_id"}),
        fresh.rename(columns={"user_id": "recommended_id", "user_id_o": "user_id"}),
    ])
    return both[["user_id", "recommended_id"]].sort_values(["user_id", "recommended_id"])`

const sqlLines = code.map(entry => entry.text)
const pythonLines = python.split('\n')

function lineOf(lines, fragment) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`No line contains "${fragment}"`)
  return index + 1
}

const COLUMNS_LISTENS = ['user_id', 'song_id', 'day']
const COLUMNS_SHARED = ['user_id', 'other_id', 'day', 'common_songs']
const COLUMNS_FILTER = ['user_id', 'other_id']
const COLUMNS_RESULT = ['user_id', 'recommended_id']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Listens) || !Array.isArray(input.Friendship)) throw new Error('Use an object with Listens and Friendship lists.')
  if (input.Listens.length > 60 || input.Friendship.length > 30) throw new Error('Keep at most 60 listen rows and 30 friendships.')
  const seen = new Set()
  for (const row of input.Listens) {
    if (!Number.isInteger(row.user_id) || !Number.isInteger(row.song_id)) throw new Error('user_id and song_id are integers.')
    if (typeof row.day !== 'string' || row.day.length === 0) throw new Error('day is non-empty text.')
    const key = `${row.user_id}:${row.song_id}:${row.day}`
    if (seen.has(key)) throw new Error('Each user, song and day appears once.')
    seen.add(key)
  }
  for (const row of input.Friendship) {
    if (!Number.isInteger(row.user1_id) || !Number.isInteger(row.user2_id) || row.user1_id === row.user2_id) throw new Error('Friendship needs two different integer ids.')
  }
  return input
}

export function buildTrace(input) {
  const frames = []
  const push = (phase, sql, py, message, columns, tableRows) => frames.push({
    phase,
    activeLine: lineOf(sqlLines, sql),
    pythonLine: lineOf(pythonLines, py),
    message,
    table: { columns, rows: tableRows },
  })

  push('load', 'FROM Listens', 'daily = listens', `Load ${input.Listens.length} listen rows.`, COLUMNS_LISTENS, input.Listens)

  // For each day and song, the set of users who listened; then pairs of users on that day.
  const pairSongs = new Map()
  const byDaySong = new Map()
  for (const row of input.Listens) {
    const key = `${row.day}|${row.song_id}`
    if (!byDaySong.has(key)) byDaySong.set(key, new Set())
    byDaySong.get(key).add(row.user_id)
  }
  for (const [key, users] of byDaySong) {
    const [day, song] = key.split('|')
    const list = [...users].sort((a, b) => a - b)
    for (let i = 0; i < list.length; i += 1) {
      for (let j = i + 1; j < list.length; j += 1) {
        const pairKey = `${list[i]}|${list[j]}|${day}`
        if (!pairSongs.has(pairKey)) pairSongs.set(pairKey, { user_id: list[i], other_id: list[j], day, songs: new Set() })
        pairSongs.get(pairKey).songs.add(song)
      }
    }
  }

  const shared = [...pairSongs.values()]
    .map(entry => ({ user_id: entry.user_id, other_id: entry.other_id, day: entry.day, common_songs: entry.songs.size }))
    .sort((a, b) => a.user_id - b.user_id || a.other_id - b.other_id || (a.day < b.day ? -1 : a.day > b.day ? 1 : 0))
  const sharedSoFar = []
  for (const row of shared) {
    sharedSoFar.push(row)
    push('pair', 'JOIN daily b', 'm = daily.merge', `Users ${row.user_id} and ${row.other_id} share ${row.common_songs} song${row.common_songs === 1 ? '' : 's'} on ${row.day}.`, COLUMNS_SHARED, sharedSoFar.map(item => ({ ...item })))
  }

  const candidates = []
  const seenCandidate = new Set()
  for (const row of shared) {
    if (row.common_songs < 3) continue
    const key = `${row.user_id}|${row.other_id}`
    if (seenCandidate.has(key)) continue
    seenCandidate.add(key)
    candidates.push({ user_id: row.user_id, other_id: row.other_id })
  }

  const friendKey = (a, b) => [a, b].sort((x, y) => x - y).join('|')
  const friends = new Set(input.Friendship.map(row => friendKey(row.user1_id, row.user2_id)))
  const fresh = []
  for (const row of candidates) {
    const isFriend = friends.has(friendKey(row.user_id, row.other_id))
    if (!isFriend) fresh.push(row)
    push('filter', 'WHERE (f.user1_id', 'keep = [frozenset', `Users ${row.user_id} and ${row.other_id} ${isFriend ? 'are already friends, so they are dropped' : 'qualify and are not friends'}.`, COLUMNS_FILTER, fresh.map(item => ({ ...item })))
  }

  const directed = []
  for (const row of fresh) {
    directed.push({ user_id: row.user_id, recommended_id: row.other_id })
    directed.push({ user_id: row.other_id, recommended_id: row.user_id })
  }
  push('direction', 'UNION ALL', 'both = pd.concat', 'Each qualifying pair is recommended in both directions.', COLUMNS_RESULT, directed.map(item => ({ ...item })))

  const result = [...directed].sort((a, b) => a.user_id - b.user_id || a.recommended_id - b.recommended_id)
  push('done', 'ORDER BY user_id, recommended_id', 'return both[', 'Recommendations are ordered by user, then recommended user.', COLUMNS_RESULT, result.map(item => ({ ...item })))

  return { input, result, frames }
}

export const sampleInput = {
  Listens: [
    { user_id: 1, song_id: 10, day: 'd1' }, { user_id: 1, song_id: 11, day: 'd1' }, { user_id: 1, song_id: 12, day: 'd1' }, { user_id: 1, song_id: 13, day: 'd2' },
    { user_id: 2, song_id: 10, day: 'd1' }, { user_id: 2, song_id: 11, day: 'd1' }, { user_id: 2, song_id: 12, day: 'd1' },
    { user_id: 3, song_id: 10, day: 'd1' }, { user_id: 3, song_id: 11, day: 'd2' }, { user_id: 3, song_id: 12, day: 'd2' }, { user_id: 3, song_id: 13, day: 'd2' },
    { user_id: 4, song_id: 20, day: 'd3' }, { user_id: 4, song_id: 21, day: 'd3' }, { user_id: 4, song_id: 22, day: 'd3' },
    { user_id: 5, song_id: 20, day: 'd3' }, { user_id: 5, song_id: 21, day: 'd3' }, { user_id: 5, song_id: 22, day: 'd3' },
    { user_id: 6, song_id: 30, day: 'd1' }, { user_id: 6, song_id: 31, day: 'd1' }, { user_id: 6, song_id: 32, day: 'd2' },
    { user_id: 7, song_id: 30, day: 'd1' }, { user_id: 7, song_id: 31, day: 'd2' }, { user_id: 7, song_id: 32, day: 'd2' },
  ],
  Friendship: [{ user1_id: 4, user2_id: 5 }],
}

export const sampleText = JSON.stringify(sampleInput)
