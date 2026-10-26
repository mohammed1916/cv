export function parseInput(text) {
  const p = JSON.parse(text)
  if (!p || typeof p !== 'object' || !Array.isArray(p.hand) || !Number.isInteger(p.groupSize)) throw new Error('Enter JSON like {"hand":[1,2,3,6,2,3,4,7,8],"groupSize":3}.')
  const { hand, groupSize } = p
  if (hand.length < 1 || hand.length > 60 || hand.some(v => !Number.isInteger(v) || v < 0 || v > 1000)) throw new Error('hand must have 1-60 integers between 0 and 1000 (visualization cap: 60 cards).')
  if (groupSize < 1 || groupSize > hand.length) throw new Error('groupSize must be an integer from 1 to the hand length.')
  return { hand, groupSize }
}
export function buildTrace({ hand, groupSize }) {
  const keys = [...new Set(hand)].sort((a, b) => a - b)
  const count = new Map()
  for (const c of hand) count.set(c, (count.get(c) || 0) + 1)
  const snap = () => keys.map(k => count.get(k))
  const frames = []
  const push = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, counts: snap(), card: null, k: null, run: 0, ...extra })
  if (hand.length % groupSize) {
    push('start', 2, `${hand.length} cards cannot be split into groups of ${groupSize} (remainder ${hand.length % groupSize}): return False.`)
    push('done', 2, 'Result: False.')
    return { input: { hand, groupSize }, keys, result: false, frames }
  }
  push('start', 3, `${hand.length} cards split evenly into ${hand.length / groupSize} groups of ${groupSize}. Count each distinct card.`)
  for (const card of keys) {
    const c = count.get(card)
    if (c === 0) { push('skip', 6, `Card ${card} has no copies left (they were used by earlier groups): move on.`, { card }); continue }
    push('run', 6, `The smallest remaining card is ${card} with ${c} cop${c === 1 ? 'y' : 'ies'}. Each must start a straight ${card}..${card + groupSize - 1}, so build ${c} such group${c === 1 ? '' : 's'} at once.`, { card, run: c })
    for (let k = card; k < card + groupSize; k++) {
      const have = count.get(k) || 0
      if (have < c) {
        push('fail', 8, `Need ${c} copies of ${k} but only ${have} remain: this straight cannot be completed. Return False.`, { card, k, run: c })
        push('done', 8, 'Result: False.', { card, k })
        return { input: { hand, groupSize }, keys, result: false, frames }
      }
      count.set(k, have - c)
      push('take', 9, `Take ${c} cop${c === 1 ? 'y' : 'ies'} of ${k}; ${have - c} left.`, { card, k, run: c })
    }
  }
  push('done', 10, 'Every card was consumed by complete straights: return True.')
  return { input: { hand, groupSize }, keys, result: true, frames }
}
export const code = `def isNStraightHand(hand, groupSize):
    if len(hand) % groupSize: return False
    count = Counter(hand)
    for card in sorted(count):
        c = count[card]
        if c > 0:
            for k in range(card, card + groupSize):
                if count[k] < c: return False
                count[k] -= c
    return True`.split('\n').map((text, index) => ({ line: index + 1, text }))
