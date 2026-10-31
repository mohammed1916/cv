export function parseInput(text) {
  const data = JSON.parse(text)
  const { employees, id } = data ?? {}
  if (!Array.isArray(employees) || employees.length < 1 || employees.length > 2000) throw new Error('employees must be 1–2,000 entries of [id, importance, [subordinate ids]].')
  const ids = new Set()
  for (const e of employees) {
    if (!Array.isArray(e) || e.length !== 3 || !Number.isInteger(e[0]) || !Number.isInteger(e[1]) || Math.abs(e[1]) > 100 || !Array.isArray(e[2])) throw new Error('Each employee is [id, importance, [subordinates]] with |importance| ≤ 100.')
    if (ids.has(e[0])) throw new Error(`Duplicate employee id ${e[0]}.`)
    ids.add(e[0])
  }
  if (!Number.isInteger(id) || !ids.has(id)) throw new Error('id must be one of the employee ids.')
  return { employees, id }
}

// Depth-first walk from the chosen employee, adding importance of each subordinate reached.
export function buildTrace({ employees, id }) {
  const byId = new Map(employees.map(e => [e[0], { id: e[0], importance: e[1], subs: e[2] }]))
  const visited = []
  let total = 0
  const frames = [{ phase: 'start', current: id, visited: [], total: 0, activeLine: L('start a stack'), pythonLine: 3, message: `Start at employee ${id}.` }]
  const stack = [id]
  while (stack.length) {
    const cur = stack.pop()
    const e = byId.get(cur)
    visited.push(cur)
    total += e.importance
    frames.push({ phase: 'visit', current: cur, visited: [...visited], total, activeLine: L('add its importance'), pythonLine: 6, message: `Employee ${cur}: add importance ${e.importance}; running total ${total}.` })
    for (let i = e.subs.length - 1; i >= 0; i--) stack.push(e.subs[i])
    frames[frames.length - 1].treeWalk = { kind: 'stack', stack: stack.map(String), order: [...visited], orderLabel: 'Employees visited so far', decision: `Popped employee ${cur}: add ${e.importance} to the total (${total}); ${e.subs.length ? `push its reports ${e.subs.join(', ')} so the first one is popped next` : 'it has no reports, so nothing is pushed'}.` }
  }
  frames.push({ phase: 'done', current: null, visited: [...visited], total, result: total, activeLine: L('return total'), pythonLine: 8, message: `Total importance: ${total}.` })
  return { input: { employees, id }, result: total, frames }
}

export const code = `index each employee record by its id
start a stack with the chosen employee id, and total = 0
while the stack is not empty
  pop an employee id from the stack and look up its record
  add its importance to total
  push its direct reports onto the stack
return total`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def get_importance(employees, id):
    by_id = {e[0]: e for e in employees}
    total, stack = 0, [id]
    while stack:
        e = by_id[stack.pop()]
        total += e[1]
        stack.extend(e[2])
    return total
`