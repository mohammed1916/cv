export const phases = [
  { id: 'take', label: 'Take from left', description: 'Start by taking the first k cards from the left end. This is the first candidate total.' },
  { id: 'swap', label: 'Swap an end', description: 'Give back the rightmost card on the left side and take one more card from the right end.' },
  { id: 'record', label: 'Record best', description: 'Keep the larger of the best total so far and the new total.' },
  { id: 'result', label: 'Result', description: 'Return the best total over every way to split k cards between the two ends.' },
]

export const python = `def max_score(cards, k):
    n = len(cards)
    total = sum(cards[:k])
    best = total
    for i in range(k):
        total += cards[n - 1 - i] - cards[k - 1 - i]
        best = max(best, total)
    return best`

const pythonLines = python.split('\n')
export const code = pythonLines.map((text, index) => ({ line: index + 1, text }))
export const pythonLineMap = Object.fromEntries(pythonLines.map((_, index) => [index + 1, index + 1]))

export function parseInput(text) {
  let value
  try { value = JSON.parse(text) } catch { throw new Error('Enter a JSON object such as {"cards": [3, 1, 6], "k": 2}.') }
  if (!value || typeof value !== 'object' || !Array.isArray(value.cards) || !Number.isInteger(value.k)) {
    throw new Error('Enter an object with a "cards" array and an integer "k".')
  }
  const { cards, k } = value
  if (cards.length < 1 || cards.length > 1000) throw new Error('Use 1 to 1000 cards.')
  if (!cards.every(Number.isInteger)) throw new Error('Every card value must be an integer.')
  if (k < 1 || k > cards.length) throw new Error(`k must be from 1 to ${cards.length}.`)
  return { cards: [...cards], k }
}

export function buildTrace({ cards, k }) {
  const frames = []
  const n = cards.length
  let total = cards.slice(0, k).reduce((a, b) => a + b, 0)
  let best = total
  const push = (phase, activeLine, message, extra = {}) => frames.push({
    phase, activeLine, message,
    snapshot: { leftCount: k, rightCount: 0, total, best, added: -1, removed: -1, ...extra },
  })

  push('take', 3, `Take the first ${k} cards from the left. Their total is ${total}.`)
  for (let i = 0; i < k; i++) {
    const removed = k - 1 - i
    const added = n - 1 - i
    total += cards[added] - cards[removed]
    push('swap', 6, `Give back card ${removed} (value ${cards[removed]}) from the left and take card ${added} (value ${cards[added]}) from the right. Total: ${total}.`,
      { leftCount: k - i - 1, rightCount: i + 1, total, added, removed })
    best = Math.max(best, total)
    push('record', 7, `Best so far: ${best}.`, { leftCount: k - i - 1, rightCount: i + 1, total, added, removed })
  }

  push('result', 8, `Done: the best total is ${best}.`, { leftCount: 0, rightCount: 0, total: best, best })
  return { input: { cards, k }, result: best, frames }
}
