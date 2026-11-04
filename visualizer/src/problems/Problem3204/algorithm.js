// Teaching model. The sample tables are invented for this visualization.
export function snap(rows) {
  return rows.map(row => ({ ...row }))
}

export function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}

export function parseJsonObject(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object whose keys name the tables.')
  return input
}

export function requireRows(input, name, columns, maxRows = 12) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length > maxRows) throw new Error(`${name} must be a list of at most ${maxRows} rows.`)
  rows.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`${name} row ${index + 1} must be an object.`)
    columns.forEach(column => { if (!(column in row)) throw new Error(`${name} row ${index + 1} needs ${column}.`) })
  })
  return rows
}

export const sql = `SELECT BIT_AND(permissions) AS common_permissions,
       BIT_OR(permissions) AS combined_permissions
FROM user_permissions`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def permission_summary(user_permissions):
    values = [int(v) for v in user_permissions["permissions"]]
    common = values[0]
    combined = values[0]
    for value in values[1:]:
        common &= value
        combined |= value
    return pd.DataFrame([{"common_permissions": common, "combined_permissions": combined}])`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read each user’s permission bits.' },
  { id: 'fold', label: 'Fold', description: 'Fold the rows one at a time with AND and OR.' },
  { id: 'done', label: 'Result', description: 'Output the common and combined bits.' },
]

const COLS = ['user_id', 'permissions']
const FOLD_COLS = ['user_id', 'permissions', 'running_and', 'running_or']
const LIMIT = 2 ** 20

export function parseInput(text) {
  const input = parseJsonObject(text)
  const rows = requireRows(input, 'user_permissions', COLS)
  if (rows.length < 1) throw new Error('The table needs at least one user.')
  for (const row of rows) {
    if (!Number.isInteger(row.permissions) || row.permissions < 0 || row.permissions >= LIMIT) throw new Error(`permissions must be an integer from 0 to ${LIMIT - 1}.`)
  }
  return input
}

export function buildTrace(input) {
  const rows = input.user_permissions
  const frames = [frameAt('load', 'SELECT BIT_AND', 'def permission_summary', `Read ${rows.length} users.`, COLS, rows)]
  let common = rows[0].permissions
  let combined = rows[0].permissions
  const folded = []
  rows.forEach((row, index) => {
    if (index > 0) {
      common &= row.permissions
      combined |= row.permissions
    }
    folded.push({ user_id: row.user_id, permissions: row.permissions, running_and: common, running_or: combined })
    const note = index === 0
      ? `Start with ${row.permissions} for user ${row.user_id}.`
      : `Fold in ${row.permissions}: AND gives ${common}, OR gives ${combined}.`
    frames.push(frameAt('fold', 'BIT_AND(permissions)', 'common &= value', note, FOLD_COLS, folded))
  })
  const result = [{ common_permissions: common, combined_permissions: combined }]
  frames.push(frameAt('done', 'FROM user_permissions', 'return pd.DataFrame', 'Output the common bits and the combined bits.', ['common_permissions', 'combined_permissions'], result))
  return { input, result, frames }
}
