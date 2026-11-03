const SQL = `WITH clean AS (
  SELECT DISTINCT voter, candidate
  FROM Votes
  WHERE candidate IS NOT NULL
),
shares AS (
  SELECT voter, candidate,
    1.0 / COUNT(*) OVER (PARTITION BY voter) AS share
  FROM clean
),
totals AS (
  SELECT candidate, SUM(share) AS total
  FROM shares
  GROUP BY candidate
)
SELECT candidate
FROM totals
WHERE total = (SELECT MAX(total) FROM totals)
ORDER BY candidate;`

const PY = `import pandas as pd

def election_results(votes):
    clean = votes.dropna(subset=["candidate"]).drop_duplicates(["voter", "candidate"])
    clean = clean.assign(share=1.0 / clean.groupby("voter")["candidate"].transform("count"))
    totals = clean.groupby("candidate", as_index=False)["share"].sum()
    top = totals[totals["share"] == totals["share"].max()]
    return top[["candidate"]].sort_values("candidate").reset_index(drop=True)
`

const snap = rows => JSON.parse(JSON.stringify(rows))
const SQL_LINES = SQL.split('\n')
const PY_LINES = PY.split('\n')
function lookup(lines, fragment, label) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`${label} has no line containing "${fragment}"`)
  return index + 1
}
const sqlLine = fragment => lookup(SQL_LINES, fragment, 'SQL')
const pyLine = fragment => lookup(PY_LINES, fragment, 'Python')
const frame = (phase, sqlFragment, pyFragment, message, rows) => ({
  phase, activeLine: sqlLine(sqlFragment), pythonLine: pyLine(pyFragment), message, rows: snap(rows),
})

export const sql = SQL
export const python = PY
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))
export const phases = [
  { id: 'load', label: 'Votes', description: 'Each row says one voter picked one candidate.' },
  { id: 'clean', label: 'Clean', description: 'Drop empty choices and repeated picks.' },
  { id: 'share', label: 'Share', description: 'Each voter’s single vote is split equally across their choices.' },
  { id: 'total', label: 'Total', description: 'Add the shares per candidate.' },
  { id: 'done', label: 'Result', description: 'Every candidate tied for the highest total, in name order.' },
]
export const sample = {
  votes: [
    { voter: 'A', candidate: 'X' },
    { voter: 'A', candidate: 'Y' },
    { voter: 'A', candidate: 'X' },
    { voter: 'B', candidate: 'X' },
    { voter: 'C', candidate: 'Y' },
    { voter: 'D', candidate: 'Z' },
    { voter: 'D', candidate: null },
  ],
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.votes)) throw new Error('Provide a votes array.')
  for (const v of input.votes) {
    if (typeof v.voter !== 'string') throw new Error('Each vote needs a voter name.')
  }
  return input
}

export function buildTrace(input) {
  const { votes } = input
  const frames = []
  frames.push(frame('load', 'FROM Votes', 'votes.dropna', 'Start with every vote row, including the empty choice.', votes))
  const seen = new Set()
  const clean = []
  for (const v of votes) {
    if (v.candidate === null) continue
    const key = `${v.voter}|${v.candidate}`
    if (seen.has(key)) continue
    seen.add(key)
    clean.push({ voter: v.voter, candidate: v.candidate })
  }
  frames.push(frame('clean', 'SELECT DISTINCT voter', 'drop_duplicates', 'Remove empty choices and repeated picks.', clean))
  const perVoter = new Map()
  for (const c of clean) perVoter.set(c.voter, (perVoter.get(c.voter) || 0) + 1)
  const shares = clean.map(c => ({ voter: c.voter, candidate: c.candidate, share: 1 / perVoter.get(c.voter) }))
  frames.push(frame('share', '1.0 / COUNT(*) OVER', 'transform("count")', 'Each choice gets 1 divided by how many choices that voter made.', shares))
  const totalMap = new Map()
  for (const s of shares) totalMap.set(s.candidate, (totalMap.get(s.candidate) || 0) + s.share)
  const totals = [...totalMap.entries()].map(([candidate, total]) => ({ candidate, total }))
  frames.push(frame('total', 'SUM(share) AS total', 'groupby("candidate"', 'Add the shares for each candidate.', totals))
  const top = Math.max(...totals.map(t => t.total))
  const result = totals.filter(t => t.total === top).map(t => ({ candidate: t.candidate })).sort((a, b) => a.candidate.localeCompare(b.candidate))
  frames.push(frame('done', 'WHERE total = (SELECT MAX', 'return top[["candidate"]]', `Candidates tied at ${top}.`, result))
  return { input, result, frames }
}
