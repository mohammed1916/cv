const FIRST = '2024-02-01'
const LAST = '2024-02-28'
const MAX_ROWS = 24

const isRealDate = text => {
  if (typeof text !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(text)) return false
  const parsed = new Date(`${text}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === text
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with posts.')
  const { posts } = input
  if (!Array.isArray(posts) || posts.length > MAX_ROWS) throw new Error(`posts has 0 to ${MAX_ROWS} rows.`)
  const seen = new Set()
  for (const row of posts) {
    if (!Array.isArray(row) || row.length !== 3) throw new Error('Each row is [post_id, user_id, post_date].')
    const [postId, userId, date] = row
    if (!Number.isInteger(postId) || !Number.isInteger(userId)) throw new Error('post_id and user_id are integers.')
    if (seen.has(postId)) throw new Error(`post_id ${postId} appears twice, but it is the primary key.`)
    seen.add(postId)
    if (!isRealDate(date)) throw new Error(`${date} is not a real YYYY-MM-DD date.`)
  }
  return { posts }
}

export const sql = `WITH february AS (
    SELECT user_id, post_date
    FROM Posts
    WHERE post_date BETWEEN '2024-02-01' AND '2024-02-28'
), windows AS (
    SELECT user_id,
           COUNT(*) OVER (PARTITION BY user_id ORDER BY post_date
                          RANGE BETWEEN CURRENT ROW AND INTERVAL 6 DAY FOLLOWING) AS in_window,
           COUNT(*) OVER (PARTITION BY user_id) / 4 AS weekly
    FROM february
)
SELECT user_id, MAX(in_window) AS max_7day_posts, ROUND(MAX(weekly), 4) AS avg_weekly_posts
FROM windows
GROUP BY user_id
HAVING MAX(in_window) >= 2 * MAX(weekly)
ORDER BY user_id`

export const code = `find users with a bursty week in February 2024
  keep only posts dated 1 to 28 February
  group what is left by user
  for each user in id order
    average per week is their post count divided by 4
    for each day that user posted
      count their posts in the 7 days starting that day
      keep the largest count as their peak
    if the peak is at least twice the average then report the user
  return the reported users`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Pseudocode line missing: ${key}`)
  return index + 1
}

export const python = `from datetime import date, timedelta

def find_bursty_behavior(posts):
    first, last = date(2024, 2, 1), date(2024, 2, 28)
    days = {}
    for post_id, user_id, post_date in posts:
        posted = date.fromisoformat(post_date)
        if first <= posted <= last:
            days.setdefault(user_id, []).append(posted)
    result = []
    for user_id in sorted(days):
        average = len(days[user_id]) / 4
        peak = 0
        for start in sorted(set(days[user_id])):
            end = start + timedelta(days=6)
            count = sum(start <= day <= end for day in days[user_id])
            peak = max(peak, count)
        if peak >= 2 * average:
            result.append({"user_id": user_id, "max_7day_posts": peak, "avg_weekly_posts": f"{average:.4f}"})
    return result
`
const PY_LINES = python.split('\n')
const P = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Python line missing: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the Posts table.' },
  { id: 'filter', label: 'February', description: 'Keep dates from 1 to 28 February.' },
  { id: 'group', label: 'Group', description: 'Put each user on their own calendar row.' },
  { id: 'average', label: 'Average', description: 'Posts divided by four weeks.' },
  { id: 'window', label: 'Window', description: 'Slide a 7-day window across the posting days.' },
  { id: 'decide', label: 'Decide', description: 'Compare the peak with twice the average.' },
  { id: 'done', label: 'Result', description: 'Report the qualifying users in order.' },
]

export const inputLabel = 'Object with posts, each row [post_id, user_id, post_date]'
export const complexity = 'O(p²) in the worst case when each of a user\'s p February posts starts a window; sorted dates with a window function bring this to O(p log p). The input box takes up to 24 rows.'
export const examples = [
  { label: 'Mixed users', input: JSON.stringify({ posts: [
    [11, 7, '2024-02-03'], [12, 9, '2024-02-02'], [13, 7, '2024-02-05'], [14, 7, '2024-02-06'], [15, 9, '2024-02-10'],
    [16, 7, '2024-02-20'], [17, 9, '2024-02-18'], [18, 9, '2024-02-26'], [19, 12, '2024-02-13'], [20, 12, '2024-03-02'],
  ] }) },
  { label: 'Exactly at the bar', input: JSON.stringify({ posts: [
    [1, 4, '2024-02-01'], [2, 4, '2024-02-04'], [3, 4, '2024-02-07'], [4, 4, '2024-02-12'], [5, 4, '2024-02-19'], [6, 4, '2024-02-27'],
  ] }) },
  { label: 'Outside the window of dates', input: JSON.stringify({ posts: [
    [1, 2, '2024-01-31'], [2, 2, '2024-02-29'], [3, 3, '2024-03-01'], [4, 5, '2024-02-28'], [5, 5, '2024-02-29'],
  ] }) },
  { label: 'Nobody qualifies', input: JSON.stringify({ posts: [
    [1, 8, '2024-02-02'], [2, 8, '2024-02-11'], [3, 8, '2024-02-20'], [4, 8, '2024-02-28'],
  ] }) },
  { label: "Single post", input: "{\"posts\":[[1,1,\"2024-02-03\"]]}" },
  { label: "Same day, different users", input: "{\"posts\":[[1,1,\"2024-02-10\"],[2,2,\"2024-02-10\"],[3,1,\"2024-02-10\"]]}" },
  { label: "No posts", input: "{\"posts\":[]}" },
  { label: "Longest allowed: 24 posts", input: "{\"posts\":[[1,1,\"2024-02-01\"],[2,2,\"2024-02-02\"],[3,3,\"2024-02-03\"],[4,4,\"2024-02-04\"],[5,1,\"2024-02-05\"],[6,2,\"2024-02-06\"],[7,3,\"2024-02-07\"],[8,4,\"2024-02-08\"],[9,1,\"2024-02-09\"],[10,2,\"2024-02-10\"],[11,3,\"2024-02-11\"],[12,4,\"2024-02-12\"],[13,1,\"2024-02-13\"],[14,2,\"2024-02-14\"],[15,3,\"2024-02-15\"],[16,4,\"2024-02-16\"],[17,1,\"2024-02-17\"],[18,2,\"2024-02-18\"],[19,3,\"2024-02-19\"],[20,4,\"2024-02-20\"],[21,1,\"2024-02-21\"],[22,2,\"2024-02-22\"],[23,3,\"2024-02-23\"],[24,4,\"2024-02-24\"]]}" },
  { label: "Long run: 24 posts", input: "{\"posts\":[[1000,8,\"2024-02-12\"],[1001,6,\"2024-02-06\"],[1002,3,\"2024-02-24\"],[1003,9,\"2024-02-22\"],[1004,8,\"2024-02-04\"],[1005,1,\"2024-02-26\"],[1006,4,\"2024-02-24\"],[1007,8,\"2024-02-06\"],[1008,8,\"2024-02-16\"],[1009,2,\"2024-02-26\"],[1010,4,\"2024-02-20\"],[1011,8,\"2024-02-06\"],[1012,4,\"2024-02-04\"],[1013,3,\"2024-02-22\"],[1014,1,\"2024-02-16\"],[1015,3,\"2024-02-26\"],[1016,3,\"2024-02-16\"],[1017,6,\"2024-02-18\"],[1018,9,\"2024-02-20\"],[1019,8,\"2024-02-06\"],[1020,1,\"2024-02-16\"],[1021,8,\"2024-02-10\"],[1022,2,\"2024-02-20\"],[1023,4,\"2024-02-02\"]]}" },
]

