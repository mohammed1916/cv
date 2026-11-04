// SQL walkthrough. The sample tables are invented for this visualization.
const BUDGET = 70000

export const sql = `WITH ranked AS (
  SELECT employee_id, experience, salary,
         SUM(salary) OVER (PARTITION BY experience ORDER BY salary, employee_id) AS running_total
  FROM Candidates
),
senior_hire AS (
  SELECT COUNT(*) AS hired, COALESCE(MAX(running_total), 0) AS spent
  FROM ranked
  WHERE experience = 'Senior' AND running_total <= 70000
),
junior_hire AS (
  SELECT COUNT(*) AS hired
  FROM ranked
  WHERE experience = 'Junior' AND running_total <= 70000 - (SELECT spent FROM senior_hire)
)
SELECT 'Senior' AS experience, hired AS accepted_candidates FROM senior_hire
UNION ALL
SELECT 'Junior', hired FROM junior_hire`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def seniors_and_juniors(candidates):
    budget = 70000
    seniors = candidates[candidates["experience"] == "Senior"].sort_values(["salary", "employee_id"])
    seniors = seniors.assign(running_total=seniors["salary"].cumsum())
    taken = seniors[seniors["running_total"] <= budget]
    spent = int(taken["running_total"].max()) if len(taken) else 0
    juniors = candidates[candidates["experience"] == "Junior"].sort_values(["salary", "employee_id"])
    juniors = juniors.assign(running_total=juniors["salary"].cumsum())
    left = budget - spent
    hired_juniors = int((juniors["running_total"] <= left).sum())
    return [{"experience": "Senior", "accepted_candidates": len(taken)},
            {"experience": "Junior", "accepted_candidates": hired_juniors}]`
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
  { id: 'seniors', label: 'Seniors', description: 'Hire seniors from the cheapest up while the running total fits the budget.' },
  { id: 'juniors', label: 'Juniors', description: 'Spend what remains on juniors, again cheapest first.' },
  { id: 'done', label: 'Result', description: 'Report both counts, including zeros.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.Candidates)) throw new Error('Use an object with a Candidates array.')
  if (input.Candidates.length < 1 || input.Candidates.length > 12) throw new Error('Candidates needs 1 to 12 rows.')
  return {
    Candidates: input.Candidates.map(row => {
      if (!row || typeof row !== 'object' || !('employee_id' in row) || !('experience' in row) || !('salary' in row)) {
        throw new Error('Candidates rows need employee_id, experience and salary.')
      }
      if (row.experience !== 'Senior' && row.experience !== 'Junior') throw new Error('experience must be Senior or Junior.')
      return { employee_id: row.employee_id, experience: row.experience, salary: Number(row.salary) }
    }),
  }
}

function hireGreedily(rows, budget, label, sqlKey, pyKey, frames) {
  const sorted = rows.slice().sort((a, b) => a.salary - b.salary || a.employee_id - b.employee_id)
  let total = 0
  let hired = 0
  const summary = []
  for (const row of sorted) {
    total += row.salary
    const ok = total <= budget
    if (ok) hired += 1
    summary.push({ employee_id: row.employee_id, experience: row.experience, salary: row.salary, running_total: total, decision: ok ? 'hire' : 'skip' })
    frames.push(frame(label, sqlKey, pyKey, `${label === 'seniors' ? 'Senior' : 'Junior'} ${row.employee_id}: running total ${total} against budget ${budget} is ${ok ? 'within' : 'over'}.`, ['employee_id', 'experience', 'salary', 'running_total', 'decision'], summary))
  }
  return { hired, spent: hired ? summary[hired - 1].running_total : 0 }
}

export function buildTrace(input) {
  const candidates = input.Candidates
  const frames = []
  const seniors = candidates.filter(row => row.experience === 'Senior')
  const juniors = candidates.filter(row => row.experience === 'Junior')

  const senior = hireGreedily(seniors, BUDGET, 'seniors', 'senior_hire AS', 'seniors = candidates', frames)
  const left = BUDGET - senior.spent
  const junior = hireGreedily(juniors, left, 'juniors', 'junior_hire AS', 'juniors = candidates', frames)

  const result = [
    { experience: 'Senior', accepted_candidates: senior.hired },
    { experience: 'Junior', accepted_candidates: junior.hired },
  ]
  frames.push(frame('done', 'UNION ALL', 'return', `Seniors hired: ${senior.hired}. Juniors hired with the remaining ${left}: ${junior.hired}.`, ['experience', 'accepted_candidates'], result))
  return { input, result, frames }
}
