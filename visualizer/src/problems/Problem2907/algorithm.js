export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with prices and profits lists.')
  const { prices, profits } = input
  if (!Array.isArray(prices) || !Array.isArray(profits) || prices.length < 1 || prices.length > 8) throw new Error('prices and profits each have 1 to 8 entries.')
  if (prices.length !== profits.length) throw new Error('prices and profits must have the same length.')
  const inRange = v => Number.isInteger(v) && v >= -30 && v <= 30
  if (!prices.every(inRange) || !profits.every(inRange)) throw new Error('Each value is an integer from -30 to 30.')
  return { prices, profits }
}

export function buildTrace({ prices, profits }) {
  const n = prices.length
  const frames = []
  let best = null
  let bestTriple = null
  const frame = (phase, pythonLine, text, state, message) =>
    frames.push({ phase, pythonLine, activeLine: L(text), best, bestTriple, ...state, message })

  frame('start', 2, 'set best to none', { j: -1, scan: -1, leftBest: null, rightBest: null }, 'No triplet has been found yet.')
  for (let j = 0; j < n; j++) {
    frame('middle', 4, 'for each middle index j', { j, scan: -1, leftBest: null, rightBest: null }, `Use index ${j} as the middle of the triplet.`)
    let left = null
    let leftAt = -1
    for (let i = 0; i < j; i++) {
      if (prices[i] < prices[j] && (left === null || profits[i] > left)) {
        left = profits[i]
        leftAt = i
      }
      const qualifies = prices[i] < prices[j]
      frame('left', 7, 'left is the largest profit', { j, scan: i, leftBest: left, rightBest: null },
        qualifies ? `prices[${i}] = ${prices[i]} is below ${prices[j]}; the left best is ${left}.` : `prices[${i}] = ${prices[i]} is not below ${prices[j]}, so it is skipped.`)
    }
    let right = null
    let rightAt = -1
    for (let k = j + 1; k < n; k++) {
      if (prices[k] > prices[j] && (right === null || profits[k] > right)) {
        right = profits[k]
        rightAt = k
      }
      const qualifies = prices[k] > prices[j]
      frame('right', 11, 'right is the largest profit', { j, scan: k, leftBest: left, rightBest: right },
        qualifies ? `prices[${k}] = ${prices[k]} is above ${prices[j]}; the right best is ${right}.` : `prices[${k}] = ${prices[k]} is not above ${prices[j]}, so it is skipped.`)
    }
    if (left !== null && right !== null) {
      const total = left + profits[j] + right
      frame('combine', 14, 'if both exist', { j, scan: -1, leftBest: left, rightBest: right }, `Total ${left} + ${profits[j]} + ${right} = ${total}.`)
      if (best === null || total > best) {
        best = total
        bestTriple = [leftAt, j, rightAt]
        frame('best', 16, 'keep the largest total', { j, scan: -1, leftBest: left, rightBest: right }, `New best ${best} from indices ${leftAt}, ${j} and ${rightAt}.`)
      }
    } else {
      frame('skip', 13, 'if both exist', { j, scan: -1, leftBest: left, rightBest: right }, `Index ${j} lacks a left or right partner.`)
    }
  }
  const result = best === null ? -1 : best
  frame('done', 17, 'return best or -1', { j: -1, scan: -1, leftBest: null, rightBest: null }, result === -1 ? 'No strictly increasing triplet exists.' : `The best triplet profit is ${result}.`)
  return { input: { prices, profits }, result, frames }
}

export const code = `maximum profit triplet or -1
  set best to none
  for each middle index j
    left is the largest profit with a smaller price before j
    right is the largest profit with a larger price after j
    if both exist, total is left plus profits at j plus right
    keep the largest total in best
  return best or -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def max_profitable_triplet(prices, profits):
    best = None
    n = len(prices)
    for j in range(n):
        left = None
        for i in range(j):
            if prices[i] < prices[j] and (left is None or profits[i] > left):
                left = profits[i]
        right = None
        for k in range(j + 1, n):
            if prices[k] > prices[j] and (right is None or profits[k] > right):
                right = profits[k]
        if left is not None and right is not None:
            total = left + profits[j] + right
            if best is None or total > best:
                best = total
    return -1 if best is None else best
`
