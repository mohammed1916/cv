export const BUDGET = 70000

export const sql = `WITH ranked AS (
  SELECT employee_id, experience,
         SUM(salary) OVER (PARTITION BY experience ORDER BY salary) AS running
  FROM Candidates
),
seniors AS (
  SELECT employee_id, running FROM ranked
  WHERE experience = 'Senior' AND running <= 70000
),
spent AS (
  SELECT COALESCE(MAX(running), 0) AS total FROM seniors
)
SELECT employee_id FROM seniors
UNION ALL
SELECT r.employee_id FROM ranked r CROSS JOIN spent s
WHERE r.experience = 'Junior' AND r.running <= 70000 - s.total`

export const code = `hire within a budget of 70000
  set remaining to 70000
  for each level, seniors first and then juniors
    sort that level by salary, cheapest first
    for each candidate in that order
      if the salary is more than remaining, stop this level
      subtract the salary from remaining
      add the candidate to the hired list
  return the hired list`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Pseudocode line missing: ${key}`)
  return index + 1
}

export const python = `def hired_candidates(candidates):
    remaining = 70000
    hired = []
    for level in ("Senior", "Junior"):
        pool = [c for c in candidates if c["experience"] == level]
        pool.sort(key=lambda c: c["salary"])
        for candidate in pool:
            if candidate["salary"] > remaining:
                break
            remaining -= candidate["salary"]
            hired.append(candidate["employee_id"])
    return hired
