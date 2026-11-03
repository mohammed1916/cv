export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.rows) || input.rows.length > 6) {
    throw new Error('Use an object with rows, a list of at most 6 flat objects.')
  }
  for (const row of input.rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error('Each row must be an object.')
    for (const value of Object.values(row)) {
      if (!['string', 'number', 'boolean'].includes(typeof value)) throw new Error('Values must be strings, numbers or booleans.')
    }
  }
  return { rows: input.rows }
}

export const code = `collect the keys of all objects in order of first appearance
  this list is the header row
for each object, read its value under each header key
  a missing key leaves the cell empty
return the header row followed by the value rows`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ rows }) {
  const frames = []
  const header = []
  frames.push({ phase: 'collect', activeLine: L('collect the keys'), header: [], matrix: [], message: 'Collect keys as they first appear.' })
  rows.forEach((row, index) => {
    for (const key of Object.keys(row)) if (!header.includes(key)) header.push(key)
    frames.push({ phase: 'collect', activeLine: L('collect the keys'), header: [...header], matrix: [], message: `Object ${index + 1} adds keys: ${Object.keys(row).join(', ') || 'none'}.` })
  })
  const matrix = [header]
  rows.forEach((row, index) => {
    const line = header.map(key => (key in row ? row[key] : ''))
    matrix.push(line)
    frames.push({ phase: 'fill', activeLine: L('for each object'), header: [...header], matrix: matrix.map(r => [...r]), message: `Row ${index + 1} is filled; missing keys stay empty.` })
  })
  frames.push({ phase: 'done', activeLine: L('return the header'), header: [...header], matrix: matrix.map(r => [...r]), message: 'The matrix is complete.' })
  return { input: { rows }, result: matrix, frames }
}