const dayOf = date => Number(date.slice(8, 10))
const inFebruary = date => date >= FIRST && date <= LAST

export function buildTrace({ posts }) {
  const rows = posts.map(([post_id, user_id, post_date]) => ({ post_id, user_id, post_date, kept: inFebruary(post_date) }))
  const groups = new Map()
  for (const row of rows) {
    if (!row.kept) continue
    if (!groups.has(row.user_id)) groups.set(row.user_id, [])
    groups.get(row.user_id).push(dayOf(row.post_date))
  }
  const userIds = [...groups.keys()].sort((a, b) => a - b)
  const stats = userIds.map(user_id => ({ user_id, days: [...groups.get(user_id)].sort((a, b) => a - b), count: groups.get(user_id).length, average: null, peak: null, verdict: null }))
  const result = []
  const frames = []
  const push = (phase, key, pyKey, message, extra = {}) => frames.push({
    phase, activeLine: L(key), pythonLine: P(pyKey), message,
    stats: stats.map(entry => ({ ...entry })), output: result.map(row => ({ ...row })),
    filtered: phase !== 'load', grouped: !['load', 'filter'].includes(phase), user: null, window: null, activeRow: -1, ...extra,
  })

  push('load', 'find users', 'def find_bursty', `Posts has ${rows.length} row${rows.length === 1 ? '' : 's'}. Nothing is filtered yet.`)
  const dropped = rows.filter(row => !row.kept).length
  push('filter', 'keep only posts', 'first <= posted', dropped
    ? `${dropped} row${dropped === 1 ? '' : 's'} fall outside 1 to 28 February and are ignored. ${rows.length - dropped} remain.`
    : `All ${rows.length} rows fall inside 1 to 28 February.`)
  push('group', 'group what is left', 'setdefault', stats.length
    ? `${stats.length} user${stats.length === 1 ? ' has' : 's have'} February posts; each gets a calendar row.`
    : 'No user has a post in the range, so there is nothing to examine.')

  stats.forEach(entry => {
    const { user_id, days, count } = entry
    entry.average = count / 4
    push('average', 'average per week', 'average = len', `User ${user_id}: ${count} post${count === 1 ? '' : 's'} ÷ 4 weeks = ${entry.average.toFixed(4)} per week. The bar is twice that: ${entry.average * 2}.`, { user: user_id })
    entry.peak = 0
    for (const start of [...new Set(days)]) {
      const end = start + 6
      const inside = days.filter(day => day >= start && day <= end).length
      const previous = entry.peak
      entry.peak = Math.max(previous, inside)
      push('window', 'count their posts', 'count = sum', `User ${user_id}: the 7 days from 2/${start} hold ${inside} post${inside === 1 ? '' : 's'}${inside > previous ? `, a new peak (was ${previous})` : `, not above the peak of ${previous}`}.`, { user: user_id, window: { start, end, inside } })
    }
    const need = entry.average * 2
    entry.verdict = entry.peak >= need
    if (entry.verdict) result.push({ user_id, max_7day_posts: entry.peak, avg_weekly_posts: entry.average.toFixed(4) })
    push('decide', 'if the peak', entry.verdict ? 'result.append' : 'if peak >=', `User ${user_id}: peak ${entry.peak} ${entry.verdict ? '≥' : '<'} ${need}, so ${entry.verdict ? 'the user is bursty' : 'the user is not reported'}.`, { user: user_id })
  })

  push('done', 'return the reported', 'return result', result.length
    ? `Report ${result.length} user${result.length === 1 ? '' : 's'}: ${result.map(row => row.user_id).join(', ')}.`
    : 'No user reached their bar, so the result is empty.')
  return { input: { posts }, rows, result, frames }
}
