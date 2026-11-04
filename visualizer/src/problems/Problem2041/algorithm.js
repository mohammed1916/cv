// SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `WITH totals AS (
  SELECT interview_id, SUM(score) AS total_score
  FROM Rounds
  GROUP BY interview_id
)
SELECT c.candidate_id
FROM Candidates c
JOIN totals t ON t.interview_id = c.interview_id
WHERE c.years_of_exp >= 2 AND t.total_score > 15
ORDER BY c.candidate_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def accepted_candidates(candidates, rounds):
    totals = rounds.groupby("interview_id", as_index=False)["score"].sum().rename(columns={"score": "total_score"})
    merged = candidates.merge(totals, on="interview_id", how="left").fillna({"total_score": 0})
    kept = merged[(merged["years_of_exp"] >= 2) & (merged["total_score"] > 15)]
    return [{"candidate_id": c} for c in sorted(kept["candidate_id"])]`
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
  { id: 'totals', label: 'Totals', description: 'Add the round scores for each interview.' },
  { id: 'join', label: 'Join', description: 'Attach each interview total to its candidate and test both conditions.' },
  { id: 'done', label: 'Result', description: 'Output the accepted candidates in id order.' },
]

function rowsOf(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  return rows.map(row => {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
    return Object.fromEntries(columns.map(column => [column, column === 'name' ? String(row[column]) : Number(row[column])]))
  })
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Candidates and Rounds tables.')
  return {
    Candidates: rowsOf(input, 'Candidates', ['candidate_id', 'name', 'years_of_exp', 'interview_id']),
    Rounds: rowsOf(input, 'Rounds', ['interview_id', 'round_id', 'score']),
  }
}

export function buildTrace(input) {
  const { Candidates, Rounds } = input
  const frames = []
  const totals = new Map()
  const totalSummary = []
  for (const round of Rounds) {
    totals.set(round.interview_id, (totals.get(round.interview_id) || 0) + round.score)
    const interview = round.interview_id
    const existing = totalSummary.find(row => row.interview_id === interview)
    if (existing) existing.total_score = totals.get(interview)
    else totalSummary.push({ interview_id: interview, total_score: totals.get(interview) })
    frames.push(frame('totals', 'GROUP BY', 'totals =', `Round ${round.round_id} of interview ${interview} adds ${round.score}, so the total is ${totals.get(interview)}.`, ['interview_id', 'total_score'], totalSummary))
  }

  const joinSummary = []
  const kept = []
  for (const candidate of Candidates) {
    const total = totals.get(candidate.interview_id)
    if (total === undefined) {
      joinSummary.push({ candidate_id: candidate.candidate_id, years_of_exp: candidate.years_of_exp, total_score: 0, keep: 'no' })
      frames.push(frame('join', 'JOIN totals', 'merged =', `Candidate ${candidate.candidate_id} has no rounds, so the inner join drops them.`, ['candidate_id', 'years_of_exp', 'total_score', 'keep'], joinSummary))
      continue
    }
    const ok = candidate.years_of_exp >= 2 && total > 15
    if (ok) kept.push({ candidate_id: candidate.candidate_id })
    joinSummary.push({ candidate_id: candidate.candidate_id, years_of_exp: candidate.years_of_exp, total_score: total, keep: ok ? 'yes' : 'no' })
    frames.push(frame('join', 'WHERE c.years_of_exp', 'kept =', `Candidate ${candidate.candidate_id}: ${candidate.years_of_exp} years and total ${total} ${ok ? 'pass' : 'fail'}.`, ['candidate_id', 'years_of_exp', 'total_score', 'keep'], joinSummary))
  }
  const result = kept.sort((a, b) => a.candidate_id - b.candidate_id)
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} candidate${result.length === 1 ? '' : 's'}.`, ['candidate_id'], result))
  return { input, result, frames }
}
