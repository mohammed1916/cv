const MAX_CARS = 8

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with demand and fuel.')
  const { demand, fuel } = input
  if (!Array.isArray(demand) || demand.length < 1 || demand.length > MAX_CARS) throw new Error(`demand has 1 to ${MAX_CARS} entries here.`)
  for (const d of demand) if (!Number.isInteger(d) || d < 1 || d > 20) throw new Error('Each demand is an integer from 1 to 20.')
  if (!Array.isArray(fuel) || fuel.length !== 2) throw new Error('fuel has exactly two entries.')
  for (const f of fuel) if (!Number.isInteger(f) || f < 1 || f > 50) throw new Error('Each fuel amount is an integer from 1 to 50.')
  return { demand, fuel }
}

const keyOf = (left, busy) => `${left[0]},${left[1]}|${busy[0]},${busy[1]}`

export function buildTrace({ demand, fuel }) {
  const frames = []
  let layer = [{ left: [fuel[0], fuel[1]], busy: [0, 0], worst: 0, time: 0, history: [] }]
  let next = []
  let served = 0
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine: L(activeLine), pythonLine: P(pythonLine), message,
    car: served, need: null, served, layer, next: next.slice(), active: -1, candidate: null, verdict: null, schedule: [], best: null, ...extra,
  })

  push('start', 'start with one state', 'layer = {', 'Before any car, there is one state: both dispensers are full and free.', { car: 0, schedule: [] })
  for (let car = 0; car < demand.length; car++) {
    const need = demand[car]
    next = []
    const index = new Map()
    push('layer', 'for each car', 'for need in demand', `Car ${car} needs ${need}. Every state reached by the earlier cars gets to try both dispensers.`, { car, need })
    layer.forEach((state, active) => {
      const base = { car, need, active, schedule: state.history }
      push('expand', 'for each state', 'for state, worst in', `State ${active + 1} of ${layer.length}: fuel ${state.left[0]} and ${state.left[1]}, busy for ${state.busy[0]} and ${state.busy[1]}, longest wait so far ${state.worst}.`, base)
      for (const d of [0, 1]) {
        if (state.left[d] < need) {
          push('blocked', 'if d has too little fuel', 'if left[d] < need', `Dispenser ${d} has ${state.left[d]} left, less than ${need}. This choice is not allowed.`, { ...base, candidate: { d, blocked: true } })
          continue
        }
        const wait = state.busy[d]
        const left = state.left.slice()
        left[d] -= need
        const busy = state.busy.map(b => Math.max(0, b - wait))
        busy[d] = need
        const worst = Math.max(state.worst, wait)
        const start = state.time + wait
        const entry = { car, d, allowed: state.time, start, end: start + need, wait }
        const key = keyOf(left, busy)
        const found = index.get(key)
        const keep = found === undefined || worst < next[found].worst
        const child = { left, busy, worst, time: start, history: [...state.history, entry] }
        const schedule = child.history
        if (keep) {
          if (found === undefined) {
            index.set(key, next.length)
            next.push(child)
          } else {
            next[found] = child
          }
        }
        const candidate = { d, wait, key, worst, left, busy }
        const outcome = found === undefined
          ? 'This state is new, so keep it.'
          : keep
            ? `The same state was reached with a longer wait, so this plan replaces it.`
            : `The same state already has a longest wait of ${next[found].worst} or less. The future is identical, so drop this plan.`
        push(keep ? 'keep' : 'drop', 'store the state', 'if key not in next_layer', `Dispenser ${d}: car ${car} waits ${wait}, longest wait becomes ${worst}. ${outcome}`, { ...base, candidate, verdict: keep ? 'keep' : 'drop', schedule })
      }
    })
    if (next.length === 0) {
      push('stop', 'if no state survives', 'if not next_layer', `No state can serve car ${car}, so the process ends after ${served} car${served === 1 ? '' : 's'}.`, { car, need })
      break
    }
    layer = next
    next = []
    served++
    push('advance', 'move to the next layer', 'layer = next_layer', `${layer.length} state${layer.length === 1 ? '' : 's'} can serve ${served} car${served === 1 ? '' : 's'}. Any plan that got stuck earlier is gone, so the most-cars rule holds by itself.`, { car, need })
  }
  if (served === 0) {
    next = []
    push('done', 'return the smallest longest wait', 'return -1', 'Not even car 0 fits in a dispenser, so no car is served. Return -1.', { car: 0 })
    return { input: { demand, fuel }, result: -1, frames }
  }
  const best = layer.reduce((a, b) => (b.worst < a.worst ? b : a))
  next = []
  push('done', 'return the smallest longest wait', 'return min(layer.values())', `All surviving plans serve ${served} car${served === 1 ? '' : 's'}. The smallest longest wait among them is ${best.worst}.`, { car: served, schedule: best.history, best })
  return { input: { demand, fuel }, result: best.worst, served, frames }
}

export const phases = [
  { id: 'start', label: 'Start', description: 'One state: full and free.' },
  { id: 'layer', label: 'Next car', description: 'The next car tries every known state.' },
  { id: 'expand', label: 'State', description: 'Take one state of this layer.' },
  { id: 'blocked', label: 'No fuel', description: 'This dispenser cannot hold the demand.' },
  { id: 'keep', label: 'Keep', description: 'A new state, or a better way to reach one.' },
  { id: 'drop', label: 'Drop', description: 'The same state is already reached at least as well.' },
  { id: 'advance', label: 'Advance', description: 'Surviving states become the next layer.' },
  { id: 'stop', label: 'Stuck', description: 'No state can serve this car.' },
  { id: 'done', label: 'Result', description: 'Report the smallest longest wait.' },
]

export const code = `minimum longest wait among plans that serve the most cars
  start with one state: full fuel, nothing busy, longest wait 0
  for each car with its need
    for each state in the current layer
      for each dispenser d
        if d has too little fuel, skip it
        wait = time d stays busy; subtract it from both busy times
        d loses need fuel and is now busy for need
        store the state, keeping the smaller longest wait
    if no state survives, stop
    move to the next layer
  return the smallest longest wait in the last layer, or -1 if no car was served`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def minimum_longest_wait(demand, fuel):
    layer = {((fuel[0], fuel[1]), (0, 0)): 0}
    served = 0
    for need in demand:
        next_layer = {}
        for state, worst in layer.items():
            left, busy = state
            for d in (0, 1):
                if left[d] < need:
                    continue
                wait = busy[d]
                new_left = list(left)
                new_left[d] -= need
                new_busy = [max(0, b - wait) for b in busy]
                new_busy[d] = need
                key = (tuple(new_left), tuple(new_busy))
                new_worst = max(worst, wait)
                if key not in next_layer or new_worst < next_layer[key]:
                    next_layer[key] = new_worst
        if not next_layer:
            break
        layer = next_layer
        served += 1
    if served == 0:
        return -1
    return min(layer.values())
`

const pythonLines = python.split('\n')
const P = s => {
  const index = pythonLines.findIndex(text => text.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}
