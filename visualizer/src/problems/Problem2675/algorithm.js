// Dotted paths flatten nested objects and arrays; columns are sorted lexicographically, as the statement asks.
export const code = `function jsonToMatrix(arr) {
  const rows = arr.map(item => flatten(item)); // flatten each item into dotted paths
  const columns = [...new Set(rows.flatMap(row => Object.keys(row)))].sort(); // columns in lexicographic order
  return [columns, ...rows.map(row => columns.map(key => (key in row ? row[key] : '')))]; // missing cells are empty
}

function flatten(value, prefix = '', out = {}) {
  if (value !== null && typeof value === 'object') { // nested object or array
    for (const key of Object.keys(value)) flatten(value[key], prefix ? \`\${prefix}.\${key}\` : key, out);
  } else {
    out[prefix] = value; // a leaf keeps its dotted path
  }
  return out;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def json_to_matrix(arr):
    rows = [flatten(item) for item in arr]
    columns = sorted({key for row in rows for key in row})
    return [columns] + [[row.get(key, "") for key in columns] for row in rows]

def flatten(value, prefix="", out=None):
    if out is None:
        out = {}
    if isinstance(value, dict):
        for key in value:
            flatten(value[key], f"{prefix}.{key}" if prefix else key, out)
    elif isinstance(value, list):
        for i, item in enumerate(value):
            flatten(item, f"{prefix}.{i}" if prefix else str(i), out)
    else:
        out[prefix] = value
    return out`
const pythonLines = python.split('\n')
const PY = s => {
  const found = pythonLines.findIndex(t => t.includes(s))
  if (found < 0) throw new Error(`Missing Python line for "${s}"`)
  return found + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.rows) || input.rows.length > 6) {
    throw new Error('Use an object with rows, a list of at most 6 objects or arrays.')
  }
  const checkLeaves = (value, depth) => {
    if (depth > 4) throw new Error('Nesting is limited to 4 levels in this visualization.')
    if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return
    if (typeof value !== 'object') throw new Error('Values must be strings, numbers, booleans, null, objects or arrays.')
    for (const child of Object.values(value)) checkLeaves(child, depth + 1)
  }
  for (const row of input.rows) {
    if (!row || typeof row !== 'object') throw new Error('Each row must be an object or an array.')
    checkLeaves(row, 0)
  }
  return { rows: input.rows }
}

// Flatten one item into a map from dotted path to leaf value, as the code string describes.
function flatten(value, prefix = '', out = {}) {
  if (value !== null && typeof value === 'object') {
    for (const key of Object.keys(value)) flatten(value[key], prefix ? `${prefix}.${key}` : key, out)
  } else {
    out[prefix] = value
  }
  return out
}

export function buildTrace({ rows }) {
  const frames = []
  const header = []
  const flat = rows.map(item => flatten(item))
  frames.push({ phase: 'collect', activeLine: L('flatten each item'), pythonLine: PY('rows = [flatten'), header: [], matrix: [], message: 'Flatten each item into dotted paths.' })
  flat.forEach((row, index) => {
    for (const key of Object.keys(row)) if (!header.includes(key)) header.push(key)
    const paths = Object.keys(row)
    frames.push({ phase: 'collect', activeLine: L('flatten each item'), pythonLine: PY('rows = [flatten'), header: [...header], matrix: [],
      message: `Item ${index + 1} has paths ${paths.length ? paths.join(', ') : 'none'}.` })
  })
  const sorted = [...header].sort()
  frames.push({ phase: 'sort', activeLine: L('columns in lexicographic order'), pythonLine: PY('columns = sorted'), header: sorted, matrix: [],
    message: `Sort the columns: ${sorted.join(', ') || 'none'}.` })
  const matrix = [sorted]
  flat.forEach((row, index) => {
    matrix.push(sorted.map(key => (key in row ? row[key] : '')))
    frames.push({ phase: 'fill', activeLine: L('missing cells are empty'), pythonLine: PY('return [columns]'), header: sorted, matrix: matrix.map(r => [...r]),
      message: `Row ${index + 1} is filled; a path it lacks stays an empty cell.` })
  })
  frames.push({ phase: 'done', activeLine: L('return [columns'), pythonLine: PY('return [columns]'), header: sorted, matrix: matrix.map(r => [...r]), message: 'The matrix is complete.' })
  return { input: { rows }, result: matrix, frames }
}