`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Python line missing: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the candidates and set the budget.' },
  { id: 'sort', label: 'Sort', description: 'Order one level by salary, cheapest first.' },
  { id: 'check', label: 'Check', description: 'Compare the next salary with what is left.' },
  { id: 'hire', label: 'Hire', description: 'Pay the salary and record the id.' },
  { id: 'stop', label: 'Stop', description: 'The next salary does not fit, so this level ends.' },
  { id: 'done', label: 'Result', description: 'Report every hired id.' },
]

export const inputLabel = 'Object with a Candidates table (employee_id, experience, salary)'
export const complexity = 'O(n log n) for ordering each level, then one linear pass. The official budget is fixed at 70000; the visualization caps the table at 14 rows.'

const row = (employee_id, experience, salary) => ({ employee_id, experience, salary })
const asInput = rows => JSON.stringify({ Candidates: rows })
export const examples = [
  { label: 'Both levels', input: asInput([row(101, 'Junior', 12000), row(102, 'Senior', 41000), row(103, 'Junior', 6000), row(104, 'Senior', 21000), row(105, 'Junior', 15000), row(106, 'Senior', 33000), row(107, 'Junior', 9000)]) },
  { label: 'No senior fits', input: asInput([row(201, 'Senior', 88000), row(202, 'Junior', 45000), row(203, 'Senior', 71000), row(204, 'Junior', 30000)]) },
  { label: 'Spends it all', input: asInput([row(301, 'Senior', 40000), row(302, 'Senior', 30000), row(303, 'Junior', 5000)]) },
  { label: 'Empty table', input: asInput([]) },
  { label: "One junior at the budget", input: "{\"Candidates\":[{\"employee_id\":11,\"experience\":\"Junior\",\"salary\":70000}]}" },
  { label: "One senior just above the budget", input: "{\"Candidates\":[{\"employee_id\":12,\"experience\":\"Senior\",\"salary\":70001}]}" },
  { label: "Long run: 14 candidates", input: "{\"Candidates\":[{\"employee_id\":300,\"experience\":\"Senior\",\"salary\":8195},{\"employee_id\":301,\"experience\":\"Senior\",\"salary\":28361},{\"employee_id\":302,\"experience\":\"Junior\",\"salary\":25435},{\"employee_id\":303,\"experience\":\"Junior\",\"salary\":33568},{\"employee_id\":304,\"experience\":\"Senior\",\"salary\":87451},{\"employee_id\":305,\"experience\":\"Senior\",\"salary\":59488},{\"employee_id\":306,\"experience\":\"Junior\",\"salary\":75789},{\"employee_id\":307,\"experience\":\"Junior\",\"salary\":57252},{\"employee_id\":308,\"experience\":\"Junior\",\"salary\":26761},{\"employee_id\":309,\"experience\":\"Junior\",\"salary\":19768},{\"employee_id\":310,\"experience\":\"Senior\",\"salary\":39855},{\"employee_id\":311,\"experience\":\"Junior\",\"salary\":32411},{\"employee_id\":312,\"experience\":\"Senior\",\"salary\":8192},{\"employee_id\":313,\"experience\":\"Senior\",\"salary\":31998}]}" },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Candidates table.')
  const rows = input.Candidates
  if (!Array.isArray(rows) || rows.length > 14) throw new Error('Candidates is a list of at most 14 rows here.')
  const ids = new Set()
  const salaries = new Set()
  const Candidates = rows.map(entry => {
    if (!entry || typeof entry !== 'object') throw new Error('Each row needs employee_id, experience and salary.')
    const { employee_id, experience, salary } = entry
    if (!Number.isInteger(employee_id)) throw new Error('employee_id must be an integer.')
    if (experience !== 'Senior' && experience !== 'Junior') throw new Error('experience is Senior or Junior.')
    if (!Number.isInteger(salary) || salary < 1) throw new Error('salary must be a positive integer.')
    if (ids.has(employee_id)) throw new Error(`employee_id ${employee_id} appears twice.`)
    if (salaries.has(salary)) throw new Error(`Salaries are unique; ${salary} appears twice.`)
    ids.add(employee_id)
    salaries.add(salary)
    return { employee_id, experience, salary }
  })
  return { Candidates }
}

const money = value => `$${value.toLocaleString('en-US')}`

export function buildTrace({ Candidates }) {
  const frames = []
  const lanes = { Senior: [], Junior: [] }
  for (const entry of Candidates) lanes[entry.experience].push({ ...entry, status: 'waiting', remainingBefore: null })
  const sorted = { Senior: false, Junior: false }
  const paid = []
  let remaining = BUDGET
  const hired = []
  const push = (phase, lineKey, pyKey, message, extra = {}) => frames.push({
    phase, activeLine: L(lineKey), pythonLine: PY(pyKey), message,
    seniors: lanes.Senior.map(entry => ({ ...entry })), juniors: lanes.Junior.map(entry => ({ ...entry })),
    sorted: { ...sorted }, remaining, spent: BUDGET - remaining, paid: paid.map(entry => ({ ...entry })), hired: [...hired],
    level: null, candidateId: null, sourceRow: -1, ...extra,
  })

  push('load', 'set remaining', 'remaining = 70000', `Load ${Candidates.length} candidate${Candidates.length === 1 ? '' : 's'}; ${money(BUDGET)} is available.`)

  for (const level of ['Senior', 'Junior']) {
    const pool = lanes[level]
    pool.sort((a, b) => a.salary - b.salary)
    sorted[level] = true
    push('sort', 'sort that level', 'pool.sort', pool.length
      ? `${level}s from cheapest to dearest: ${pool.map(entry => money(entry.salary)).join(', ')}.`
      : `There are no ${level.toLowerCase()} candidates.`, { level })
    for (const candidate of pool) {
      candidate.status = 'checking'
      candidate.remainingBefore = remaining
      const sourceRow = Candidates.findIndex(entry => entry.employee_id === candidate.employee_id)
      const fits = candidate.salary <= remaining
      push('check', 'if the salary', 'if candidate["salary"]', `${level} ${candidate.employee_id} costs ${money(candidate.salary)} and ${money(remaining)} is left: ${fits ? 'it fits' : 'it does not fit'}.`, { level, candidateId: candidate.employee_id, sourceRow })
      if (!fits) {
        // Later candidates cost even more, because the level is sorted.
        for (const later of pool) if (later.status === 'waiting' || later.status === 'checking') later.status = 'unaffordable'
        push('stop', 'if the salary', 'break', `Everyone after ${candidate.employee_id} costs more still, so hiring ${level.toLowerCase()}s ends with ${money(remaining)} left.`, { level, candidateId: candidate.employee_id, sourceRow })
        break
      }
      remaining -= candidate.salary
      candidate.status = 'hired'
      paid.push({ employee_id: candidate.employee_id, experience: level, salary: candidate.salary })
      push('hire', 'subtract the salary', 'remaining -=', `Pay ${money(candidate.salary)}; ${money(remaining)} remains.`, { level, candidateId: candidate.employee_id, sourceRow })
      hired.push(candidate.employee_id)
      push('hire', 'add the candidate', 'hired.append', `Record ${candidate.employee_id}; ${hired.length} hired so far.`, { level, candidateId: candidate.employee_id, sourceRow })
    }
  }

  push('done', 'return the hired', 'return hired', hired.length
    ? `Return ${hired.length} id${hired.length === 1 ? '' : 's'}: ${hired.join(', ')}. ${money(BUDGET - remaining)} is spent and ${money(remaining)} is unused.`
    : 'Nobody fits the budget, so the result is empty.')
  return { input: { Candidates }, result: hired, frames }
}
