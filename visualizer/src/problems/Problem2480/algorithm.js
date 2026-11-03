// Knowledge-derived teaching model. The sample table is invented for this visualization.
// Teaching rule: a bond pairs one Metal with one Nonmetal whose electron counts add up to 8.
// The output aliases (metal, nonmetal) are teaching choices to verify against the official statement.

export function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}

export const sql = `SELECT m.symbol AS metal, n.symbol AS nonmetal
FROM Elements m
JOIN Elements n
  ON m.type = 'Metal'
 AND n.type = 'Nonmetal'
 AND m.electrons + n.electrons = 8
ORDER BY metal, nonmetal`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def chemical_bonds(elements):
    metals = elements[elements["type"] == "Metal"]
    nonmetals = elements[elements["type"] == "Nonmetal"]
    pairs = metals.merge(nonmetals, how="cross", suffixes=("_m", "_n"))
    pairs = pairs[pairs["electrons_m"] + pairs["electrons_n"] == 8]
    result = pairs.rename(columns={"symbol_m": "metal", "symbol_n": "nonmetal"})[["metal", "nonmetal"]]
    return result.sort_values(["metal", "nonmetal"]).reset_index(drop=True)`
const pyLines = python.split('\n')
const sqlLn = text => lineOf(sqlLines, text)
const pyLn = text => lineOf(pyLines, text)

export const phases = [
  { id: 'load', label: 'Elements', description: 'Read the element rows.' },
  { id: 'split', label: 'Split', description: 'Separate the metals from the nonmetals.' },
  { id: 'pair', label: 'Pair', description: 'Check each metal and nonmetal pair.' },
  { id: 'done', label: 'Result', description: 'Output the pairs that form a bond.' },
]

const ELEMENT_COLS = ['symbol', 'type', 'electrons']
const PAIR_COLS = ['metal', 'nonmetal', 'electron_sum', 'check']
const RESULT_COLS = ['metal', 'nonmetal']
const TYPES = ['Metal', 'Nonmetal', 'Metalloid']

function frameAt(phase, sqlText, pyText, message, columns, rows) {
  return { phase, activeLine: sqlLn(sqlText), pythonLine: pyLn(pyText), message, columns, rows: rows.map(row => ({ ...row })) }
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.elements)) {
    throw new Error('Use a JSON object with an elements list.')
  }
  if (input.elements.length > 14) throw new Error('elements must have at most 14 rows.')
  input.elements.forEach((row, index) => {
    for (const column of ELEMENT_COLS) if (!(column in row)) throw new Error(`elements row ${index + 1} needs ${column}.`)
    if (typeof row.symbol !== 'string' || !/^[A-Z][a-z]?$/.test(row.symbol)) throw new Error(`elements row ${index + 1} symbol must be a chemical symbol.`)
    if (!TYPES.includes(row.type)) throw new Error(`elements row ${index + 1} type must be Metal, Nonmetal or Metalloid.`)
    if (!Number.isInteger(row.electrons) || row.electrons < 0 || row.electrons > 8) throw new Error(`elements row ${index + 1} electrons must be 0 to 8.`)
  })
  return input
}

export function buildTrace(input) {
  const elements = input.elements
  const frames = [frameAt('load', 'FROM Elements m', 'def chemical_bonds', `Load ${elements.length} elements.`, ELEMENT_COLS, elements)]

  const metals = elements.filter(row => row.type === 'Metal')
  const nonmetals = elements.filter(row => row.type === 'Nonmetal')
  frames.push(frameAt('split', "m.type = 'Metal'", 'metals = elements', `${metals.length} metals and ${nonmetals.length} nonmetals.`, ELEMENT_COLS, [...metals, ...nonmetals]))

  const candidates = []
  for (const metal of metals) {
    for (const nonmetal of nonmetals) {
      const electron_sum = metal.electrons + nonmetal.electrons
      const check = electron_sum === 8 ? 'bond' : 'no bond'
      candidates.push({ metal: metal.symbol, nonmetal: nonmetal.symbol, electron_sum, check })
      frames.push(frameAt('pair', 'm.electrons + n.electrons = 8', 'pairs = pairs[', `${metal.symbol} with ${nonmetal.symbol}: ${electron_sum} electrons, ${check}.`, PAIR_COLS, candidates))
    }
  }

  const result = candidates
    .filter(row => row.check === 'bond')
    .map(({ metal, nonmetal }) => ({ metal, nonmetal }))
    .sort((a, b) => (a.metal < b.metal ? -1 : a.metal > b.metal ? 1 : a.nonmetal < b.nonmetal ? -1 : a.nonmetal > b.nonmetal ? 1 : 0))
  frames.push(frameAt('done', 'ORDER BY metal, nonmetal', 'return result', 'Output the metal and nonmetal pairs that form a bond.', RESULT_COLS, result))
  return { input, result, frames }
}
