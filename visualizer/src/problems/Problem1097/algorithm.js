// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT f.install_dt,
       COUNT(*) AS installs,
       ROUND(SUM(CASE WHEN EXISTS (
         SELECT 1 FROM Activity a
         WHERE a.player_id = f.player_id AND a.event_date = DATE_ADD(f.install_dt, INTERVAL 1 DAY)
       ) THEN 1 ELSE 0 END) / COUNT(*), 2) AS Day1_retention
FROM (SELECT player_id, MIN(event_date) AS install_dt FROM Activity GROUP BY player_id) f
GROUP BY f.install_dt
ORDER BY f.install_dt`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def day_one_retention(activity):
    install = activity.groupby("player_id")["event_date"].min().rename("install_dt")
    active = set(zip(activity["player_id"], activity["event_date"]))
    cohort = install.reset_index()
    cohort["kept"] = [(p, d + pd.Timedelta(days=1)) in active for p, d in zip(cohort["player_id"], cohort["install_dt"])]
    out = cohort.groupby("install_dt").agg(installs=("player_id", "size"), kept=("kept", "sum"))
    out["Day1_retention"] = (out["kept"] / out["installs"]).round(2)
    return out.reset_index()[["install_dt", "installs", "Day1_retention"]].to_dict("records")`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const frame = (phase, sqlKey, pyKey, message, columns, rows, extra = {}) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })), ...extra,
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the daily activity rows.' },
  { id: 'install', label: 'Install', description: 'Find the first activity date of each player.' },
  { id: 'retention', label: 'Next day', description: 'Check whether each player was active the next day.' },
  { id: 'group', label: 'Group', description: 'Count installs and retained players per cohort.' },
  { id: 'done', label: 'Result', description: 'Output one row per install date.' },
]

export const inputLabel = 'Object with an Activity table'
export const complexity = 'O(n) with a set of (player, day) pairs for the next-day check. The visualizer caps the table at 12 rows.'
export const examples = [{
  label: 'Sample',
  input: '{"Activity":[{"player_id":11,"device_id":5,"event_date":"2018-05-10","games_played":4},{"player_id":11,"device_id":5,"event_date":"2018-05-11","games_played":2},{"player_id":12,"device_id":6,"event_date":"2018-05-11","games_played":3},{"player_id":13,"device_id":7,"event_date":"2019-02-28","games_played":1},{"player_id":14,"device_id":8,"event_date":"2018-05-12","games_played":7},{"player_id":14,"device_id":8,"event_date":"2018-05-13","games_played":2}]}',
}, {
  label: 'Single row, no next day',
  input: '{"Activity":[{"player_id":1,"device_id":1,"event_date":"2020-01-01","games_played":5}]}',
}, {
  label: 'Same install date, one retained',
  input: '{"Activity":[{"player_id":1,"device_id":1,"event_date":"2020-06-01","games_played":2},{"player_id":1,"device_id":1,"event_date":"2020-06-02","games_played":4},{"player_id":2,"device_id":2,"event_date":"2020-06-01","games_played":1}]}',
}, {
  label: 'Leap day is the next day',
  input: '{"Activity":[{"player_id":5,"device_id":3,"event_date":"2020-02-28","games_played":6},{"player_id":5,"device_id":3,"event_date":"2020-02-29","games_played":2}]}',
}, {
  label: 'Long run: 12 rows, 4 players',
  input: '{"Activity":[{"player_id":3,"device_id":1,"event_date":"2020-03-03","games_played":4},{"player_id":1,"device_id":1,"event_date":"2020-03-02","games_played":3},{"player_id":1,"device_id":2,"event_date":"2020-03-03","games_played":8},{"player_id":4,"device_id":2,"event_date":"2020-03-03","games_played":0},{"player_id":4,"device_id":3,"event_date":"2020-03-01","games_played":7},{"player_id":4,"device_id":2,"event_date":"2020-03-04","games_played":3},{"player_id":3,"device_id":3,"event_date":"2020-03-05","games_played":5},{"player_id":2,"device_id":2,"event_date":"2020-03-02","games_played":1},{"player_id":3,"device_id":1,"event_date":"2020-03-01","games_played":5},{"player_id":2,"device_id":3,"event_date":"2020-03-04","games_played":1},{"player_id":4,"device_id":1,"event_date":"2020-03-05","games_played":7},{"player_id":2,"device_id":3,"event_date":"2020-03-01","games_played":1}]}',
}]

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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with an Activity table.')
  return { Activity: tableRows(input, 'Activity', ['player_id', 'event_date']) }
}

const nextDay = day => new Date(Date.parse(`${day}T00:00:00Z`) + 86400000).toISOString().slice(0, 10)

export function buildTrace(input) {
  const { Activity } = input
  const frames = []
  frames.push(frame('load', 'FROM (SELECT', 'def ', 'Read the daily activity rows.', ['player_id', 'event_date'], Activity))

  const install = new Map()
  for (const row of Activity) {
    const current = install.get(row.player_id)
    if (current === undefined || row.event_date < current) install.set(row.player_id, row.event_date)
  }
  const installRows = []
  for (const [player, day] of install) {
    installRows.push({ player_id: player, install_dt: day })
    frames.push(frame('install', 'MIN(event_date)', 'install =', `Player ${player} installed on ${day}.`, ['player_id', 'install_dt'], installRows))
  }

  const active = new Set(Activity.map(row => `${row.player_id}|${row.event_date}`))
  const checked = []
  for (const [player, day] of install) {
    const next = nextDay(day)
    const kept = active.has(`${player}|${next}`)
    checked.push({ player_id: player, install_dt: day, next_day: next, kept: kept ? 'yes' : 'no' })
    frames.push(frame('retention', 'EXISTS', 'cohort["kept"]', `Player ${player} ${kept ? 'is' : 'is not'} active on ${next}.`, ['player_id', 'install_dt', 'next_day', 'kept'], checked))
  }

  const cohorts = new Map()
  for (const row of checked) {
    if (!cohorts.has(row.install_dt)) cohorts.set(row.install_dt, { installs: 0, retained: 0 })
    const cohort = cohorts.get(row.install_dt)
    cohort.installs += 1
    if (row.kept === 'yes') cohort.retained += 1
  }
  const summary = []
  const result = []
  for (const day of [...cohorts.keys()].sort()) {
    const { installs, retained } = cohorts.get(day)
    const retention = (Math.round((retained / installs) * 100) / 100).toFixed(2)
    summary.push({ install_dt: day, installs, retained, Day1_retention: retention })
    result.push({ install_dt: day, installs, Day1_retention: retention })
    frames.push(frame('group', 'GROUP BY f.install_dt', 'out =', `Cohort ${day} has ${installs} installs and ${retained} retained.`, ['install_dt', 'installs', 'retained', 'Day1_retention'], summary))
  }
  frames.push(frame('done', 'ORDER BY f.install_dt', 'return', `Return ${result.length} cohort rows.`, ['install_dt', 'installs', 'Day1_retention'], result))
  return { input, result, frames }
}
