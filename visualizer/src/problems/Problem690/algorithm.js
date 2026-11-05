export function parseInput(text) {
  const data = JSON.parse(text)
  const { employees, id } = data ?? {}
  if (!Array.isArray(employees) || employees.length < 1 || employees.length > 2000) throw new Error('employees must hold 1–2,000 records.')
  const ids = new Set()
  for (const record of employees) {
    if (!Array.isArray(record) || record.length !== 3 || !Number.isInteger(record[0]) || !Number.isInteger(record[1]) || !Array.isArray(record[2])) throw new Error('Each employee is [id, importance, [subordinate ids]].')
    if (ids.has(record[0])) throw new Error(`Employee ${record[0]} appears twice.`)
    ids.add(record[0])
  }
  if (!ids.has(id)) throw new Error('The chosen id must be one of the employees.')
  return { employees, id }
}

// Depth-first from the chosen employee: add each importance and visit every direct subordinate.
export function buildTrace({ employees, id }) {
  const byId = new Map(employees.map(([eid, importance, subs]) => [eid, { importance, subs }]))
  const counted = []
  let total = 0
  const frames = [{ phase: 'start', id, counted: [], total, activeLine: L('const byId = new Map'), pythonLine: P('by_id = {'), message: `Start at employee ${id}.` }]
  const visit = eid => {
    const { importance, subs } = byId.get(eid)
    total += importance
    counted.push({ id: eid, importance })
    frames.push({ phase: 'visit', id: eid, counted: counted.map(c => ({ ...c })), total, activeLine: L('total += importance'), pythonLine: P('total += importance'), message: `Employee ${eid}: add ${importance}, total ${total}.` })
    for (const sub of subs) visit(sub)
  }
  visit(id)
  frames.push({ phase: 'done', id: null, counted: counted.map(c => ({ ...c })), total, result: total, activeLine: L('return total'), pythonLine: P('return total'), message: `Total importance: ${total}.` })
  return { input: { employees, id }, result: total, frames }
}

const SOURCE = `function getImportance(employees, id) {
  const byId = new Map(employees.map(([eid, importance, subs]) => [eid, { importance, subs }]))
  let total = 0
  const visit = eid => {
    const { importance, subs } = byId.get(eid)
    total += importance
    for (const sub of subs) visit(sub)
  }
  visit(id)
  return total
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def get_importance(employees, id):
    by_id = {eid: (importance, subs) for eid, importance, subs in employees}
    total = 0

    def visit(eid):
        nonlocal total
        importance, subs = by_id[eid]
        total += importance
        for sub in subs:
            visit(sub)

    visit(id)
    return total`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
