export function parseInput(text) {
  const data = JSON.parse(text)
  const ops = data?.operations
  const args = data?.arguments
  if (!Array.isArray(ops) || !Array.isArray(args) || ops.length !== args.length || ops.length < 1 || ops.length > 12) throw new Error('Use "operations" and "arguments" arrays of the same length from 1 to 12.')
  // Simulate the live tasks so that every edit and removal refers to a task that still exists.
  const prio = new Map()
  const used = new Set()
  ops.forEach((op, i) => {
    const a = args[i]
    const int = (x, lo, hi) => Number.isInteger(x) && x >= lo && x <= hi
    if (op === 'add') {
      if (!Array.isArray(a) || a.length !== 3 || !int(a[0], 1, 5) || !int(a[1], 1, 1000) || !int(a[2], 0, 20)) throw new Error('add takes [userId 1-5, taskId 1-1000, priority 0-20].')
      if (used.has(a[1])) throw new Error('A taskId can only be added once.')
      used.add(a[1])
      prio.set(a[1], a[2])
    } else if (op === 'edit') {
      if (!Array.isArray(a) || a.length !== 2 || !prio.has(a[0]) || !int(a[1], 0, 20)) throw new Error('edit takes [an existing taskId, priority 0-20].')
      prio.set(a[0], a[1])
    } else if (op === 'rmv') {
      if (!Array.isArray(a) || a.length !== 1 || !prio.has(a[0])) throw new Error('rmv takes an existing taskId.')
      prio.delete(a[0])
    } else if (op === 'execTop') {
      if (!Array.isArray(a) || a.length !== 0) throw new Error('execTop takes no arguments.')
      let top = null
      for (const [t, p] of prio) if (top === null || p > prio.get(top) || (p === prio.get(top) && t > top)) top = t
      if (top !== null) prio.delete(top)
    } else {
      throw new Error('Operations are add, edit, rmv, or execTop.')
    }
  })
  return { operations: ops, arguments: args }
}

export function buildTrace({ operations, arguments: args }) {
  const user = new Map()
  const prio = new Map()
  const heap = []
  const result = []
  const frames = [{ phase: 'start', activeLine: L('set up an empty map'), tasks: [], answer: null, message: 'No tasks yet.' }]
  const snapshot = () => [...prio.keys()].sort((a, b) => a - b).map(t => ({ task: t, user: user.get(t), priority: prio.get(t) }))
  operations.forEach((op, i) => {
    const a = args[i]
    if (op === 'add') {
      user.set(a[1], a[0]); prio.set(a[1], a[2]); heap.push({ p: a[2], t: a[1] })
      result.push(null)
      frames.push({ phase: 'add', activeLine: L('store the task and push its entry'), tasks: snapshot(), answer: null, message: `Task ${a[1]} for user ${a[0]} with priority ${a[2]}.` })
    } else if (op === 'edit') {
      prio.set(a[0], a[1]); heap.push({ p: a[1], t: a[0] })
      result.push(null)
      frames.push({ phase: 'edit', activeLine: L('store the new priority'), tasks: snapshot(), answer: null, message: `Task ${a[0]} now has priority ${a[1]}.` })
    } else if (op === 'rmv') {
      user.delete(a[0]); prio.delete(a[0])
      result.push(null)
      frames.push({ phase: 'rmv', activeLine: L('remove the task from the map'), tasks: snapshot(), answer: null, message: `Task ${a[0]} is removed.` })
    } else {
      const valid = e => prio.has(e.t) && prio.get(e.t) === e.p
      for (let j = heap.length - 1; j >= 0; j--) if (!valid(heap[j])) heap.splice(j, 1)
      let answer = -1
      if (heap.length) {
        let top = 0
        for (let j = 1; j < heap.length; j++) {
          if (heap[j].p > heap[top].p || (heap[j].p === heap[top].p && heap[j].t > heap[top].t)) top = j
        }
        const { t } = heap.splice(top, 1)[0]
        answer = user.get(t)
        user.delete(t); prio.delete(t)
      }
      result.push(answer)
      frames.push({ phase: 'exec', activeLine: L('answer -1 if no task remains'), tasks: snapshot(), answer, message: answer === -1 ? 'No task is left, so the answer is -1.' : `Run the top task; its user ${answer} is the answer.` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return the answers'), tasks: snapshot(), answer: null, message: 'Every operation has been answered.' })
  return { input: { operations, arguments: args }, result, frames }
}

export const code = `task manager with add, edit, rmv, and execTop
  set up an empty map from task to user and priority, and an empty max heap of (priority, task)
  for each operation in order
    if it is add userId taskId priority then store the task and push its entry
    if it is edit taskId priority then store the new priority and push a new entry
    if it is rmv taskId then remove the task from the map
    if it is execTop then discard heap entries that are stale
    if it is execTop then answer -1 if no task remains, otherwise remove the top task and answer its user
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import heapq

def task_manager(operations, arguments):
    user_of = {}
    prio_of = {}
    heap = []
    out = []
    for op, args in zip(operations, arguments):
        if op == 'add':
            user, task, p = args
            user_of[task] = user
            prio_of[task] = p
            heapq.heappush(heap, (-p, -task))
            out.append(None)
        elif op == 'edit':
            task, p = args
            prio_of[task] = p
            heapq.heappush(heap, (-p, -task))
            out.append(None)
        elif op == 'rmv':
            task = args[0]
            del user_of[task]
            del prio_of[task]
            out.append(None)
        else:
            while heap and (-heap[0][1] not in prio_of or prio_of[-heap[0][1]] != -heap[0][0]):
                heapq.heappop(heap)
            if not heap:
                out.append(-1)
            else:
                _, neg_task = heapq.heappop(heap)
                task = -neg_task
                del prio_of[task]
                out.append(user_of.pop(task))
    return out
`
