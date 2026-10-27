export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with customers, boardingCost and runningCost.')
  const { customers, boardingCost, runningCost } = data
  if (!Array.isArray(customers) || customers.length < 1 || customers.length > 20) throw new Error('customers holds 1 to 20 groups.')
  if (customers.some(v => !Number.isInteger(v) || v < 0 || v > 50)) throw new Error('Each group size is an integer from 0 to 50.')
  if (!Number.isInteger(boardingCost) || boardingCost < 0 || boardingCost > 100) throw new Error('boardingCost is an integer from 0 to 100.')
  if (!Number.isInteger(runningCost) || runningCost < 0 || runningCost > 100) throw new Error('runningCost is an integer from 0 to 100.')
  return { customers, boardingCost, runningCost }
}

export function buildTrace(input) {
  const { customers, boardingCost, runningCost } = input
  let waiting = 0
  let next = 0
  let profit = 0
  let best = 0
  let bestRotation = -1
  let rotation = 0
  const profits = []
  const frames = [{ phase: 'start', activeLine: L('set waiting to 0'), rotation: 0, waiting, profit, best, bestRotation, profits: [], message: 'No rotations yet. Profit must beat 0 to count.' }]
  while (next < customers.length || waiting > 0) {
    rotation += 1
    if (next < customers.length) waiting += customers[next++]
    const board = Math.min(4, waiting)
    waiting -= board
    profit += board * boardingCost - runningCost
    profits.push(profit)
    const improved = profit > best
    if (improved) {
      best = profit
      bestRotation = rotation
    }
    frames.push({ phase: improved ? 'record' : 'rotate', activeLine: L(improved ? 'if profit is greater than best' : 'board the smaller'), rotation, waiting, profit, best, bestRotation, profits: [...profits],
      message: `Rotation ${rotation}: ${board} board, profit ${profit}. ${improved ? `New best at rotation ${rotation}.` : `Best stays at ${best} (rotation ${bestRotation}).`}` })
  }
  const result = bestRotation
  frames.push({ phase: 'done', activeLine: L('return the best rotation'), rotation, waiting, profit, best, bestRotation, profits: [...profits], message: result === -1 ? 'No rotation makes a profit, so the answer is -1.' : `Best rotation count: ${result}.` })
  return { input, result, frames }
}

export const code = `find the rotation with the most profit
  set waiting to 0, the next group to 0, profit to 0, best to 0, and best rotation to -1
  set rotation to 0
  while customers remain or people are waiting
    add 1 to rotation
    add the next group of customers to the queue, if any
    board the smaller of 4 and the queue, and remove them from the queue
    add boarding income minus running cost to profit
    if profit is greater than best then record profit and rotation as best
  return the best rotation`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_profit_rotations(customers, boardingCost, runningCost):
    waiting = 0
    nxt = 0
    profit = 0
    best = 0
    best_rotation = -1
    rotation = 0
    while nxt < len(customers) or waiting > 0:
        rotation += 1
        if nxt < len(customers):
            waiting += customers[nxt]
            nxt += 1
        board = min(4, waiting)
        waiting -= board
        profit += board * boardingCost - runningCost
        if profit > best:
            best = profit
            best_rotation = rotation
    return best_rotation
`
