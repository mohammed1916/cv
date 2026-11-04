const MAX_LOCKS = 8
const MAX_STRENGTH = 1000000

export const phases = [
  { id: 'cost', label: 'Costs', description: 'Minutes for each lock at each value of X.' },
  { id: 'add', label: 'Add lock', description: 'The next lock looks for a slot.' },
  { id: 'visit', label: 'Visit', description: 'A slot joins the search and its lock is read.' },
  { id: 'scan', label: 'Scan', description: 'Reduced cost of the lock against an unvisited slot.' },
  { id: 'pick', label: 'Pick', description: 'The cheapest unvisited slot sets delta.' },
  { id: 'shift', label: 'Shift prices', description: 'Prices move by delta so that slot becomes tight.' },
  { id: 'augment', label: 'Reassign', description: 'Locks shift along the chain into a free slot.' },
  { id: 'done', label: 'Result', description: 'Add the minutes of the final assignment.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with strength.')
  const { strength } = input
  if (!Array.isArray(strength) || strength.length < 1 || strength.length > MAX_LOCKS) throw new Error(`strength has 1 to ${MAX_LOCKS} entries in this view.`)
  for (const value of strength) {
    if (!Number.isInteger(value) || value < 1 || value > MAX_STRENGTH) throw new Error(`Each strength is an integer from 1 to ${MAX_STRENGTH}.`)
  }
  return { strength }
}

