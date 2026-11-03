// Knowledge-derived SQL walkthrough. The sample terms and spelling rules are invented for this visualization.
export const sql = `WITH Shown AS (
  SELECT power, factor FROM Terms WHERE factor <> 0
)
SELECT CONCAT(
         COALESCE(GROUP_CONCAT(
           CONCAT(
             CASE WHEN factor < 0 THEN '-'
                  WHEN power < (SELECT MAX(power) FROM Shown) THEN '+'
                  ELSE '' END,
             CASE WHEN ABS(factor) = 1 AND power > 0 THEN '' ELSE ABS(factor) END,
             CASE WHEN power = 0 THEN ''
                  WHEN power = 1 THEN 'X'
                  ELSE CONCAT('X^', power) END
           )
           ORDER BY power DESC SEPARATOR ''), '0'),
         '=0') AS equation
FROM Shown`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def build_equation(terms):
    shown = terms[terms["factor"] != 0].sort_values("power", ascending=False)
    if shown.empty:
        return "0=0"
    top = shown["power"].max()
    parts = []
    for row in shown.itertuples():
        sign = "-" if row.factor < 0 else ("+" if row.power < top else "")
        coef = "" if abs(row.factor) == 1 and row.power > 0 else str(abs(row.factor))
        x = "" if row.power == 0 else ("X" if row.power == 1 else f"X^{row.power}")
        parts.append(sign + coef + x)
    return "".join(parts) + "=0"`
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
  { id: 'load', label: 'Load', description: 'Read the polynomial terms.' },
  { id: 'filter', label: 'Filter', description: 'Drop terms whose factor is zero.' },
  { id: 'terms', label: 'Terms', description: 'Write each term from the highest power down.' },
  { id: 'done', label: 'Equation', description: 'Join the pieces and append =0.' },
]

function tableRows(input) {
  const rows = input.Terms
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error('Terms needs 1 to 12 rows.')
  const seen = new Set()
  return rows.map(row => {
    if (!row || typeof row !== 'object' || !('power' in row) || !('factor' in row)) throw new Error('Terms rows need power and factor.')
    if (!Number.isInteger(row.power) || row.power < 0 || !Number.isInteger(row.factor)) throw new Error('power must be a whole number of 0 or more and factor a whole number.')
    if (seen.has(row.power)) throw new Error('Powers must be distinct in this variant.')
    seen.add(row.power)
    return { power: row.power, factor: row.factor }
  })
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Terms table.')
  return { Terms: tableRows(input) }
}

function piece(factor, power, top) {
  const sign = factor < 0 ? '-' : power < top ? '+' : ''
  const coef = Math.abs(factor) === 1 && power > 0 ? '' : String(Math.abs(factor))
  const x = power === 0 ? '' : power === 1 ? 'X' : `X^${power}`
  return sign + coef + x
}

export function buildTrace(input) {
  const { Terms } = input
  const cols = ['power', 'factor']
  const frames = [frame('load', 'WITH Shown', 'def build_equation', 'Read the term rows.', cols, Terms)]
  const shown = Terms.filter(row => row.factor !== 0).sort((a, b) => b.power - a.power)
  frames.push(frame('filter', 'WHERE factor', 'shown = terms', `Keep ${shown.length} nonzero term${shown.length === 1 ? '' : 's'}; the rest are dropped.`, cols, shown))
  const top = shown.length ? shown[0].power : 0
  const pieces = []
  for (const row of shown) {
    const text = piece(row.factor, row.power, top)
    pieces.push({ power: row.power, factor: row.factor, piece: text })
    frames.push(frame('terms', "CONCAT('X^'", 'sign = ', `Power ${row.power} with factor ${row.factor} is written as "${text}".`, ['power', 'factor', 'piece'], pieces))
  }
  const equation = `${pieces.map(item => item.piece).join('') || '0'}=0`
  const result = [{ equation }]
  frames.push(frame('done', 'AS equation', 'return "".join', `Join the pieces: ${equation}.`, ['equation'], result))
  return { input, result, frames }
}
