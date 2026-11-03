const MOD = 1000000007n

export const code = `the minimum total purchase cost to serve every demand in order
  set available to k, bought to 0, and cost to 0
  for each demand d from left to right
    while available is less than d
      add one to bought and add bought to cost
      add k to available
    subtract d from available
  return cost modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const at = code.findIndex(c => c.text.includes(text))
  if (at < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return at + 1
}

export const python = `def min_total_cost(demands, k):
    MOD = 1_000_000_007
    available = k
    bought = 0
    cost = 0
    for d in demands:
        while available < d:
            bought += 1
            cost += bought
            available += k
        available -= d
    return cost % MOD
`
const pyLines = python.split('\n')
const P = text => {
  const at = pyLines.findIndex(line => line.includes(text))
  if (at < 0) throw new Error(`Missing python line: ${text}`)
  return at + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.demands) || !Number.isInteger(input.k)) {
    throw new Error('Use an object with demands (array) and integer k.')
  }
  const { demands, k } = input
  if (demands.length < 1 || demands.length > 10) throw new Error('demands has 1 to 10 values in this visualization.')
  if (!demands.every(v => Number.isInteger(v) && v >= 1 && v <= 40)) throw new Error('Demands are integers from 1 to 40.')
  if (k < 1 || k > 10) throw new Error('k is an integer from 1 to 10 in this visualization.')
  return { demands, k }
}

export function buildTrace({ demands, k }) {
  const frames = []
  let available = k
  let bought = 0
  let cost = 0
  frames.push({ pythonLine: P('available = k'), phase: 'start', activeLine: L('set available to k'), demand: null, d: null, available, bought, cost, message: `Start with ${k} free units.` })
  for (let idx = 0; idx < demands.length; idx++) {
    const d = demands[idx]
    frames.push({ pythonLine: P('for d in demands'), phase: 'demand', activeLine: L('for each demand d'), demand: idx, d, available, bought, cost, message: `Demand ${idx} needs ${d} units; ${available} are available.` })
    while (available < d) {
      bought += 1
      cost += bought
      available += k
      frames.push({ pythonLine: P('bought += 1'), phase: 'buy', activeLine: L('add one to bought'), demand: idx, d, available, bought, cost, message: `Refill ${bought} costs ${bought}. Available is now ${available}.` })
    }
    available -= d
    frames.push({ pythonLine: P('available -= d'), phase: 'consume', activeLine: L('subtract d from available'), demand: idx, d, available, bought, cost, message: `${d} units consumed; ${available} remain.` })
  }
  const result = Number(BigInt(cost) % MOD)
  frames.push({ pythonLine: P('return cost % MOD'), phase: 'done', activeLine: L('return cost modulo'), demand: null, d: null, available, bought, cost, result, message: `Total purchase cost is ${cost}, reported as ${result}.` })
  return { input: { demands, k }, result, frames }
}