export const code = `fewest minutes to break all locks in some order
  build cost[lock][X] = strength rounded up after dividing by X
  set every price to 0 and every slot X to free
  for each lock, find it a slot
    start the search with this lock
    visit a slot and read the lock that holds it
    for each unvisited slot, compare cost - lock price - slot price with its best value
    choose the unvisited slot with the smallest best value as delta
    raise visited lock prices and lower visited slot prices by delta
    stop the search when the chosen slot is free
    walk back along the chain, moving each lock one slot over
  add up the cost of every assigned cell`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def min_time(strength):
    n = len(strength)
    cost = [[(s + x - 1) // x for x in range(1, n + 1)] for s in strength]
    INF = float('inf')
    u = [0] * (n + 1)      # price of each lock, 1-indexed
    v = [0] * (n + 1)      # price of each slot X
    match = [0] * (n + 1)  # lock holding each slot; 0 means free
    way = [0] * (n + 1)    # slot visited just before each slot
    for i in range(1, n + 1):
        match[0] = i
        j0 = 0
        best = [INF] * (n + 1)
        used = [False] * (n + 1)
        while True:
            used[j0] = True
            i0 = match[j0]
            delta, j1 = INF, 0
            for j in range(1, n + 1):
                if not used[j]:
                    reduced = cost[i0 - 1][j - 1] - u[i0] - v[j]
                    if reduced < best[j]:
                        best[j], way[j] = reduced, j0
                    if best[j] < delta:
                        delta, j1 = best[j], j
            for j in range(n + 1):
                if used[j]:
                    u[match[j]] += delta
                    v[j] -= delta
                else:
                    best[j] -= delta
            j0 = j1
            if match[j0] == 0:
                break
        while j0:
            j1 = way[j0]
            match[j0] = match[j1]
            j0 = j1
    return sum(cost[match[j] - 1][j - 1] for j in range(1, n + 1))
`
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}

const orderCost = order => order.reduce((sum, s, index) => sum + Math.ceil(s / (index + 1)), 0)

export function buildTrace({ strength }) {
  const n = strength.length
  const cost = strength.map(s => Array.from({ length: n }, (_, x) => Math.ceil(s / (x + 1))))
  const u = Array(n + 1).fill(0), v = Array(n + 1).fill(0), match = Array(n + 1).fill(0), way = Array(n + 1).fill(0)
  let best = Array(n + 1).fill(Infinity), used = Array(n + 1).fill(false)
  const frames = []
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message,
    u: [...u], v: [...v], match: [...match], way: [...way],
    best: best.map(value => value === Infinity ? null : value), used: [...used],
    filled: n, lock: 0, row: 0, slot: 0, pick: 0, delta: null, moved: 0, ...extra,
  })
  for (let row = 1; row <= n; row++) {
    const s = strength[row - 1]
    push('cost', L('build cost'), P('cost = [['), `Lock ${row} has strength ${s}. At X = 1 it takes ${cost[row - 1][0]} min${n > 1 ? `; at X = ${n} only ${cost[row - 1][n - 1]} min` : ''}, so each slot has its own price.`, { filled: row, row })
  }
  push('cost', L('set every price'), P('u = [0]'), 'All prices start at 0 and every slot is free.')
  for (let i = 1; i <= n; i++) {
    match[0] = i
    let j0 = 0
    best = Array(n + 1).fill(Infinity)
    used = Array(n + 1).fill(false)
    push('add', L('start the search'), P('match[0] = i'), `Lock ${i} now needs a slot. The search starts from this lock alone.`, { lock: i, row: i })
    do {
      used[j0] = true
      const i0 = match[j0]
      let delta = Infinity, j1 = 0
      push('visit', L('visit a slot'), P('i0 = match[j0]'), j0 === 0 ? `Scan the row of lock ${i0}.` : `Slot X = ${j0} is taken by lock ${i0}, so the search continues from that lock's row.`, { lock: i, row: i0, slot: j0 })
      for (let j = 1; j <= n; j++) {
        if (used[j]) continue
        const reduced = cost[i0 - 1][j - 1] - u[i0] - v[j]
        const improved = reduced < best[j]
        if (improved) { best[j] = reduced; way[j] = j0 }
        if (best[j] < delta) { delta = best[j]; j1 = j }
        push('scan', L('for each unvisited'), P(improved ? 'best[j], way[j] = reduced' : 'reduced = cost'), `Lock ${i0} in slot X = ${j}: ${cost[i0 - 1][j - 1]} − ${u[i0]} − ${v[j]} = ${reduced}. ${improved ? `That is the new best way into X = ${j}.` : `The best way into X = ${j} stays at ${best[j]}.`}`, { lock: i, row: i0, slot: j, reduced })
      }
      push('pick', L('choose the unvisited'), P('delta, j1 = best[j], j'), `The smallest best value is ${delta}, at slot X = ${j1}.`, { lock: i, row: i0, pick: j1, delta })
      for (let j = 0; j <= n; j++) {
        if (used[j]) { u[match[j]] += delta; v[j] -= delta } else best[j] -= delta
      }
      push('shift', L('raise visited'), P('u[match[j]] += delta'), delta === 0 ? `Delta is 0, so no price moves: slot X = ${j1} was already tight.` : `Visited locks rise by ${delta} and visited slots fall by ${delta}. Assigned cells stay at 0 and slot X = ${j1} reaches 0.`, { lock: i, row: i0, pick: j1, delta })
      j0 = j1
      push('pick', L('stop the search'), P('if match[j0] == 0'), match[j0] === 0 ? `Slot X = ${j0} is free, so the search stops.` : `Slot X = ${j0} is held by lock ${match[j0]}, so that lock must be considered too.`, { lock: i, row: i0, pick: j0 })
    } while (match[j0] !== 0)
    while (j0 !== 0) {
      const j1 = way[j0]
      match[j0] = match[j1]
      push('augment', L('walk back'), P('match[j0] = match[j1]'), `Slot X = ${j0} now holds lock ${match[j0]}${j1 ? `, which frees up slot X = ${j1} for the step before it` : ''}.`, { lock: i, row: match[j0], moved: j0 })
      j0 = j1
    }
    best = Array(n + 1).fill(Infinity)
    used = Array(n + 1).fill(false)
  }
  const assignment = Array.from({ length: n }, (_, index) => ({ slot: index + 1, lock: match[index + 1], minutes: cost[match[index + 1] - 1][index] }))
  const result = assignment.reduce((sum, a) => sum + a.minutes, 0)
  const sortedTotal = orderCost([...strength].sort((a, b) => a - b))
  push('done', L('add up the cost'), P('return sum('), `The assigned cells add up to ${result} minutes.${sortedTotal > result ? ` Breaking locks in increasing strength would take ${sortedTotal}, so that shortcut loses here.` : ''}`, { sortedTotal })
  return { input: { strength }, cost, result, assignment, sortedTotal, frames }
}
