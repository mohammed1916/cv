export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Array.isArray(data.cards)) throw new Error('Use {"cards": [...]} with 1 to 20 card values.')
  const { cards } = data
  if (cards.length < 1 || cards.length > 20) throw new Error('Use 1 to 20 cards.')
  if (cards.some(c => !Number.isInteger(c) || c < 0 || c > 99)) throw new Error('Card values are integers from 0 to 99.')
  return { cards }
}

export function buildTrace(input) {
  const { cards } = input
  const last = new Map()
  let best = -1
  const frames = [{ phase: 'start', activeLine: L('last is an empty map'), index: -1, runStart: -1, best, maps: [], ops: [], result: best, message: 'No card has been seen yet, so no pair exists.' }]
  const maps = () => [{ name: 'lastSeen', keyLabel: 'card', valueLabel: 'latest index', isSet: false, entries: [...last] }]
  cards.forEach((card, i) => {
    const hit = last.has(card)
    const before = last.get(card)
    const ops = [{ map: 'lastSeen', type: 'lookup', via: 'has', key: card, hit, value: hit ? before : undefined,
      hitNote: 'an earlier copy of this card exists, so the run from it to here is a candidate',
      missNote: 'this is the first copy, so there is no run to measure yet' }]
    if (hit) {
      const length = i - before + 1
      if (best === -1 || length < best) best = length
      frames.push({ phase: 'match', activeLine: L('the run from last of c'), index: i, runStart: before, best, maps: maps(), ops, result: best,
        message: `Card ${card} at index ${i} matches index ${before}. The run has ${length} cards. Best so far: ${best}.` })
    } else {
      frames.push({ phase: 'scan', activeLine: L('if c is in last'), index: i, runStart: -1, best, maps: maps(), ops, result: best,
        message: `Card ${card} at index ${i} is new, so there is no pair to measure yet.` })
    }
    last.set(card, i)
    ops.push({ map: 'lastSeen', type: hit ? 'update' : 'insert', key: card, value: i, before })
    frames[frames.length - 1].maps = maps()
  })
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, runStart: -1, best, maps: maps(), ops: [], result: best,
    message: best === -1 ? 'No card repeats, so the answer is -1.' : `Shortest run with a pair: ${best} cards.` })
  return { input, result: best, frames }
}

export const code = `shortest run of cards that holds a matching pair
last is an empty map from card value to its latest index
best = -1
for each index i with card c
  if c is in last then
    the run from last of c to i has length i minus last of c plus 1
    if best = -1 or the run is shorter than best then
      set best to the run length
  set last of c to i
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_card_pickup(cards):
    last = {}
    best = -1
    for i, card in enumerate(cards):
        if card in last:
            length = i - last[card] + 1
            if best == -1 or length < best:
                best = length
        last[card] = i
    return best
`
