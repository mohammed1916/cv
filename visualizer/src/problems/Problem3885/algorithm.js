const codeLines = `function eventManager(events, ops) {
  // set up the active map from eventId to priority
  const active = new Map(events.map(([id, p]) => [id, p]))
  const answers = []
  // for each operation in order
  for (const op of ops) {
    if (op[0] === 'update') {
      // if it is an update then change the priority of that active event
      active.set(op[1], op[2])
    } else {
      // if it is a poll then choose the active event with the highest priority
      let best = null
      for (const [id, p] of active) {
        // break ties by the smaller eventId
        if (best === null || p > active.get(best) || (p === active.get(best) && id < best)) best = id
      }
      // remove it and record its id, or -1 when none is active
      if (best === null) {
        answers.push(-1)
      } else {
        active.delete(best)
        answers.push(best)
      }
    }
  }
  // return the recorded answers
  return answers
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.text.includes(s)) + 1
const pythonLines = `class EventManager:
    def __init__(self, events):
        self.active = {eid: p for eid, p in events}
    def updatePriority(self, eventId, newPriority):
        self.active[eventId] = newPriority
    def pollHighest(self):
        if not self.active:
            return -1
        best = min(self.active, key=lambda e: (-self.active[e], e))
        del self.active[best]
        return best`.split('\n')
const P = s => pythonLines.findIndex(t => t.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.events) || !Array.isArray(input.ops)) throw new Error('Use an object with events and ops.')
  const { events, ops } = input
  if (events.length > 12 || ops.length > 20) throw new Error('At most 12 events and 20 operations in this visual.')
  const ids = new Set()
  for (const [id, p] of events) {
    if (!Number.isInteger(id) || !Number.isInteger(p) || ids.has(id)) throw new Error('Each event needs a unique integer id and an integer priority.')
    ids.add(id)
  }
  for (const op of ops) {
    if (op[0] === 'poll' && op.length === 1) continue
    if (op[0] === 'update' && op.length === 3 && Number.isInteger(op[1]) && Number.isInteger(op[2])) continue
    throw new Error('Operations are ["poll"] or ["update", eventId, newPriority].')
  }
  return { events, ops }
}

export function buildTrace({ events, ops }) {
  const active = new Map(events.map(([id, p]) => [id, p]))
  const frames = [{ phase: 'setup', activeLine: L('set up the active'), pythonLine: P('self.active = '), op: -1, snapshot: [...active], answer: null, removed: null,
    message: `${active.size} active event${active.size === 1 ? '' : 's'} loaded.` }]
  const answers = []
  ops.forEach((op, index) => {
    if (op[0] === 'update') {
      active.set(op[1], op[2])
      frames.push({ phase: 'update', activeLine: L('change the priority'), pythonLine: P('self.active[eventId] ='), op: index, snapshot: [...active], answer: null, removed: null,
        message: `Event ${op[1]} now has priority ${op[2]}.` })
      return
    }
    if (active.size === 0) {
      answers.push(-1)
      frames.push({ phase: 'poll', activeLine: L('record its id, or -1'), pythonLine: P('return -1'), op: index, snapshot: [...active], answer: -1, removed: null,
        message: 'No active event remains, so the answer is -1.' })
      return
    }
    let best = null
    for (const [id, p] of active) {
      if (best === null || p > active.get(best) || (p === active.get(best) && id < best)) best = id
    }
    active.delete(best)
    answers.push(best)
    frames.push({ phase: 'poll', activeLine: L('choose the active event'), pythonLine: P('best = min'), op: index, snapshot: [...active], answer: best, removed: best,
      message: `Removed event ${best} as the highest priority.` })
  })
  frames.push({ phase: 'done', activeLine: L('return the recorded'), pythonLine: P('return best'), op: -1, snapshot: [...active], answer: null, removed: null,
    message: `Answers: [${answers.join(', ')}].` })
  return { input: { events, ops }, result: answers, frames }
}

export const code = codeLines
export const python = pythonLines.join('\n')
