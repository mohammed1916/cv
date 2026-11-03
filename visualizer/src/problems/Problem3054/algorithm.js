// Knowledge-derived teaching model. The sample table is invented for this visualization.
export const sql = `SELECT N,
  CASE
    WHEN P IS NULL THEN 'Root'
    WHEN N IN (SELECT P FROM Tree WHERE P IS NOT NULL) THEN 'Inner'
    ELSE 'Leaf'
  END AS type
FROM Tree
ORDER BY N`

export const python = `import pandas as pd

def classify_nodes(tree):
    parents = set(tree["P"].dropna())
    def kind(row):
        if pd.isna(row["P"]):
            return "Root"
        if row["N"] in parents:
            return "Inner"
        return "Leaf"
    out = tree.assign(type=tree.apply(kind, axis=1))
    return out[["N", "type"]].sort_values("N")`

const sqlLines = sql.split('\n')
const pyLines = python.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))

function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frame = (phase, sqlText, pyText, message, columns, rows) => ({
  phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read each node and its parent.' },
  { id: 'parents', label: 'Parents', description: 'Collect the ids that appear as a parent.' },
  { id: 'classify', label: 'Classify', description: 'Label each node Root, Inner or Leaf.' },
  { id: 'order', label: 'Order', description: 'Sort by node id.' },
  { id: 'done', label: 'Result', description: 'Output the node types.' },
]

const COLS = ['N', 'P']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.Tree)) throw new Error('Use an object with a Tree list.')
  if (input.Tree.length < 1 || input.Tree.length > 15) throw new Error('Tree has 1 to 15 rows.')
  const ids = new Set()
  for (const row of input.Tree) {
    if (!Number.isInteger(row?.N) || !(row.P === null || Number.isInteger(row.P))) throw new Error('Each row needs an integer N and an integer or null P.')
    if (ids.has(row.N)) throw new Error('N values must be unique.')
    ids.add(row.N)
  }
  return { Tree: input.Tree.map(row => ({ N: row.N, P: row.P })) }
}

export function buildTrace(input) {
  const tree = input.Tree
  const frames = [frame('load', 'SELECT N,', 'def classify_nodes', `Load ${tree.length} nodes with their parent.`, COLS, tree)]
  const parents = new Set(tree.filter(row => row.P !== null).map(row => row.P))
  const parentList = [...parents].sort((a, b) => a - b).join(', ') || 'none'
  frames.push(frame('parents', 'WHEN N IN', 'parents = set', `Ids used as a parent: ${parentList}.`, COLS, tree))
  const classified = []
  for (const row of tree) {
    const type = row.P === null ? 'Root' : parents.has(row.N) ? 'Inner' : 'Leaf'
    classified.push({ N: row.N, type })
    const [sqlText, pyText] = type === 'Root'
      ? ['WHEN P IS NULL', 'if pd.isna']
      : type === 'Inner' ? ['WHEN N IN', 'if row["N"] in parents'] : ['ELSE', 'return "Leaf"']
    frames.push(frame('classify', sqlText, pyText, `Node ${row.N} is ${type}.`, ['N', 'type'], classified))
  }
  const result = [...classified].sort((a, b) => a.N - b.N)
  frames.push(frame('order', 'ORDER BY N', 'return out', 'Sort the output by node id.', ['N', 'type'], result))
  frames.push(frame('done', 'END AS type', 'return out', 'Output each node with its type.', ['N', 'type'], result))
  return { input, result, frames }
}
