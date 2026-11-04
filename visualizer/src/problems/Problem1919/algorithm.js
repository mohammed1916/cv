// Teaching model. The SQL, pandas code, sample rows and wording were written for this visualizer.
const SQL = `WITH daily AS (
  SELECT DISTINCT user_id, day, song_id
  FROM Listens
), shared_by_day AS (
  SELECT a.user_id, b.user_id AS other_id, a.day, COUNT(DISTINCT a.song_id) AS common_songs
  FROM daily a
  JOIN daily b ON b.day = a.day AND b.song_id = a.song_id AND b.user_id > a.user_id
  GROUP BY a.user_id, b.user_id, a.day
), qualifying AS (
  SELECT DISTINCT user_id, other_id
  FROM shared_by_day
  WHERE common_songs >= 3
), friend_pairs AS (
  SELECT CASE WHEN user1_id < user2_id THEN user1_id ELSE user2_id END AS user1_id,
         CASE WHEN user1_id < user2_id THEN user2_id ELSE user1_id END AS user2_id
  FROM Friendship
)
SELECT DISTINCT f.user1_id, f.user2_id
FROM friend_pairs f
JOIN qualifying q ON q.user_id = f.user1_id AND q.other_id = f.user2_id
ORDER BY f.user1_id, f.user2_id`

export const code = SQL.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def leetcodify_similar_friends(listens, friendship):
    daily = listens[["user_id", "day", "song_id"]].drop_duplicates()
    m = daily.merge(daily, on=["day", "song_id"], suffixes=("", "_o"))
    m = m[m["user_id"] < m["user_id_o"]]
    shared = m.groupby(["user_id", "user_id_o", "day"])["song_id"].nunique().reset_index(name="common_songs")
    qualifying = shared[shared["common_songs"] >= 3][["user_id", "user_id_o"]].drop_duplicates()
    low = friendship[["user1_id", "user2_id"]].min(axis=1)
    high = friendship[["user1_id", "user2_id"]].max(axis=1)
    friends = pd.DataFrame({"user1_id": low, "user2_id": high}).drop_duplicates()
    qualifying = qualifying.rename(columns={"user_id": "user1_id", "user_id_o": "user2_id"})
    result = friends.merge(qualifying, on=["user1_id", "user2_id"])
    return result.sort_values(["user1_id", "user2_id"])`

const sqlLines = code.map(entry => entry.text)
const pythonLines = python.split('\n')

function lineOf(lines, fragment) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`No line contains "${fragment}"`)
  return index + 1
}

const COLUMNS_LISTENS = ['user_id', 'song_id', 'day']
const COLUMNS_SHARED = ['user_id', 'other_id', 'day', 'common_songs']
const COLUMNS_FRIENDS = ['user1_id', 'user2_id']

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

  const byDaySong = new Map()
  for (const row of input.Listens) {
    const key = `${row.day}|${row.song_id}`
    if (!byDaySong.has(key)) byDaySong.set(key, new Set())
    byDaySong.get(key).add(row.user_id)
  }
  const pairSongs = new Map()
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

  const qualifying = []
  const seen = new Set()
  for (const row of shared) {
    if (row.common_songs < 3) continue
    const key = `${row.user_id}|${row.other_id}`
    if (seen.has(key)) continue
    seen.add(key)
    qualifying.push({ user_id: row.user_id, other_id: row.other_id })
  }
  push('filter', 'WHERE common_songs >= 3', 'qualifying = shared[', `${qualifying.length} pair${qualifying.length === 1 ? '' : 's'} share three songs on some day.`, ['user_id', 'other_id'], qualifying.map(item => ({ ...item })))

  const friendPairs = input.Friendship
    .map(row => ({ user1_id: Math.min(row.user1_id, row.user2_id), user2_id: Math.max(row.user1_id, row.user2_id) }))
    .sort((a, b) => a.user1_id - b.user1_id || a.user2_id - b.user2_id)
  push('friends', 'FROM Friendship', 'friends = pd.DataFrame', `Put ${friendPairs.length} friendships in user1 < user2 order.`, COLUMNS_FRIENDS, friendPairs.map(item => ({ ...item })))

  const friendSet = new Set(friendPairs.map(row => `${row.user1_id}|${row.user2_id}`))
  const result = qualifying
    .filter(row => friendSet.has(`${row.user_id}|${row.other_id}`))
    .map(row => ({ user1_id: row.user_id, user2_id: row.other_id }))
    .sort((a, b) => a.user1_id - b.user1_id || a.user2_id - b.user2_id)
  push('done', 'ORDER BY f.user1_id', 'return result.sort_values', `${result.length} existing friend pair${result.length === 1 ? '' : 's'} qualify.`, COLUMNS_FRIENDS, result.map(item => ({ ...item })))

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
  Friendship: [{ user1_id: 5, user2_id: 4 }, { user1_id: 1, user2_id: 3 }],
}

export const sampleText = JSON.stringify(sampleInput)
