// Knowledge-derived teaching version. The sample tables are invented for this visualization.
const SQL = `SELECT e.left_operand, e.operator, e.right_operand,
  CASE WHEN e.operator = '<' AND lv.value < rv.value
         OR e.operator = '>' AND lv.value > rv.value
         OR e.operator = '=' AND lv.value = rv.value
       THEN 'true' ELSE 'false' END AS value
FROM Expressions AS e
JOIN Variables AS lv ON lv.name = e.left_operand
JOIN Variables AS rv ON rv.name = e.right_operand`

const PANDAS = `import operator

OPS = {"<": operator.lt, ">": operator.gt, "=": operator.eq}

def evaluate_expressions(variables, expressions):
    value = dict(zip(variables["name"], variables["value"]))
    out = expressions.copy()
    out["value"] = [str(OPS[op](value[l], value[r])).lower()
                    for l, op, r in zip(expressions["left_operand"], expressions["operator"], expressions["right_operand"])]
    return out`

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

const OPERATORS = { '<': (a, b) => a < b, '>': (a, b) => a > b, '=': (a, b) => a === b }

function table(rows, name, keys) {
  if (!Array.isArray(rows) || rows.length > 12) throw new Error(`${name} is a list of at most 12 rows.`)
  return rows.map(row => {
    if (!row || typeof row !== 'object' || keys.some(key => row[key] === undefined)) throw new Error(`${name} rows need ${keys.join(', ')}.`)
    return Object.fromEntries(keys.map(key => [key, row[key]]))
  })
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object') throw new Error('Use an object with Variables and Expressions lists.')
  const Variables = table(input.Variables, 'Variables', ['name', 'value'])
  const Expressions = table(input.Expressions, 'Expressions', ['left_operand', 'operator', 'right_operand'])
  for (const row of Variables) {
    if (!Number.isInteger(row.value) || typeof row.name !== 'string') throw new Error('Each variable needs a name and an integer value.')
  }
  for (const row of Expressions) {
    if (!OPERATORS[row.operator]) throw new Error('Operators are <, > or =.')
  }
  return { Variables, Expressions }
}

export function buildTrace({ Variables, Expressions }) {
  const value = new Map(Variables.map(row => [row.name, row.value]))
  const columns = ['left_operand', 'operator', 'right_operand', 'value']
  const frames = [frame('load', 'FROM Expressions', 'def evaluate_expressions', `Read ${Variables.length} variables into a lookup by name.`, ['name', 'value'], Variables)]
  const out = []
  for (const expression of Expressions) {
    const left = value.get(expression.left_operand)
    const right = value.get(expression.right_operand)
    if (left === undefined || right === undefined) throw new Error('Every operand must be a defined variable.')
    frames.push(frame('lookup', 'JOIN Variables AS lv', 'value = dict',
      `Look up ${expression.left_operand} = ${left} and ${expression.right_operand} = ${right}.`, columns, out))
    const holds = OPERATORS[expression.operator](left, right)
    out.push({ ...expression, value: holds ? 'true' : 'false' })
    frames.push(frame('compare', 'CASE WHEN', 'out["value"]',
      `${left} ${expression.operator} ${right} is ${holds ? 'true' : 'false'}.`, columns, out))
  }
  frames.push(frame('done', 'FROM Expressions', 'return out', `Returned ${out.length} evaluated expressions.`, columns, out))
  return { input: { Variables, Expressions }, result: out, frames }
}
