export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a prices list.')
  const { prices } = input
  if (!Array.isArray(prices) || prices.length < 1 || prices.length > 20) throw new Error('prices has 1 to 20 entries.')
  if (!prices.every(p => Number.isInteger(p) && p >= 1 && p <= 30)) throw new Error('Each price is an integer from 1 to 30.')
  return { prices }
}

// Fruits are numbered from 1. Buying fruit i covers fruits i+1 .. 2i. cost[i] is the cheapest way to obtain
// fruits i .. n when fruit i is bought. The next bought fruit j must lie in [i+1, 2i+1], so cost[i] = price[i] + min cost[j].
// The window slides left as i falls. A monotone deque keeps costs non-increasing from front to back,
// so the cheapest surviving candidate is always at the back, the end that expires first.
export function buildTrace({ prices }) {
  const n = prices.length
  const cost = Array(n + 2).fill(0)
  const deque = [n + 1]
  const frames = []
  const snap = () => deque.map(index => ({ index, cost: cost[index] }))
  const push = (phase, pythonLine, text, i, window, message) =>
    frames.push({ phase, pythonLine, activeLine: L(text), i, window, deque: snap(), costs: cost.slice(1, n + 2), message })

  push('start', 5, 'cost of the empty tail', -1, null, `Fruit ${n + 1} is a zero-cost sentinel. The deque holds it.`)
  for (let i = n; i >= 1; i--) {
    if (i + 1 <= n) {
      while (deque.length && cost[deque[0]] >= cost[i + 1]) deque.shift()
      deque.unshift(i + 1)
      push('push', 10, 'add fruit i plus one', i, [i + 1, Math.min(n + 1, 2 * i + 1)],
        `Fruit ${i + 1} becomes a candidate; candidates at least as costly are dropped, so costs rise toward the front.`)
    }
    let popped = 0
    while (deque[deque.length - 1] > 2 * i + 1) {
      deque.pop()
      popped++
    }
    push('expire', 12, 'drop candidates beyond', i, [i + 1, Math.min(n + 1, 2 * i + 1)],
      popped ? `Buying fruit ${i} reaches up to fruit ${2 * i}; ${popped} candidate${popped === 1 ? '' : 's'} beyond it dropped.` : `Every candidate still fits the reach of fruit ${i}.`)
    cost[i] = prices[i - 1] + cost[deque[deque.length - 1]]
    push('compute', 13, 'cost of i is prices', i, [i + 1, Math.min(n + 1, 2 * i + 1)],
      `Cost of buying from fruit ${i} on: ${prices[i - 1]} + ${cost[deque[deque.length - 1]]} = ${cost[i]}.`)
  }
  const result = cost[1]
  frames.push({ phase: 'done', pythonLine: 14, activeLine: L('return cost of fruit one'), i: 0, window: null, deque: snap(), costs: cost.slice(1, n + 2), message: `The minimum cost to obtain every fruit is ${result}.` })
  return { input: { prices }, result, frames }
}

export const code = `minimum coins to obtain every fruit
  cost of the empty tail is zero and the deque holds index n plus one
  for i from the last fruit down to the first
    add fruit i plus one at the front, dropping front candidates that cost at least as much
    drop candidates beyond index 2i plus one
    cost of i is prices of i plus the cheapest candidate at the back
  return cost of fruit one`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `from collections import deque
def min_coins_for_fruits(prices):
    n = len(prices)
    cost = [0] * (n + 2)
    window = deque([n + 1])
    for i in range(n, 0, -1):
        if i + 1 <= n:
            while window and cost[window[0]] >= cost[i + 1]:
                window.popleft()
            window.appendleft(i + 1)
        while window[-1] > 2 * i + 1:
            window.pop()
        cost[i] = prices[i - 1] + cost[window[-1]]
    return cost[1]
`
