const SUITS = 'abcd'

export function parseInput(text) {
  const data = JSON.parse(text)
  const { ranks, suits } = data ?? {}
  if (!Array.isArray(ranks) || ranks.length !== 5 || ranks.some(r => !Number.isInteger(r) || r < 1 || r > 13)) throw new Error('ranks must be five integers from 1 to 13.')
  if (!Array.isArray(suits) || suits.length !== 5 || suits.some(x => typeof x !== 'string' || x.length !== 1 || !SUITS.includes(x))) throw new Error('suits must be five letters from a to d.')
  return { ranks, suits }
}

export const code = `best poker hand from five cards
  if every suit is the same then
    return Flush
  set most to the largest number of cards that share a rank
  if most is at least 3 then
    return Three of a Kind
  if most is 2 then
    return Pair
  return High Card`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ ranks, suits }) {
  const flush = new Set(suits).size === 1
  const frames = [{ phase: 'start', index: -1, flush: null, most: null, activeLine: L('if every suit is the same'), message: 'Check whether all five cards share a suit.' }]
  if (flush) {
    frames.push({ phase: 'flush', index: -1, flush, most: null, activeLine: L('return Flush'), message: 'All five cards share a suit, so the hand is a Flush.' })
    frames.push({ phase: 'done', index: -1, flush, most: null, activeLine: L('return Flush'), message: 'Result: Flush.' })
    return { input: { ranks, suits }, result: 'Flush', frames }
  }
  frames.push({ phase: 'flush', index: -1, flush, most: null, activeLine: L('set most to'), message: 'The suits differ, so the hand cannot be a Flush.' })
  let most = 0
  ranks.forEach((r, i) => {
    most = Math.max(most, ranks.filter(x => x === r).length)
    frames.push({ phase: 'rank', index: i, flush, most, activeLine: L('set most to'), message: `Card ${i + 1} has rank ${r}; the largest rank group so far is ${most}.` })
  })
  let result
  if (most >= 3) result = 'Three of a Kind'
  else if (most === 2) result = 'Pair'
  else result = 'High Card'
  frames.push({ phase: 'done', index: -1, flush, most, activeLine: L('if most is at least 3'), message: `Largest rank group is ${most}, so the hand is ${result}.` })
  return { input: { ranks, suits }, result, frames }
}

export const python = `def best_poker_hand(ranks, suits):
    if len(set(suits)) == 1:
        return 'Flush'
    most = max(ranks.count(r) for r in ranks)
    if most >= 3:
        return 'Three of a Kind'
    if most == 2:
        return 'Pair'
    return 'High Card'
`
