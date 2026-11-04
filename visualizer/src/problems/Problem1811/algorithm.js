// SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `WITH medals AS (
  SELECT gold_medal AS user_id, contest_id, 'gold' AS medal FROM Contests
  UNION ALL
  SELECT silver_medal, contest_id, 'silver' FROM Contests
  UNION ALL
  SELECT bronze_medal, contest_id, 'bronze' FROM Contests
),
gold_winners AS (
  SELECT user_id
  FROM medals
  WHERE medal = 'gold'
  GROUP BY user_id
  HAVING COUNT(*) >= 3
),
streak_winners AS (
  SELECT DISTINCT a.user_id
  FROM (SELECT DISTINCT user_id, contest_id FROM medals) a
  JOIN (SELECT DISTINCT user_id, contest_id FROM medals) b
    ON b.user_id = a.user_id AND b.contest_id = a.contest_id + 1
  JOIN (SELECT DISTINCT user_id, contest_id FROM medals) c
    ON c.user_id = a.user_id AND c.contest_id = a.contest_id + 2
)
SELECT u.name, u.mail
FROM Users u
WHERE u.user_id IN (SELECT user_id FROM gold_winners UNION SELECT user_id FROM streak_winners)
ORDER BY u.name`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def interview_candidates(contests, users):
    medals = pd.concat([
        contests[["gold_medal", "contest_id"]].rename(columns={"gold_medal": "user_id"}).assign(medal="gold"),
        contests[["silver_medal", "contest_id"]].rename(columns={"silver_medal": "user_id"}).assign(medal="silver"),
        contests[["bronze_medal", "contest_id"]].rename(columns={"bronze_medal": "user_id"}).assign(medal="bronze"),
    ])
    golds = medals[medals["medal"] == "gold"].groupby("user_id").size()
    streak = set()
    for user_id, group in medals.groupby("user_id"):
        ids = set(group["contest_id"])
        if any({k, k + 1, k + 2} <= ids for k in ids):
            streak.add(user_id)
    winners = users[users["user_id"].isin(streak | set(golds[golds >= 3].index))]
    return winners[["name", "mail"]].sort_values("name")`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const CONTEST_COLUMNS = ['contest_id', 'gold_medal', 'silver_medal', 'bronze_medal']
const USER_COLUMNS = ['user_id', 'mail', 'name']
const MEDAL_COLUMNS = ['user_id', 'contest_id', 'medal']
const CHECK_COLUMNS = ['user_id', 'name', 'gold_count', 'contests', 'qualifies']

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the contest results and the user list.' },
  { id: 'medals', label: 'Medals', description: 'Stack gold, silver and bronze winners into one list.' },
  { id: 'check', label: 'Check', description: 'Test each user for three golds or three consecutive contests.' },
  { id: 'done', label: 'Result', description: 'Output the qualifying users by name.' },
]

export const inputLabel = 'Object with Contests and Users tables'
export const complexity = 'O(M log M) for M medal rows, from grouping per user and sorting each user contest list. The visualizer caps each table at 12 rows.'

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
  }
  return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Contests and Users tables.')
  return { Contests: tableRows(input, 'Contests', CONTEST_COLUMNS), Users: tableRows(input, 'Users', USER_COLUMNS) }
}

export function buildTrace(input) {
  const contests = [...input.Contests].sort((a, b) => a.contest_id - b.contest_id)
  const users = [...input.Users].sort((a, b) => a.user_id - b.user_id)
  const frames = []
  frames.push(frame('load', 'FROM Contests', 'def ', `Load ${contests.length} contests and ${users.length} users.`, CONTEST_COLUMNS, contests))

  const medals = []
  for (const contest of contests) {
    medals.push({ user_id: contest.gold_medal, contest_id: contest.contest_id, medal: 'gold' })
    medals.push({ user_id: contest.silver_medal, contest_id: contest.contest_id, medal: 'silver' })
    medals.push({ user_id: contest.bronze_medal, contest_id: contest.contest_id, medal: 'bronze' })
  }
  frames.push(frame('medals', 'UNION ALL', 'medals =', `Stack the ${medals.length} medal wins into one list.`, MEDAL_COLUMNS, medals))

  const golds = new Map()
  const contestsByUser = new Map()
  for (const medal of medals) {
    if (medal.medal === 'gold') golds.set(medal.user_id, (golds.get(medal.user_id) ?? 0) + 1)
    if (!contestsByUser.has(medal.user_id)) contestsByUser.set(medal.user_id, new Set())
    contestsByUser.get(medal.user_id).add(medal.contest_id)
  }

  const checked = []
  const result = []
  for (const user of users) {
    const ids = contestsByUser.get(user.user_id) ?? new Set()
    const goldCount = golds.get(user.user_id) ?? 0
    const goldOk = goldCount >= 3
    const streak = [...ids].some(k => ids.has(k + 1) && ids.has(k + 2))
    const label = goldOk && streak ? 'both' : goldOk ? 'gold' : streak ? 'streak' : 'no'
    checked.push({ user_id: user.user_id, name: user.name, gold_count: goldCount, contests: [...ids].sort((a, b) => a - b).join(','), qualifies: label })
    if (label !== 'no') result.push({ name: user.name, mail: user.mail })
    frames.push(frame('check', 'c.contest_id = a.contest_id + 2', 'golds =',
      `${user.name}: ${label === 'no' ? 'no qualifying run' : `qualifies (${label})`}.`, CHECK_COLUMNS, checked))
  }
  result.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
  frames.push(frame('done', 'ORDER BY u.name', 'return winners', `Return ${result.length} interview candidates.`, ['name', 'mail'], result))
  return { input, result, frames }
}
