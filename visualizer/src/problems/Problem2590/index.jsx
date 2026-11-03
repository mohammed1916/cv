import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'

const code = [
  'tasks: per user, a list of {id, text, due, tags, done}; next_id counts from 1',
  'add(user, text, due, tags): append a task and return its id',
  'list(user): unfinished tasks sorted by due date, then id',
  'tag(user, tag): unfinished tasks with that tag, in the same order',
  'complete(user, id): mark that task done',
  'return one result per query',
].map((text, index) => ({ line: index + 1, text }))

const python = `def run_ops(ops):
    tasks, next_id, out = {}, 1, []
    for op in ops:
        name = op[0]
        if name == "add":
            user, text, due, tags = op[1], op[2], op[3], op[4]
            tasks.setdefault(user, []).append({"id": next_id, "text": text, "due": due, "tags": tags, "done": False})
            out.append(next_id)
            next_id += 1
        elif name == "complete":
            for t in tasks.get(op[1], []):
                if t["id"] == op[2]:
                    t["done"] = True
            out.append(None)
        else:
            pending = [t for t in tasks.get(op[1], []) if not t["done"]]
            if name == "tag":
                pending = [t for t in pending if op[2] in t["tags"]]
            pending.sort(key=lambda t: (t["due"], t["id"]))
            out.append([t["text"] for t in pending])
    return out
`

const PY = { add: 7, complete: 13, list: 16, tag: 18, done: 21 }

export function parse(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input?.ops) || input.ops.length > 20) throw new Error('ops is at most 20 operations.')
  input.ops.forEach(op => {
    if (!Array.isArray(op) || !['add', 'complete', 'list', 'tag'].includes(op[0])) throw new Error('Operations are add, complete, list or tag.')
    if (op[0] === 'add' && !(Number.isInteger(op[1]) && typeof op[2] === 'string' && Number.isInteger(op[3]) && Array.isArray(op[4]))) throw new Error('add is [add, user, text, due, [tags]].')
  })
  return { ops: input.ops }
}

export function build({ ops }) {
  const tasks = new Map()
  let nextId = 1
  const frames = []
  const results = []
  const snap = user => (tasks.get(user) || []).map(t => ({ ...t, tags: [...t.tags] }))
  ops.forEach((op, index) => {
    const [name, user, third, fourth] = op
    let result = null
    let line = 2, pyLine = PY.add
    if (name === 'add') {
      if (!tasks.has(user)) tasks.set(user, [])
      tasks.get(user).push({ id: nextId, text: third, due: fourth, tags: op[4], done: false })
      result = nextId
      nextId += 1
    } else if (name === 'complete') {
      line = 5; pyLine = PY.complete
      const t = (tasks.get(user) || []).find(x => x.id === third)
      if (t) t.done = true
    } else {
      line = name === 'list' ? 3 : 4; pyLine = name === 'list' ? PY.list : PY.tag
      let pending = (tasks.get(user) || []).filter(t => !t.done)
      if (name === 'tag') pending = pending.filter(t => t.tags.includes(third))
      pending.sort((a, b) => a.due - b.due || a.id - b.id)
      result = pending.map(t => t.text)
    }
    results.push(result)
    frames.push({ phase: name, activeLine: line, pythonLine: pyLine, message: `Operation ${index + 1}: ${op.map(v => JSON.stringify(v)).join(' ')}`, op, user, tasks: snap(user), result })
  })
  frames.push({ phase: 'done', activeLine: 6, pythonLine: PY.done, message: 'All operations processed.', op: null, user: null, tasks: [], result: null })
  return { input: { ops }, result: results, frames }
}

const definition = {
  phases: [
    { id: 'add', label: 'Add', description: 'Store a new task with a fresh id.' },
    { id: 'list', label: 'List', description: 'Unfinished tasks by due date.' },
    { id: 'tag', label: 'Tag', description: 'Unfinished tasks with one tag.' },
    { id: 'complete', label: 'Complete', description: 'Hide a task from future lists.' },
    { id: 'done', label: 'Result', description: 'All operations processed.' },
  ],
  parse, build, code, python,
  inputLabel: 'Object with ops: [\'add\', user, text, due, [tags]], [\'list\', user], [\'tag\', user, tag], [\'complete\', user, id]',
  url: 'https://leetcode.com/problems/design-a-todo-list/',
  complexity: 'The visualization sorts one user list per query. Task ids come from a counter, and completed tasks stay stored but are filtered out of every list.',
  examples: [
    { label: 'Example', input: '{"ops":[["add",1,"write notes",5,["study"]],["add",1,"pay rent",2,["home"]],["add",1,"review code",9,["study"]],["tag",1,"study"],["complete",1,1],["list",1]]}' },
  ],
}

export default function DesignATodoList() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Tasks of the user in this step">
      <thead><tr><th>Id</th><th>Task</th><th>Due</th><th>Tags</th><th>Done</th></tr></thead>
      <tbody>{step.tasks.map(t => <tr key={t.id}><td>{t.id}</td><td>{t.text}</td><td>{t.due}</td><td>{t.tags.join(', ')}</td><td>{t.done ? 'yes' : 'no'}</td></tr>)}</tbody>
    </table>
    <output aria-label="Operation result">{step.op ? `${step.op.join(' ')} → ${JSON.stringify(step.result)}` : `${step.tasks.length} tasks`}</output>
  </>} renderReasoning={() => <>
    <p>Each user owns a separate list of tasks, and ids are global so they never clash. Listing filters out finished tasks and sorts the rest by due date, breaking ties by id.</p>
  </>} />
}
