export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.costs) || !Array.isArray(input.capacity)) throw new Error('Use an object with costs, capacity and budget.')
  const { costs, capacity, budget } = input
  if (costs.length < 1 || costs.length > 12 || costs.length !== capacity.length) throw new Error('costs and capacity have the same length, 1 to 12.')
  if (!costs.every(v => Number.isInteger(v) && v >= 1 && v <= 30) || !capacity.every(v => Number.isInteger(v) && v >= 1 && v <= 30)) throw new Error('Costs and capacities are integers from 1 to 30.')
  if (!Number.isInteger(budget) || budget < 1 || budget > 60) throw new Error('budget is an integer from 1 to 60.')
  return { costs, capacity, budget }
}

export function buildTrace({ costs, capacity, budget }) {
  const frames = []
  const order = costs.map((_, i) => i).sort((a, b) => costs[a] - costs[b] || a - b)
  const prefix = []
  order.forEach((machine, pos) => { prefix.push(pos === 0 ? capacity[machine] : Math.max(prefix[pos - 1], capacity[machine])) })
  frames.push({ pythonLine: P('order = sorted'), phase: 'sort', activeLine: C('sort the machines'), at: -1, r: -1, k: -1, best: 0, sorted: order, prefix: [...prefix],
    message: 'Machines sorted by cost; prefix maxima of capacity are ready.' })
  let best = 0
  for (let r = 0; r < order.length; r++) {
    const machine = order[r]
    if (costs[machine] < budget) {
      best = Math.max(best, capacity[machine])
      frames.push({ pythonLine: P('if c[r] < budget'), phase: 'single', activeLine: C('if its cost is below budget'), at: r, r, k: -1, best, sorted: order, prefix,
        message: `Machine ${machine} alone is affordable; best is ${best}.` })
    }
    let k = r - 1
    while (k >= 0 && costs[order[k]] + costs[machine] >= budget) k--
    if (k >= 0) {
      best = Math.max(best, capacity[machine] + prefix[k])
      frames.push({ pythonLine: P('best = max(best, p[r] + prefix[k])'), phase: 'pair', activeLine: C('if k >= 0'), at: r, r, k, best, sorted: order, prefix,
        message: `Pair machine ${machine} with the best cheaper partner up to sorted position ${k}; best is ${best}.` })
    } else {
      frames.push({ pythonLine: P('while k >= 0'), phase: 'pair', activeLine: C('move k down'), at: r, r, k: -1, best, sorted: order, prefix,
        message: `No cheaper partner fits with machine ${machine}.` })
    }
  }
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: C('return best'), at: -1, r: -1, k: -1, best, sorted: order, prefix, message: `Maximum total capacity ${best}.` })
  return { input: { costs, capacity, budget }, result: best, frames }
}

export function solve(input) {
  return buildTrace(input).result
}

export const code = `function maxCapacity(costs, capacity, budget) {
  // sort the machines by cost, keeping each original index
  const order = costs.map((_, i) => i).sort((a, b) => costs[a] - costs[b] || a - b)
  // prefix[pos] is the best capacity among sorted positions 0..pos
  const prefix = []
  order.forEach((machine, pos) => {
    prefix.push(pos === 0 ? capacity[machine] : Math.max(prefix[pos - 1], capacity[machine]))
  })
  let best = 0
  for (let r = 0; r < order.length; r++) {
    const machine = order[r]
    // if its cost is below budget, the machine can be selected alone
    if (costs[machine] < budget) best = Math.max(best, capacity[machine])
    // move k down while the pair with r is not strictly below budget
    let k = r - 1
    while (k >= 0 && costs[order[k]] + costs[machine] >= budget) k--
    // if k >= 0, every position up to k is a valid partner
    if (k >= 0) best = Math.max(best, capacity[machine] + prefix[k])
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_capacity(costs, capacity, budget):
    order = sorted(range(len(costs)), key=lambda i: costs[i])
    c = [costs[i] for i in order]
    p = [capacity[i] for i in order]
    prefix = []
    for x in p:
        prefix.append(max(x, prefix[-1]) if prefix else x)
    best = 0
    for r in range(len(c)):
        if c[r] < budget:
            best = max(best, p[r])
        k = r - 1
        while k >= 0 and c[k] + c[r] >= budget:
            k -= 1
        if k >= 0:
            best = max(best, p[r] + prefix[k])
    return best
`

const PY = python.split('\n')
const CODE = code.map(c => c.text)
function P(text) { return PY.findIndex(line => line.includes(text)) + 1 }
function C(text) { return CODE.findIndex(line => line.includes(text)) + 1 }
