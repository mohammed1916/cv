// Knowledge-derived teaching version. The sample tables are invented for this visualization.
const SQL = `SELECT patient_id, patient_name, conditions
FROM Patients
WHERE conditions LIKE 'DIAB1%'
   OR conditions LIKE '% DIAB1%'
ORDER BY patient_id`

const PANDAS = `import pandas as pd

def diabetes_patients(patients):
    codes = patients["conditions"].str.split(" ")
    hit = codes.apply(lambda items: any(item.startswith("DIAB1") for item in items))
    return patients[hit][["patient_id", "patient_name", "conditions"]].sort_values("patient_id")`

const SQL_LINES = SQL.split('\n')
const PY_LINES = PANDAS.split('\n')

function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing line: ${text}`)
  return index + 1
}

export const sql = SQL
export const python = PANDAS
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))

const frame = (phase, sqlText, pyText, message, columns, rows) => ({
  phase,
  activeLine: lineOf(SQL_LINES, sqlText),
  pythonLine: lineOf(PY_LINES, pyText),
  message,
  columns: [...columns],
  rows: rows.map(row => ({ ...row })),
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Patients) || input.Patients.length > 12) throw new Error('Use a Patients list of at most 12 rows.')
  const Patients = input.Patients.map(row => {
    if (!row || !Number.isInteger(row.patient_id) || typeof row.patient_name !== 'string' || typeof row.conditions !== 'string') {
      throw new Error('Each patient needs an integer patient_id, a patient_name and a space-separated conditions text.')
    }
    return { patient_id: row.patient_id, patient_name: row.patient_name, conditions: row.conditions }
  })
  return { Patients }
}

export function buildTrace({ Patients }) {
  const frames = [frame('load', 'FROM Patients', 'def diabetes_patients', `Read ${Patients.length} patients.`, ['patient_id', 'patient_name', 'conditions'], Patients)]
  const sorted = [...Patients].sort((a, b) => a.patient_id - b.patient_id)
  const scanned = []
  const result = []
  for (const patient of sorted) {
    const codes = patient.conditions.split(' ').filter(code => code.length > 0)
    const match = codes.find(code => code.startsWith('DIAB1')) ?? '-'
    scanned.push({ patient_id: patient.patient_id, patient_name: patient.patient_name, conditions: patient.conditions, match })
    if (match !== '-') result.push({ patient_id: patient.patient_id, patient_name: patient.patient_name, conditions: patient.conditions })
    frames.push(frame('scan', 'WHERE conditions LIKE', 'hit = ',
      match === '-' ? `${patient.patient_name} has no code that starts with DIAB1.` : `${patient.patient_name} has ${match}, which starts with DIAB1.`,
      ['patient_id', 'patient_name', 'conditions', 'match'], scanned))
  }
  frames.push(frame('done', 'ORDER BY patient_id', 'return patients', `Returned ${result.length} patients.`, ['patient_id', 'patient_name', 'conditions'], result))
  return { input: { Patients }, result, frames }
}
