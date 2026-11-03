// Knowledge-derived teaching model. The sample table is invented for this visualization.
// Teaching rule: within each state, keep the policies whose rank times 4 is at most the state's size (the top quarter).
export const sql = `SELECT policy_id, state, fraud_score
FROM (
  SELECT policy_id, state, fraud_score,
         ROW_NUMBER() OVER (PARTITION BY state ORDER BY fraud_score DESC, policy_id) AS rnk,
         COUNT(*) OVER (PARTITION BY state) AS group_size
  FROM Fraud
) ranked
WHERE rnk * 4 <= group_size
ORDER BY state, fraud_score DESC, policy_id`

export const python = `import pandas as pd

def top_quarter_by_state(fraud):
    ranked = fraud.copy()
    ranked["group_size"] = ranked.groupby("state")["policy_id"].transform("count")
    ranked = ranked.sort_values(["state", "fraud_score", "policy_id"], ascending=[True, False, True])
    ranked["rnk"] = ranked.groupby("state").cumcount() + 1
    kept = ranked[ranked["rnk"] * 4 <= ranked["group_size"]]
    return kept[["policy_id", "state", "fraud_score"]].sort_values(["state", "fraud_score", "policy_id"], ascending=[True, False, True])`

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
  { id: 'load', label: 'Load', description: 'Read each policy and its state.' },
  { id: 'rank', label: 'Rank', description: 'Rank the policies inside one state.' },
  { id: 'cut', label: 'Cut', description: 'Keep the top quarter of that state.' },
  { id: 'order', label: 'Order', description: 'Sort the kept policies.' },
  { id: 'done', label: 'Result', description: 'Output the kept policies.' },
]

const COLS = ['policy_id', 'state', 'fraud_score']
const byOutput = (a, b) => (a.state < b.state ? -1 : a.state > b.state ? 1 : b.fraud_score - a.fraud_score || a.policy_id - b.policy_id)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.Fraud)) throw new Error('Use an object with a Fraud list.')
  if (input.Fraud.length < 1 || input.Fraud.length > 16) throw new Error('Fraud has 1 to 16 rows.')
  const ids = new Set()
  for (const row of input.Fraud) {
    if (!Number.isInteger(row?.policy_id) || typeof row.state !== 'string' || !row.state || !Number.isInteger(row.fraud_score)) {
      throw new Error('Each row needs an integer policy_id, a text state and an integer fraud_score.')
    }
    if (ids.has(row.policy_id)) throw new Error('policy_id values must be unique.')
    ids.add(row.policy_id)
  }
  return { Fraud: input.Fraud.map(row => ({ policy_id: row.policy_id, state: row.state, fraud_score: row.fraud_score })) }
}

export function buildTrace(input) {
  const fraud = input.Fraud
  const frames = [frame('load', 'SELECT policy_id, state, fraud_score', 'def top_quarter_by_state', `Load ${fraud.length} policies.`, COLS, fraud)]
  const groups = new Map()
  for (const row of fraud) groups.set(row.state, [...(groups.get(row.state) || []), row])
  const states = [...groups.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  const kept = []
  for (const [state, rows] of states) {
    const sorted = [...rows].sort((x, y) => y.fraud_score - x.fraud_score || x.policy_id - y.policy_id)
    frames.push(frame('rank', 'ROW_NUMBER() OVER', 'ranked = ranked.sort_values', `${state} has ${sorted.length} policies. Rank by score, then policy_id.`, COLS, sorted))
    const top = sorted.filter((row, index) => (index + 1) * 4 <= sorted.length)
    kept.push(...top)
    frames.push(frame('cut', 'WHERE rnk * 4 <= group_size', 'kept = ranked[', `Keep ${top.length} from ${state}: rank times 4 must not exceed ${sorted.length}.`, COLS, top))
  }
  const result = [...kept].sort(byOutput)
  frames.push(frame('order', 'ORDER BY state', 'return kept[', 'Sort by state, then score descending, then policy_id.', COLS, result))
  frames.push(frame('done', 'SELECT policy_id', 'return kept[', 'Output the kept policies.', COLS, result))
  return { input, result, frames }
}
