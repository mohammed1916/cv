export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with happiness and k.')
  const { happiness, k } = data
  if (!Array.isArray(happiness) || happiness.length < 1 || happiness.length > 8) throw new Error('happiness must have 1 to 8 entries.')
  if (happiness.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('Happiness values are integers from 1 to 1000.')
  if (!Number.isInteger(k) || k < 1 || k > happiness.length) throw new Error('k must be an integer from 1 to the number of children.')
  return { happiness, k }
}

export function buildTrace(input) {
  const ranked = [...input.happiness].sort((a, b) => b - a)
  const { k } = input
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('sort the children'), index: -1, turn: 0, total, message: 'Sort happiness from highest to lowest. Each earlier turn lowers the remaining children by one.' }]
  for (let turn = 0; turn < k; turn++) {
    const gain = Math.max(ranked[turn] - turn, 0)
    total += gain
    frames.push({ phase: 'pick', activeLine: L('add the happiness'), index: turn, turn: turn + 1, total, message: `Turn ${turn + 1}: pick ${ranked[turn]} minus ${turn} earlier turns, gain ${gain}. Total ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, turn: k, total, message: `Maximum happiness: ${total}.` })
  return { input, result: total, frames }
}

export const code = `maximum total happiness from k picks:
  sort the children by happiness, highest first
  set total to zero
  for each turn from zero to k minus one
    the child picked this turn loses one point for each earlier turn
    add the happiness of the pick minus the turn index, never below zero, to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximize_happiness(happiness, k):
    ranked = sorted(happiness, reverse=True)
    total = 0
    for turn in range(k):
        total += max(ranked[turn] - turn, 0)
    return total
`
