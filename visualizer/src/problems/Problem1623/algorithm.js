export const sql = `select a.student_id as member_A, b.student_id as member_B, c.student_id as member_C
from SchoolA a
join SchoolB b on b.student_id <> a.student_id
join SchoolC c on c.student_id <> a.student_id and c.student_id <> b.student_id
where a.student_name <> b.student_name
  and a.student_name <> c.student_name
  and b.student_name <> c.student_name
order by member_A, member_B, member_C`
export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def valid_triplets(a, b, c):
    keep = []
    for _, x in a.iterrows():
        for _, y in b.iterrows():
            for _, z in c.iterrows():
                ids = {x.student_id, y.student_id, z.student_id}
                names = {x.student_name, y.student_name, z.student_name}
                if len(ids) == 3 and len(names) == 3:
                    keep.append((x.student_id, y.student_id, z.student_id))
    return sorted(keep)`
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the three school lists.' },
  { id: 'join', label: 'Combine', description: 'Form one candidate from each school.' },
  { id: 'check', label: 'Check', description: 'Reject a candidate that repeats an id or a name.' },
  { id: 'order', label: 'Order', description: 'Sort the valid triplets.' },
  { id: 'done', label: 'Result', description: 'Report the valid triplets.' },
]

const sqlLine = text => {
  const hit = code.find(c => c.text.includes(text))
  if (!hit) throw new Error(`No SQL line contains "${text}".`)
  return hit.line
}
const pyLine = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains "${text}".`)
  return index + 1
}
const frame = (phase, sqlText, pyText, rows, output, message) => ({
  phase, activeLine: sqlLine(sqlText), pythonLine: pyLine(pyText),
  rows: rows.map(row => ({ ...row })), output: output.map(row => ({ ...row })), message,
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with SchoolA, SchoolB and SchoolC lists.')
  for (const name of ['SchoolA', 'SchoolB', 'SchoolC']) {
    if (!Array.isArray(input[name]) || input[name].length < 1 || input[name].length > 6) throw new Error(`${name} is a list of 1 to 6 rows.`)
    for (const s of input[name]) {
      if (typeof s.student_id !== 'number' || typeof s.student_name !== 'string') throw new Error('Each student has student_id and student_name.')
    }
  }
  return input
}

export function buildTrace(input) {
  const frames = []
  const lists = { A: input.SchoolA, B: input.SchoolB, C: input.SchoolC }
  const stacked = [
    ...lists.A.map(s => ({ school: 'A', student_id: s.student_id, student_name: s.student_name })),
    ...lists.B.map(s => ({ school: 'B', student_id: s.student_id, student_name: s.student_name })),
    ...lists.C.map(s => ({ school: 'C', student_id: s.student_id, student_name: s.student_name })),
  ]
  frames.push(frame('load', 'from SchoolA a', 'def valid_triplets', stacked, [], `Read ${stacked.length} students across three schools.`))
  const candidates = []
  for (const a of lists.A) {
    for (const b of lists.B) {
      for (const c of lists.C) {
        const ids = new Set([a.student_id, b.student_id, c.student_id]).size === 3
        const names = new Set([a.student_name, b.student_name, c.student_name]).size === 3
        const candidate = { member_A: a.student_id, member_B: b.student_id, member_C: c.student_id, valid: ids && names }
        candidates.push(candidate)
        const reason = !ids ? 'an id repeats' : !names ? 'a name repeats' : 'valid'
        frames.push(frame('check', 'where a.student_name <> b.student_name', 'len(ids) == 3', candidates, [], `(${candidate.member_A}, ${candidate.member_B}, ${candidate.member_C}): ${reason}.`))
      }
    }
  }
  const valid = candidates.filter(c => c.valid)
  const ordered = [...valid].sort((x, y) => x.member_A - y.member_A || x.member_B - y.member_B || x.member_C - y.member_C)
  frames.push(frame('order', 'order by member_A', 'return sorted', ordered, [], 'Sort the valid triplets by A, B, then C.'))
  const result = ordered.map(c => ({ member_A: c.member_A, member_B: c.member_B, member_C: c.member_C }))
  frames.push(frame('done', 'select a.student_id', 'return sorted', result, result, `Returned ${result.length} valid triplets.`))
  return { input, result, frames }
}
