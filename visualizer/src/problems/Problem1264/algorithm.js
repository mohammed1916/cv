// Knowledge-derived walkthrough: collect user 1's friends from both directions of the friendship pairs, then recommend pages those friends like that user 1 has not liked.
export const phases = [
  { id: 'load', label: 'Friendships', description: 'Read each friendship from both directions.' },
  { id: 'friends', label: 'Friends', description: 'Collect the friends of user 1.' },
  { id: 'mine', label: 'Own likes', description: 'Collect the pages user 1 already likes.' },
  { id: 'pages', label: 'Candidates', description: 'Keep friend pages that user 1 does not like.' },
  { id: 'done', label: 'Result', description: 'Report the recommendations.' },
]

const SQL_SOURCE = `WITH friends AS (
  SELECT user2_id AS friend_id FROM Friendship WHERE user1_id = 1
  UNION
  SELECT user1_id FROM Friendship WHERE user2_id = 1
)
SELECT DISTINCT l.page_id AS recommended_page
FROM friends f
JOIN Likes l ON l.user_id = f.friend_id
WHERE l.page_id NOT IN (SELECT page_id FROM Likes WHERE user_id = 1)
ORDER BY recommended_page;`

const PY_SOURCE = `import pandas as pd

def page_recommendations(friendship, likes, user=1):
    pairs = pd.concat([
        friendship[friendship.user1_id == user].user2_id,
        friendship[friendship.user2_id == user].user1_id,
    ])
    friends = set(pairs)
    mine = set(likes[likes.user_id == user].page_id)
    pages = likes[likes.user_id.isin(friends)].page_id
    out = pd.DataFrame({"recommended_page": sorted(set(pages) - mine)})
    return out`

const SQL_LINES = SQL_SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const PY_LINES = PY_SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
export const code = SQL_LINES
export const sql = SQL_SOURCE
export const python = PY_SOURCE

const FRIEND_COLUMNS = ['friend_id']
const PAGE_COLUMNS = ['page_id']
const RESULT_COLUMNS = ['recommended_page']
const USER = 1
const at = (lines, fragment) => {
  const hit = lines.find(line => line.text.includes(fragment))
  if (!hit) throw new Error(`No line contains "${fragment}"`)
  return hit.line
}
const copy = rows => JSON.parse(JSON.stringify(rows))
const idIn = value => Number.isInteger(value) && value >= 1 && value <= 999

export function parseInput(text) {
  const input = JSON.parse(text)
  const { friendship, likes } = input ?? {}
  if (!Array.isArray(friendship) || friendship.length > 12) throw new Error('friendship has at most 12 rows.')
  if (!Array.isArray(likes) || likes.length < 1 || likes.length > 12) throw new Error('likes has 1 to 12 rows.')
  for (const pair of friendship) {
    if (!idIn(pair?.user1_id) || !idIn(pair?.user2_id) || pair.user1_id === pair.user2_id) throw new Error('Each friendship joins two different users.')
  }
  for (const like of likes) {
    if (!idIn(like?.user_id) || !idIn(like?.page_id)) throw new Error('Each like has an integer user_id and page_id.')
  }
  return {
    friendship: friendship.map(pair => ({ user1_id: pair.user1_id, user2_id: pair.user2_id })),
    likes: likes.map(like => ({ user_id: like.user_id, page_id: like.page_id })),
  }
}

export function buildTrace(input) {
  const { friendship, likes } = input
  const frames = []
  const push = (phase, sqlFragment, pyFragment, message, rows, columns) => frames.push({
    phase, activeLine: at(SQL_LINES, sqlFragment), pythonLine: at(PY_LINES, pyFragment),
    message, columns, rows: copy(rows),
  })
  push('load', 'FROM Friendship WHERE user1_id', 'def page_recommendations', `${friendship.length} friendship rows are read in both directions.`, [], FRIEND_COLUMNS)

  const friendIds = new Set()
  for (const pair of friendship) {
    if (pair.user1_id === USER) friendIds.add(pair.user2_id)
    if (pair.user2_id === USER) friendIds.add(pair.user1_id)
  }
  const friends = [...friendIds].sort((a, b) => a - b).map(id => ({ friend_id: id }))
  push('friends', 'UNION', 'friends = set(pairs)', `User ${USER} has ${friends.length} direct friends.`, friends, FRIEND_COLUMNS)

  const mineIds = new Set(likes.filter(like => like.user_id === USER).map(like => like.page_id))
  const mine = [...mineIds].sort((a, b) => a - b).map(id => ({ page_id: id }))
  push('mine', 'WHERE l.page_id NOT IN', 'mine = set(', `User ${USER} already likes ${mine.length} pages; these are excluded.`, mine, PAGE_COLUMNS)

  const candidates = [...new Set(likes.filter(like => friendIds.has(like.user_id) && !mineIds.has(like.page_id)).map(like => like.page_id))]
    .sort((a, b) => a - b)
    .map(id => ({ recommended_page: id }))
  push('pages', 'JOIN Likes l', 'pages = likes', `${candidates.length} distinct candidate pages come from friends.`, candidates, RESULT_COLUMNS)

  push('done', 'ORDER BY recommended_page', 'return out', 'Report each recommended page once, in ascending order.', candidates, RESULT_COLUMNS)
  return { input, result: copy(candidates), columns: RESULT_COLUMNS, frames }
}
