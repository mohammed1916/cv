// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `WITH legs AS (
  SELECT caller_id AS user_id, recipient_id AS other_id, call_time FROM Calls
  UNION ALL
  SELECT recipient_id, caller_id, call_time FROM Calls
),
ranked AS (
  SELECT user_id, other_id, DATE(call_time) AS call_day,
         ROW_NUMBER() OVER (PARTITION BY user_id, DATE(call_time) ORDER BY call_time) AS first_rank,
         ROW_NUMBER() OVER (PARTITION BY user_id, DATE(call_time) ORDER BY call_time DESC) AS last_rank
  FROM legs
),
ends AS (
  SELECT user_id, call_day,
         MAX(CASE WHEN first_rank = 1 THEN other_id END) AS first_other,
         MAX(CASE WHEN last_rank = 1 THEN other_id END) AS last_other
  FROM ranked
  GROUP BY user_id, call_day
)
SELECT DISTINCT user_id
FROM ends
WHERE first_other = last_other
ORDER BY user_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def first_last_same_day(calls):
    legs = pd.concat([
        calls.rename(columns={"caller_id": "user_id", "recipient_id": "other_id"}),
        calls.rename(columns={"recipient_id": "user_id", "caller_id": "other_id"}),
    ])
    legs["call_day"] = legs["call_time"].str[:10]
    legs = legs.sort_values(["user_id", "call_day", "call_time"])
    ends = legs.groupby(["user_id", "call_day"])["other_id"].agg(first_other="first", last_other="last")
    same = ends[ends["first_other"] == ends["last_other"]]
    return [{"user_id": u} for u in sorted(same.index.get_level_values("user_id").unique())]`
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
  { id: 'legs', label: 'Both sides', description: 'Each call is a row for the caller and a row for the recipient.' },
  { id: 'group', label: 'Day groups', description: 'For each user and day, note the first and last counterpart.' },
  { id: 'match', label: 'Match', description: 'Keep the groups whose first and last counterpart agree.' },
  { id: 'done', label: 'Result', description: 'Output each qualifying user once.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.Calls)) throw new Error('Use an object with a Calls array.')
  if (input.Calls.length < 1 || input.Calls.length > 12) throw new Error('Calls needs 1 to 12 rows.')
  return {
    Calls: input.Calls.map(row => {
      if (!row || typeof row !== 'object' || !('caller_id' in row) || !('recipient_id' in row) || !('call_time' in row)) {
        throw new Error('Calls rows need caller_id, recipient_id and call_time.')
      }
      return { caller_id: row.caller_id, recipient_id: row.recipient_id, call_time: String(row.call_time) }
    }),
  }
}

export function buildTrace(input) {
  const calls = input.Calls
  const legs = []
  for (const call of calls) {
    legs.push({ user_id: call.caller_id, other_id: call.recipient_id, call_time: call.call_time })
    legs.push({ user_id: call.recipient_id, other_id: call.caller_id, call_time: call.call_time })
  }
  legs.sort((a, b) => a.user_id - b.user_id || (a.call_time < b.call_time ? -1 : a.call_time > b.call_time ? 1 : 0))
  const frames = []
  frames.push(frame('legs', 'UNION ALL', 'legs = pd.concat', 'Each call becomes one row for each of its two people.', ['user_id', 'other_id', 'call_time'], legs))

  const groups = new Map()
  for (const leg of legs) {
    const day = leg.call_time.slice(0, 10)
    const key = `${leg.user_id}|${day}`
    if (!groups.has(key)) groups.set(key, { user_id: leg.user_id, call_day: day, first: leg.other_id, last: leg.other_id })
    groups.get(key).last = leg.other_id
  }
  const summary = []
  const qualifying = new Set()
  for (const group of groups.values()) {
    const same = group.first === group.last
    summary.push({ user_id: group.user_id, call_day: group.call_day, first_other: group.first, last_other: group.last, same: same ? 'yes' : 'no' })
    if (same) qualifying.add(group.user_id)
    frames.push(frame('group', 'GROUP BY', 'ends =', `User ${group.user_id} on ${group.call_day}: first call with ${group.first}, last call with ${group.last}.`, ['user_id', 'call_day', 'first_other', 'last_other', 'same'], summary))
  }

  frames.push(frame('match', 'first_other = last_other', 'same =', `${qualifying.size} user${qualifying.size === 1 ? '' : 's'} had a matching first and last call on some day.`, ['user_id', 'call_day', 'first_other', 'last_other', 'same'], summary))
  const result = [...qualifying].sort((a, b) => a - b).map(user_id => ({ user_id }))
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} user${result.length === 1 ? '' : 's'}, each once.`, ['user_id'], result))
  return { input, result, frames }
}
