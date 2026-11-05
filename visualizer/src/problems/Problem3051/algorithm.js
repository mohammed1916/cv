// Teaching SQL walkthrough. The candidate rows are invented for this visualization.
export const sql = `SELECT candidate_id
FROM Candidates
WHERE skill IN ('Python', 'Tableau', 'PostgreSQL')
GROUP BY candidate_id
HAVING COUNT(DISTINCT skill) = 3
ORDER BY candidate_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def find_candidates(candidates):
    wanted = {"Python", "Tableau", "PostgreSQL"}
    hits = candidates[candidates["skill"].isin(wanted)]
    counts = hits.groupby("candidate_id")["skill"].nunique()
    kept = counts[counts == len(wanted)].index
    return [{"candidate_id": c} for c in sorted(kept)]`
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
  { id: 'load', label: 'Load', description: 'Read every candidate skill row.' },
  { id: 'filter', label: 'Filter', description: 'Keep only the three required skills.' },
  { id: 'check', label: 'Check', description: 'Count the distinct required skills for each candidate.' },
  { id: 'done', label: 'Result', description: 'Return candidates that have all three, in id order.' },
]

const COLUMNS = ['candidate_id', 'skill']
const REQUIRED = ['Python', 'Tableau', 'PostgreSQL']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.Candidates)) {
    throw new Error('Use an object with a Candidates array.')
  }
  const rows = input.Candidates
  if (rows.length < 1 || rows.length > 12) throw new Error('Candidates needs 1 to 12 rows.')
  const Candidates = rows.map(row => {
    if (!row || typeof row !== 'object' || COLUMNS.some(column => !(column in row))) {
      throw new Error('Candidates rows need candidate_id and skill.')
    }
    return { candidate_id: Number(row.candidate_id), skill: String(row.skill) }
  })
  return { Candidates }
}

export function buildTrace(input) {
  const { Candidates } = input
  const frames = []
  frames.push(frame('load', 'FROM Candidates', 'def find', 'Read every candidate skill row.', COLUMNS, Candidates))

  const hits = Candidates.filter(row => REQUIRED.includes(row.skill))
  frames.push(frame('filter', 'WHERE skill', 'hits =', `${hits.length} rows name one of the three required skills.`, COLUMNS, hits))

  const ids = [...new Set(Candidates.map(row => row.candidate_id))].sort((a, b) => a - b)
  const summary = []
  const result = []
  for (const id of ids) {
    const matched = new Set(hits.filter(row => row.candidate_id === id).map(row => row.skill))
    const ok = matched.size === REQUIRED.length
    summary.push({ candidate_id: id, matched_skills: matched.size, kept: ok ? 'yes' : 'no' })
    if (ok) result.push({ candidate_id: id })
    frames.push(frame('check', 'HAVING', 'kept =', `Candidate ${id} has ${matched.size} of 3 required skills, so it ${ok ? 'stays' : 'is dropped'}.`, ['candidate_id', 'matched_skills', 'kept'], summary))
  }
  frames.push(frame('done', 'ORDER BY', 'return [', `Return ${result.length} candidates.`, ['candidate_id'], result))
  return { input, result, frames }
}
