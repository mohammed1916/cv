export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with cards and x.')
  const { cards, x } = input
  if (!Array.isArray(cards) || cards.length < 2 || cards.length > 12 || !cards.every(c => typeof c === 'string' && /^[a-z]{2}$/.test(c))) throw new Error('cards has 2 to 12 two-letter lowercase strings.')
  if (typeof x !== 'string' || !/^[a-z]$/.test(x)) throw new Error('x is one lowercase letter.')
  return { cards, x }
}

const total = group => group.reduce((a, b) => a + b, 0)
const largest = group => Math.max(...group)
// Pairs inside one group: letters must differ, so at most half the cards, and never more than all but the largest class.
const insidePairs = group => Math.min(Math.floor(total(group) / 2), total(group) - largest(group))
// Remove p cards, always from the largest class, which keeps the remaining classes as balanced as possible.
function removeLargest(group, p) {
  const copy = [...group]
  for (let t = 0; t < p; t++) copy[copy.indexOf(largest(copy))]--
  return copy
}

export function buildTrace({ cards, x }) {
  const first = Array(26).fill(0)
  const second = Array(26).fill(0)
  let both = 0
  for (const card of cards) {
    if (card === x + x) both++
    else if (card[0] === x) first[card.charCodeAt(1) - 97]++
    else if (card[1] === x) second[card.charCodeAt(0) - 97]++
  }
  const firstTotal = total(first)
  const secondTotal = total(second)
  const summary = { firstTotal, secondTotal, both }
  const frames = [{ phase: 'start', summary, p: -1, q: -1, valA: 0, valB: 0, total: 0, best: 0, result: null, pythonLine: P('first = [0]'), activeLine: L('group the cards that contain x'), message: `${firstTotal} cards start with x, ${secondTotal} end with x, and ${both} are only x.` }]
  let best = 0
  for (let p = 0; p <= Math.min(both, firstTotal); p++) {
    const q = Math.min(both - p, secondTotal)
    const valA = p + insidePairs(removeLargest(first, p))
    const valB = q + insidePairs(removeLargest(second, q))
    const sum = valA + valB
    best = Math.max(best, sum)
    frames.push({ phase: 'option', summary, p, q, valA, valB, total: sum, best, result: null, pythonLine: P('for p in range'), activeLine: L('for each p from 0'), message: `Use ${p} only-x cards with x-first cards and ${q} with x-second cards: ${sum} pairs.` })
  }
  frames.push({ phase: 'done', summary, p: -1, q: -1, valA: 0, valB: 0, total: best, best, result: best, pythonLine: P('return best'), activeLine: L('keep the best total and return it'), message: `Maximum points: ${best}.` })
  return { input: { cards, x }, result: best, frames }
}

export const code = [
  'group the cards that contain x',
  'count x-first cards, x-second cards and cards that are only x',
  'for each p from 0 to the number of only-x cards',
  'pair p x-first cards with only-x cards',
  'give the remaining only-x cards to x-second cards',
  'add the pairs inside each group, using different letters',
  'keep the best total and return it',
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def two_letter_card_game(cards, x):
    first = [0] * 26
    second = [0] * 26
    both = 0
    for card in cards:
        if card == x + x:
            both += 1
        elif card[0] == x:
            first[ord(card[1]) - 97] += 1
        elif card[1] == x:
            second[ord(card[0]) - 97] += 1

    def inside_pairs(group):
        size = sum(group)
        return min(size // 2, size - max(group))

    def remove_largest(group, p):
        group = group[:]
        for _ in range(p):
            group[group.index(max(group))] -= 1
        return group

    best = 0
    for p in range(min(both, sum(first)) + 1):
        q = min(both - p, sum(second))
        total = p + inside_pairs(remove_largest(first, p)) + q + inside_pairs(remove_largest(second, q))
        best = max(best, total)
    return best
`
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1
