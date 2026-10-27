export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n, present, future, hierarchy, and budget.')
  const { n, present, future, hierarchy, budget } = data
  if (!Number.isInteger(n) || n < 1 || n > 10) throw new Error('n must be an integer from 1 to 10.')
  if (!Array.isArray(present) || present.length !== n || present.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error(`present must list ${n} integers from 1 to 20.`)
  if (!Array.isArray(future) || future.length !== n || future.some(v => !Number.isInteger(v) || v < 1 || v > 40)) throw new Error(`future must list ${n} integers from 1 to 40.`)
  if (!Number.isInteger(budget) || budget < 0 || budget > 40) throw new Error('budget must be an integer from 0 to 40.')
  if (!Array.isArray(hierarchy) || hierarchy.length !== n - 1) throw new Error(`hierarchy must list ${n - 1} [boss, employee] pairs.`)
  const indegree = Array(n + 1).fill(0)
  const reports = Array.from({ length: n + 1 }, () => [])
  for (const pair of hierarchy) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(v => Number.isInteger(v) && v >= 1 && v <= n) || pair[0] === pair[1]) throw new Error(`Each pair names two different employees from 1 to ${n}.`)
    const [boss, employee] = pair
    indegree[employee]++
    if (indegree[employee] > 1) throw new Error('Each employee has at most one direct boss.')
    reports[boss].push(employee)
  }
  if (indegree[1] !== 0) throw new Error('Employee 1 is the top boss and has no boss.')
  const reached = new Set([1])
  const queue = [1]
  for (let q = 0; q < queue.length; q++) {
    for (const c of reports[queue[q]]) if (!reached.has(c)) { reached.add(c); queue.push(c) }
  }
  if (reached.size !== n) throw new Error('The hierarchy must form a single tree under employee 1.')
  return { n, present, future, hierarchy, budget }
}

export function buildTrace(input) {
  const { n, present, future, hierarchy, budget } = input
  const reports = Array.from({ length: n }, () => [])
  const edges = hierarchy.map(([boss, employee]) => [boss - 1, employee - 1])
  for (const [boss, employee] of edges) reports[boss].push(employee)
  const zeros = () => Array(budget + 1).fill(0)
  // Max-plus merge of two "at most b" tables: the best split of budget t between two groups.
  const merge = (a, b) => {
    const out = Array(budget + 1)
    for (let t = 0; t <= budget; t++) {
      let best = -Infinity
      for (let x = 0; x <= t; x++) best = Math.max(best, a[t - x] + b[x])
      out[t] = best
    }
    return out
  }
  const frames = []
  const done = []
  const table = {}
  const frame = (phase, line, node, message) => frames.push({ phase, activeLine: line, node, done: [...done], table: { ...table }, message })
  frame('start', L('build the list of direct reports'), null, 'Work from the bottom of the hierarchy. Each employee is decided once the people below them are.')
  const solve = v => {
    let unbought = zeros()
    let bought = zeros()
    for (const c of reports[v]) {
      const [c0, c1] = solve(c)
      unbought = merge(unbought, c0)
      bought = merge(bought, c1)
    }
    const at = (price, b) => (b >= price ? Math.max(unbought[b], future[v] - price + bought[b - price]) : unbought[b])
    const noBoss = Array.from({ length: budget + 1 }, (_, b) => at(present[v], b))
    const bossBought = Array.from({ length: budget + 1 }, (_, b) => at(Math.floor(present[v] / 2), b))
    done.push(v)
    table[v] = { noBoss: noBoss[budget], bossBought: bossBought[budget] }
    frame('combine', L('for each budget b, the no-boss value'), v,
      `Employee ${v + 1} with the full budget: ${noBoss[budget]} if the boss did not buy, ${bossBought[budget]} if the boss bought.`)
    return [noBoss, bossBought]
  }
  const [top] = solve(0)
  const result = top[budget]
  frame('done', L('return employee 1 no-boss table'), null, `The best profit within the budget is ${result}.`)
  return { input, result, frames, edges }
}

export const code = `maximum profit from trading stocks with discounts
  build the list of direct reports for each employee
  call solve on employee 1
  return employee 1 no-boss table at the full budget

solve(v) returns two budget tables, one if the boss did not buy and one if the boss bought
  set the unbought and bought merged tables to zeros
  for each report c of v, do
    solve c and merge its two tables into the two merged tables with max-plus sums
  for each budget b, the no-boss value is the larger of skipping v and buying v at full price
  for each budget b, the boss-bought value is the larger of skipping v and buying v at half price
  return both tables`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_profit(n, present, future, hierarchy, budget):
    reports = [[] for _ in range(n)]
    for boss, employee in hierarchy:
        reports[boss - 1].append(employee - 1)

    def merge(a, b):
        return [max(a[t - x] + b[x] for x in range(t + 1)) for t in range(budget + 1)]

    def solve(v):
        unbought = [0] * (budget + 1)
        bought = [0] * (budget + 1)
        for c in reports[v]:
            c0, c1 = solve(c)
            unbought = merge(unbought, c0)
            bought = merge(bought, c1)

        def table(price):
            return [max(unbought[b], future[v] - price + bought[b - price]) if b >= price else unbought[b]
                    for b in range(budget + 1)]

        return table(present[v]), table(present[v] // 2)

    no_boss, _ = solve(0)
    return no_boss[budget]
`
