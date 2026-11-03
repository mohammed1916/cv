// Knowledge-derived draft: the rule is the author's own reading of the table task, not copied from an official statement.
// Rule: for each patient, pair the first positive test with the first later negative test and report the gap in days.
const numbered = list => list.map((text, index) => ({ line: index + 1, text }))
const COLS = ['patient_id', 'patient_name', 'recovery_days']

export const code = numbered([
  'WITH first_positive AS (',
  "  SELECT patient_id, MIN(test_date) AS pos_date FROM covid_tests WHERE result = 'Positive' GROUP BY patient_id",
  ') , first_negative AS (',
  '  SELECT p.patient_id, MIN(t.test_date) AS neg_date',
  '  FROM first_positive p JOIN covid_tests t ON t.patient_id = p.patient_id',
  "  AND t.result = 'Negative' AND t.test_date > p.pos_date",
  '  GROUP BY p.patient_id',
  ')',
  'SELECT pa.patient_id, pa.patient_name, DATEDIFF(n.neg_date, f.pos_date) AS recovery_days',
  'FROM first_negative n JOIN first_positive f USING (patient_id) JOIN patients pa USING (patient_id)',
  'ORDER BY recovery_days, pa.patient_name',
])

export const python = `import pandas as pd
def recovery_gaps(patients, covid_tests):
    tests = covid_tests.copy()
    pos = tests[tests.result == "Positive"].groupby("patient_id").test_date.min()
    neg = tests[tests.result == "Negative"].merge(pos.rename("pos_date").reset_index(), on="patient_id")
    neg = neg[neg.test_date > neg.pos_date].groupby("patient_id").test_date.min().rename("neg_date")
    out = pd.concat([pos.rename("pos_date"), neg], axis=1, join="inner").reset_index()
    out = out.merge(patients, on="patient_id")
    out["recovery_days"] = (pd.to_datetime(out.neg_date) - pd.to_datetime(out.pos_date)).dt.days
    out = out.sort_values(["recovery_days", "patient_name"])
    return out[["patient_id", "patient_name", "recovery_days"]]
`

const pyLines = numbered(python.split('\n'))

export const SAMPLE_TEXT = '{"patients":[{"patient_id":1,"patient_name":"Ana"},{"patient_id":2,"patient_name":"Ben"},{"patient_id":3,"patient_name":"Cleo"}],"covid_tests":[{"test_id":1,"patient_id":1,"test_date":"2024-01-01","result":"Positive"},{"test_id":2,"patient_id":1,"test_date":"2024-01-05","result":"Negative"},{"test_id":3,"patient_id":2,"test_date":"2024-02-01","result":"Negative"},{"test_id":4,"patient_id":2,"test_date":"2024-02-03","result":"Positive"},{"test_id":5,"patient_id":2,"test_date":"2024-02-10","result":"Negative"},{"test_id":6,"patient_id":3,"test_date":"2024-03-01","result":"Positive"}]}'

function lineOf(list, fragment, label) {
  const hit = list.find(row => row.text.includes(fragment))
  if (!hit) throw new Error(`${label} line missing: ${fragment}`)
  return hit.line
}

function frame(phase, sql, py, message, columns, rows) {
  return { phase, activeLine: lineOf(code, sql, 'SQL'), pythonLine: lineOf(pyLines, py, 'Python'), message, columns, rows: rows.map(row => ({ ...row })) }
}

const byDate = (a, b) => (a.test_date < b.test_date ? -1 : a.test_date > b.test_date ? 1 : 0)
const daysBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86400000)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.patients) || !Array.isArray(input.covid_tests)) throw new Error('Use patients and covid_tests lists.')
  for (const t of input.covid_tests) {
    if (!['Positive', 'Negative'].includes(t.result) || !/^\d{4}-\d{2}-\d{2}$/.test(t.test_date)) throw new Error('Each test needs a Positive or Negative result and an ISO date.')
  }
  return input
}

export function buildTrace(input) {
  const { patients, covid_tests: tests } = input
  const names = new Map(patients.map(p => [p.patient_id, p.patient_name]))
  const frames = [frame('load', 'WITH first_positive AS (', 'def recovery_gaps', `Load ${tests.length} dated tests.`, ['test_id', 'patient_id', 'test_date', 'result'], tests)]
  const firstPositive = new Map()
  for (const t of [...tests].sort(byDate)) {
    if (t.result === 'Positive' && !firstPositive.has(t.patient_id)) firstPositive.set(t.patient_id, t.test_date)
  }
  const positives = [...firstPositive].map(([patient_id, pos_date]) => ({ patient_id, pos_date }))
  frames.push(frame('positive', 'MIN(test_date) AS pos_date', 'groupby("patient_id").test_date.min()', 'Earliest positive test for each patient.', ['patient_id', 'pos_date'], positives))
  const found = []
  for (const [patient_id, pos_date] of firstPositive) {
    const who = names.get(patient_id)
    const neg = tests.filter(t => t.patient_id === patient_id && t.result === 'Negative' && t.test_date > pos_date).map(t => t.test_date).sort()[0]
    if (!neg) {
      frames.push(frame('check', 'AND t.test_date > p.pos_date', 'neg.test_date > neg.pos_date', `${who} has no negative test after ${pos_date}.`, COLS, found))
      continue
    }
    found.push({ patient_id, patient_name: who, recovery_days: daysBetween(pos_date, neg) })
    frames.push(frame('pair', 'DATEDIFF(n.neg_date, f.pos_date)', 'recovery_days', `${who}: ${pos_date} to ${neg} is ${found.at(-1).recovery_days} days.`, COLS, found))
  }
  const rows = [...found].sort((a, b) => a.recovery_days - b.recovery_days || a.patient_name.localeCompare(b.patient_name))
  frames.push(frame('order', 'ORDER BY recovery_days', 'sort_values', 'Sort by gap, then by name.', COLS, rows))
  frames.push(frame('done', 'SELECT pa.patient_id', 'return out[["patient_id"', `Result has ${rows.length} row(s).`, COLS, rows))
  return { input: { patients, covid_tests: tests }, result: rows, frames }
}
