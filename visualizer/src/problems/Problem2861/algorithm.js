export function parseInput(text) {
  const input = JSON.parse(text)
  const { n, k, budget, composition, stock, cost } = input ?? {}
  if (!Number.isInteger(n) || n < 1 || n > 3) throw new Error('n is the number of metals, an integer from 1 to 3.')
  if (!Number.isInteger(k) || k < 1 || k > 3) throw new Error('k is the number of machines, an integer from 1 to 3.')
  if (!Number.isInteger(budget) || budget < 0 || budget > 50) throw new Error('budget is an integer from 0 to 50.')
  if (!Array.isArray(composition) || composition.length !== k || composition.some(row => !Array.isArray(row) || row.length !== n || row.some(v => !Number.isInteger(v) || v < 1 || v > 10))) throw new Error('composition has k rows of n integers from 1 to 10.')
  if (!Array.isArray(stock) || stock.length !== n || stock.some(v => !Number.isInteger(v) || v < 0 || v > 100)) throw new Error('stock has n integers from 0 to 100.')
  if (!Array.isArray(cost) || cost.length !== n || cost.some(v => !Number.isInteger(v) || v < 1 || v > 3)) throw new Error('cost has n integers from 1 to 3.')
  return { n, k, budget, composition, stock, cost }
}

// Money needed on one machine to make `alloys` alloys, given the stock already held.
function priceOn(machine, alloys, input) {
  let spent = 0
  for (let metal = 0; metal < input.n; metal++) {
    const need = input.composition[machine][metal] * alloys - input.stock[metal]
    if (need > 0) spent += need * input.cost[metal]
  }
  return spent
}

export function buildTrace(input) {
  const { n, k, budget, stock } = input
  let low = 0, high = Math.min(...stock) + budget
  const frames = [{ phase: 'start', activeLine: L('set low to zero'), low, high, mid: null, machine: null, spent: null, message: `Zero alloys always works. The answer cannot exceed the smallest stock plus the budget.` }]
  const feasible = alloys => {
    for (let machine = 0; machine < k; machine++) {
      const spent = priceOn(machine, alloys, input)
      frames.push({ phase: 'check', activeLine: L('set spent to zero'), low, high, mid: alloys, machine, spent, message: `Machine ${machine} needs ${spent} for ${alloys} alloys against a budget of ${budget}.` })
      if (spent <= budget) return true
    }
    return false
  }
  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2)
    if (feasible(mid)) low = mid
    else high = mid - 1
    frames.push({ phase: 'probe', activeLine: L('if some machine can afford'), low, high, mid, machine: null, spent: null, message: `${mid} alloys ${low >= mid ? 'can' : 'cannot'} be made, so the range is now ${low} to ${high}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return low'), low, high, mid: null, machine: null, spent: null, message: `The most alloys is ${low}.` })
  return { input: { n, k, budget, composition: input.composition, stock, cost: input.cost }, result: low, frames }
}

export const code = `maximum number of alloys (n, k, budget, composition, stock, cost)
  set low to zero and high to the smallest stock plus budget
  while low is below high
    set mid to the middle of low and high rounded up
    if some machine can afford mid alloys then set low to mid
    otherwise set high to mid minus one
  return low
affordable on a machine (machine, alloys)
  set spent to zero
  for each metal
    set need to the composition times alloys minus stock
    if need is above zero then add need times its cost to spent
  return spent`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_number_of_alloys(n, k, budget, composition, stock, cost):
    def affordable(machine, alloys):
        spent = 0
        for metal in range(n):
            need = composition[machine][metal] * alloys - stock[metal]
            if need > 0:
                spent += need * cost[metal]
        return spent <= budget
    def feasible(alloys):
        return any(affordable(machine, alloys) for machine in range(k))
    low = 0
    high = min(stock) + budget
    while low < high:
        mid = (low + high + 1) // 2
        if feasible(mid):
            low = mid
        else:
            high = mid - 1
    return low
`
