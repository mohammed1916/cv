export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input?.ops) || input.ops.length < 1 || input.ops.length > 20) throw new Error('ops has 1 to 20 operations.')
  input.ops.forEach(op => {
    if (!Array.isArray(op) || !['add', 'complete', 'list', 'tag'].includes(op[0])) throw new Error('Operations are add, complete, list or tag.')
    if (op[0] === 'add' && !(Number.isInteger(op[1]) && typeof op[2] === 'string' && Number.isInteger(op[3]) && Array.isArray(op[4]))) throw new Error('add is ["add", user, text, due, [tags]].')
    if (op[0] === 'complete' && !(Number.isInteger(op[1]) && Number.isInteger(op[2]))) throw new Error('complete is ["complete", user, id].')
    if ((op[0] === 'list' || op[0] === 'tag') && !Number.isInteger(op[1])) throw new Error(`${op[0]} needs a user number.`)
    if (op[0] === 'tag' && typeof op[2] !== 'string') throw new Error('tag is ["tag", user, tag].')
  })
  return { ops: input.ops }
}

export const code = `class TodoList
  tasks <- an empty list for each user
  nextId <- 1
function addTask(user, text, due, tags)
  append {id: nextId, text, due, tags, done: false} to tasks[user]
  nextId <- nextId + 1
  RETURN the id just used
function pendingFor(user, tag)
  pending <- tasks[user] that are not done
  if a tag is given, keep only tasks that have that tag
  sort pending by due, then by id
  RETURN pending
function completeTask(user, id)
  mark the task with that id in tasks[user] as done
  RETURN nothing`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def run_ops(ops):
    tasks, next_id, out = {}, 1, []
    for op in ops:
        name, user = op[0], op[1]
        if name == "add":
            tasks.setdefault(user, []).append({"id": next_id, "text": op[2], "due": op[3], "tags": op[4], "done": False})
            out.append(next_id)
            next_id += 1
        elif name == "complete":
            for t in tasks.get(user, []):
                if t["id"] == op[2]:
                    t["done"] = True
            out.append(None)
        else:
            pending = [t for t in tasks.get(user, []) if not t["done"]]
            if name == "tag":
                pending = [t for t in pending if op[2] in t["tags"]]
            pending.sort(key=lambda t: (t["due"], t["id"]))
            out.append([t["text"] for t in pending])
    return out
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export function buildTrace({ ops }) {
  const tasks = new Map()
  let nextId = 1
  const frames = []
  const results = []
  const copy = user => (tasks.get(user) || []).map(t => ({ ...t, tags: [...t.tags] }))
  ops.forEach((op, index) => {
    const [name, user, third, fourth] = op
    const label = `Operation ${index + 1}`
    const base = { user, opIndex: index, opName: name, tasks: null, pending: null, result: null }
    if (name === 'add') {
      if (!tasks.has(user)) tasks.set(user, [])
      tasks.get(user).push({ id: nextId, text: third, due: fourth, tags: [...op[4]], done: false })
      results.push(nextId)
      frames.push({ ...base, tasks: copy(user), phase: 'add', activeLine: CL('append {id'), pythonLine: PL('append({"id"'), result: nextId, message: `${label}: task ${nextId} "${third}" is due ${fourth} for user ${user}.` })
      nextId += 1
    } else if (name === 'complete') {
      const t = (tasks.get(user) || []).find(x => x.id === third)
      if (t) t.done = true
      results.push(null)
      frames.push({ ...base, tasks: copy(user), phase: 'complete', activeLine: CL('mark the task'), pythonLine: PL('t["done"] = True'), message: t ? `${label}: task ${third} is complete.` : `${label}: user ${user} has no task ${third}, so nothing changes.` })
    } else {
      let pending = (tasks.get(user) || []).filter(t => !t.done)
      if (name === 'tag') pending = pending.filter(t => t.tags.includes(third))
      pending.sort((a, b) => a.due - b.due || a.id - b.id)
      results.push(pending.map(t => t.text))
      frames.push({ ...base, tasks: copy(user), pending: pending.map(t => t.id), phase: 'pending', activeLine: CL('sort pending'), pythonLine: PL('pending.sort'), result: pending.map(t => t.text), message: `${label}: ${pending.length} pending task${pending.length === 1 ? '' : 's'}${name === 'tag' ? ` with tag "${third}"` : ''}, ordered by due date.` })
    }
  })
  frames.push({ phase: 'done', user: null, opIndex: ops.length, opName: null, tasks: null, pending: null, activeLine: CL('RETURN nothing'), pythonLine: PL('return out'), result: null, message: 'Every operation has been answered.' })
  return { input: { ops }, result: results, frames }
}
