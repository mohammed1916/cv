// Knowledge-derived teaching variant (not the official statement).
const SQL = `WITH first_trial AS (
  SELECT user_id, MIN(activity_date) AS trial_start
  FROM user_activity WHERE activity_type = 'trial'
  GROUP BY user_id
), converted AS (
  SELECT f.user_id FROM first_trial f
  JOIN user_activity p ON p.user_id = f.user_id
  WHERE p.activity_type = 'paid' AND p.activity_date > f.trial_start
  GROUP BY f.user_id
)
SELECT c.user_id,
  ROUND(AVG(CASE WHEN a.activity_type = 'trial' THEN a.activity_duration END), 2) AS trial_avg,
  ROUND(AVG(CASE WHEN a.activity_type = 'paid' THEN a.activity_duration END), 2) AS paid_avg
FROM converted c
JOIN user_activity a ON a.user_id = c.user_id
GROUP BY c.user_id
ORDER BY c.user_id;`

const PYTHON = `def conversion_report(user_activity):
    trials = user_activity[user_activity.activity_type == 'trial']
    first_trial = trials.groupby('user_id').activity_date.min().rename('trial_start')
    paid = user_activity[user_activity.activity_type == 'paid'].join(first_trial, on='user_id')
    converted = paid[paid.activity_date > paid.trial_start].user_id.unique()
    rows = user_activity[user_activity.user_id.isin(converted)]
    trial_avg = rows[rows.activity_type == 'trial'].groupby('user_id').activity_duration.mean()
    paid_avg = rows[rows.activity_type == 'paid'].groupby('user_id').activity_duration.mean()
    out = pd.DataFrame({'trial_avg': trial_avg, 'paid_avg': paid_avg}).round(2).reset_index()
    return out.sort_values('user_id')`

export const code = SQL.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON
const pyLines = PYTHON.split('\n')

function at(text) {
  const found = code.find(line => line.text.includes(text))
  if (!found) throw new Error(`Missing SQL line: ${text}`)
  return found.line
}

function pyAt(text) {
  const index = pyLines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing Python line: ${text}`)
  return index + 1
}

const round2 = value => Math.round(value * 100) / 100

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.user_activity)) throw new Error('Use an object with a user_activity list.')
  if (input.user_activity.length > 12) throw new Error('Use at most 12 activity rows.')
  for (const row of input.user_activity) {
    if (!Number.isInteger(row.user_id) || typeof row.activity_date !== 'string'
      || !['trial', 'paid'].includes(row.activity_type) || !Number.isInteger(row.activity_duration)) {
      throw new Error('Each row needs an integer user_id, a YYYY-MM-DD activity_date, activity_type trial or paid, and an integer activity_duration.')
    }
  }
  return { user_activity: input.user_activity.map(row => ({ ...row })) }
}

export function buildTrace(input) {
  const all = input.user_activity
  const frames = []
  const step = (phase, sqlKey, pyKey, message, rows, result = []) => frames.push({
    phase, activeLine: at(sqlKey), pythonLine: pyAt(pyKey), message,
    rows: rows.map(row => ({ ...row })), result: result.map(row => ({ ...row })),
  })

  step('load', 'FROM user_activity WHERE activity_type', 'def conversion_report', `Load the ${all.length} activity rows.`, all)

  const firstTrial = {}
  for (const row of all) {
    if (row.activity_type !== 'trial') continue
    if (!(row.user_id in firstTrial) || row.activity_date < firstTrial[row.user_id]) firstTrial[row.user_id] = row.activity_date
  }
  const trialRows = all.filter(row => row.activity_type === 'trial')
  step('trial', 'first_trial AS', 'trials = ', `Each user's first trial date is the earliest trial row.`, trialRows)

  const userIds = [...new Set(all.map(row => row.user_id))]
  const converted = []
  for (const userId of userIds) {
    const own = all.filter(row => row.user_id === userId)
    const start = firstTrial[userId]
    const ok = start !== undefined && own.some(row => row.activity_type === 'paid' && row.activity_date > start)
    if (ok) converted.push(userId)
    step('qualify', 'converted AS', 'converted = ', ok
      ? `User ${userId}: a paid row comes after the first trial ${start}, so the user converted.`
      : `User ${userId}: no paid row comes after the first trial, so the user did not convert.`, own)
  }

  const working = all.filter(row => converted.includes(row.user_id))
  step('qualify', 'JOIN user_activity a', 'rows = user_activity', `Keep the ${working.length} rows of the converted users.`, working)

  const result = []
  const average = (own, type) => {
    const values = own.filter(row => row.activity_type === type).map(row => row.activity_duration)
    return values.length ? round2(values.reduce((sum, value) => sum + value, 0) / values.length) : null
  }
  for (const userId of converted.slice().sort((a, b) => a - b)) {
    const own = working.filter(row => row.user_id === userId)
    const trialAvg = average(own, 'trial')
    const paidAvg = average(own, 'paid')
    result.push({ user_id: userId, trial_avg: trialAvg, paid_avg: paidAvg })
    step('average', 'ROUND(AVG(CASE WHEN a.activity_type', 'trial_avg = ',
      `User ${userId}: trial average ${trialAvg}, paid average ${paidAvg}.`, own, result)
  }

  step('output', 'ORDER BY c.user_id', 'return out.sort_values', `Return ${result.length} rows ordered by user_id.`, working, result)
  return { input: { user_activity: all }, result, frames }
}
