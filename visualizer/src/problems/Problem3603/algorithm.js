export const code = `cheapest walk from the top-left cell to the bottom-right cell
  the first cell costs 1 to enter
  for each cell in row order, skipping the first
    from above: cost of the cell above plus its wait
    from the left: cost of the cell to the left plus its wait
    the first cell charges no wait when you leave it
    keep the cheaper way in, then add this cell's entry cost
  return the cost of the last cell, which never waits`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Pseudocode line missing: ${key}`)
  return index + 1
}

export const python = `def min_cost(m, n, waitCost):
    cost = [[0] * n for _ in range(m)]
    cost[0][0] = 1
    for i in range(m):
        for j in range(n):
            if i == 0 and j == 0:
                continue
            best = float("inf")
            if i > 0:
                wait = 0 if (i - 1, j) == (0, 0) else waitCost[i - 1][j]
                best = min(best, cost[i - 1][j] + wait)
            if j > 0:
                wait = 0 if (i, j - 1) == (0, 0) else waitCost[i][j - 1]
                best = min(best, cost[i][j - 1] + wait)
            cost[i][j] = best + (i + 1) * (j + 1)
    return cost[m - 1][n - 1]
`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Python line missing: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'The walk begins by paying to enter the first cell.' },
  { id: 'above', label: 'From above', description: 'Price the way in from the cell above.' },
  { id: 'left', label: 'From left', description: 'Price the way in from the cell to the left.' },
  { id: 'settle', label: 'Settle', description: 'Keep the cheaper way in and add the entry cost.' },
  { id: 'answer', label: 'Answer', description: 'The last cell holds the minimum total.' },
  { id: 'walk', label: 'Walk', description: 'Replay the cheapest walk second by second.' },
]

export const inputLabel = 'Object with m, n and waitCost (m rows of n integers)'
export const complexity = 'O(m n) time and O(m n) space, or one row of space if the path is not needed. The official grid has up to 100000 cells; the visualization caps it at 36 cells.'
export const examples = [
  { label: '3 by 3 grid', input: '{"m":3,"n":3,"waitCost":[[2,7,1],[4,3,8],[6,2,5]]}' },
  { label: 'Single row', input: '{"m":1,"n":3,"waitCost":[[5,0,9]]}' },
  { label: 'Big waits steer it', input: '{"m":3,"n":2,"waitCost":[[8,40],[30,2],[1,6]]}' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with m, n and waitCost.')
  const { m, n, waitCost } = input
  if (!Number.isInteger(m) || !Number.isInteger(n) || m < 1 || n < 1) throw new Error('m and n are positive integers.')
  if (m * n < 2) throw new Error('The grid needs at least 2 cells.')
  if (m * n > 36) throw new Error('This visualization shows at most 36 cells.')
  if (!Array.isArray(waitCost) || waitCost.length !== m) throw new Error('waitCost needs m rows.')
  for (const row of waitCost) {
    if (!Array.isArray(row) || row.length !== n) throw new Error('Each waitCost row needs n entries.')
    for (const value of row) if (!Number.isInteger(value) || value < 0 || value > 100000) throw new Error('Each wait is an integer from 0 to 100000.')
  }
  return { m, n, waitCost }
}

export function buildTrace({ m, n, waitCost }) {
  const frames = []
  const cost = Array.from({ length: m }, () => new Array(n).fill(null))
  const from = Array.from({ length: m }, () => new Array(n).fill(null))
  const enter = (i, j) => (i + 1) * (j + 1)
  const leaveCost = (i, j) => (i === 0 && j === 0 ? 0 : waitCost[i][j])
  const push = (phase, lineKey, pyKey, message, extra = {}) => frames.push({
    phase, activeLine: L(lineKey), pythonLine: PY(pyKey), message,
    cost: cost.map(row => [...row]), from: from.map(row => [...row]),
    cell: null, above: null, left: null, chosen: null, path: [], ledger: [], total: null, ...extra,
  })

  cost[0][0] = 1
  push('start', 'first cell costs', 'cost[0][0] = 1', 'Entering the first cell costs 1 × 1 = 1. There is nothing to wait for before the first move.', { cell: [0, 0] })

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (i === 0 && j === 0) continue
      let above = null
      let left = null
      if (i > 0) {
        const wait = leaveCost(i - 1, j)
        above = { cost: cost[i - 1][j], wait, total: cost[i - 1][j] + wait }
        const note = i - 1 === 0 && j === 0 ? 'the first cell charges no wait' : `wait ${wait}`
        push('above', i - 1 === 0 && j === 0 ? 'the first cell charges' : 'from above', 'cost[i - 1][j] + wait', `Into (${i}, ${j}) from above: ${above.cost} so far, ${note}, gives ${above.total}.`, { cell: [i, j], above })
      }
      if (j > 0) {
        const wait = leaveCost(i, j - 1)
        left = { cost: cost[i][j - 1], wait, total: cost[i][j - 1] + wait }
        const note = i === 0 && j - 1 === 0 ? 'the first cell charges no wait' : `wait ${wait}`
        push('left', i === 0 && j - 1 === 0 ? 'the first cell charges' : 'from the left', 'cost[i][j - 1] + wait', `Into (${i}, ${j}) from the left: ${left.cost} so far, ${note}, gives ${left.total}.`, { cell: [i, j], above, left })
      }
      const chosen = !left || (above && above.total <= left.total) ? 'above' : 'left'
      const way = chosen === 'above' ? above : left
      cost[i][j] = way.total + enter(i, j)
      from[i][j] = chosen
      const comparison = above && left ? `${chosen === 'above' ? 'Above' : 'Left'} is ${above.total === left.total ? 'tied, so it is kept' : 'cheaper'}. ` : `Only one way in. `
      push('settle', 'keep the cheaper', 'cost[i][j] = best', `${comparison}${way.total} + entry ${i + 1} × ${j + 1} = ${cost[i][j]}.`, { cell: [i, j], above, left, chosen })
    }
  }

  const result = cost[m - 1][n - 1]
  const path = []
  for (let i = m - 1, j = n - 1; ;) {
    path.unshift([i, j])
    if (i === 0 && j === 0) break
    if (from[i][j] === 'above') i--
    else j--
  }
  const last = [m - 1, n - 1]
  push('answer', 'return the cost', 'return cost[m - 1][n - 1]', `The last cell is done on arrival, so its own wait of ${waitCost[m - 1][n - 1]} is never paid. The minimum total is ${result}.`, { cell: last, path })

  // Replay: odd seconds move, even seconds wait, exactly as the walk is charged.
  const ledger = [{ second: null, kind: 'enter', at: [0, 0], amount: 1 }]
  let total = 1
  push('walk', 'return the cost', 'return cost[m - 1][n - 1]', 'The walk begins by entering the first cell for 1.', { cell: [0, 0], path, ledger: ledger.map(e => ({ ...e })), total })
  let second = 1
  for (let k = 1; k < path.length; k++) {
    const [pi, pj] = path[k - 1]
    if (k > 1) {
      total += waitCost[pi][pj]
      ledger.push({ second, kind: 'wait', at: [pi, pj], amount: waitCost[pi][pj] })
      push('walk', 'return the cost', 'return cost[m - 1][n - 1]', `Second ${second} is even: wait on (${pi}, ${pj}) for ${waitCost[pi][pj]}. Total ${total}.`, { cell: [pi, pj], path, ledger: ledger.map(e => ({ ...e })), total })
      second++
    }
    const [i, j] = path[k]
    total += enter(i, j)
    ledger.push({ second, kind: 'move', at: [i, j], amount: enter(i, j) })
    push('walk', 'return the cost', 'return cost[m - 1][n - 1]', `Second ${second} is odd: move to (${i}, ${j}) for ${enter(i, j)}. Total ${total}.`, { cell: [i, j], path, ledger: ledger.map(e => ({ ...e })), total })
    second++
  }
  return { input: { m, n, waitCost }, result, frames }
}
