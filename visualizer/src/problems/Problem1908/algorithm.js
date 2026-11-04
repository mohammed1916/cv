// LeetCode 1908: Game of Nim.
// Input: a JSON array of heap sizes (0 to 15 each, 1 to 6 heaps). Players alternate removing any positive number of
// stones from one heap; a player with no move loses. Return true when the first player wins under optimal play.
// The rule: the first player wins exactly when the XOR of all heap sizes is nonzero.

const CODE_TEXT = `export function firstPlayerWins(heaps) {
  let total = 0 // total ← 0
  for (const heap of heaps) {
    total ^= heap // total ← total XOR heap
  }
  return total !== 0 // RETURN total is not zero
}`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def first_player_wins(heaps):
    total = 0
    for heap in heaps:
        total ^= heap
    return total != 0
`

const PY = python.split('\n')
const L = text => {
  const index = code.findIndex(c => c.text.includes(text))
  if (index < 0) throw new Error(`missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'The running XOR starts at zero.' },
  { id: 'heap', label: 'Heap', description: 'XOR this heap into the running total.' },
  { id: 'answer', label: 'Result', description: 'A nonzero total means the first player wins.' },
]

export function parseInput(text) {
  const heaps = JSON.parse(text)
  if (!Array.isArray(heaps) || heaps.length < 1 || heaps.length > 6) throw new Error('Use a list of 1 to 6 heap sizes.')
  if (!heaps.every(h => Number.isInteger(h) && h >= 0 && h <= 15)) throw new Error('Each heap is an integer from 0 to 15.')
  return heaps
}

export function buildTrace(heaps) {
  const frames = []
  let total = 0
  frames.push({ pythonLine: P('total = 0'), phase: 'start', activeLine: L('total ← 0'), index: -1, heap: null, total, message: 'Start the running XOR at 0.' })
  heaps.forEach((heap, index) => {
    total ^= heap
    frames.push({ pythonLine: P('total ^= heap'), phase: 'heap', activeLine: L('total ← total XOR heap'), index, heap, total, message: `XOR ${heap} into the running total: now ${total}.` })
  })
  const wins = total !== 0
  frames.push({ pythonLine: P('return total != 0'), phase: 'answer', activeLine: L('RETURN total is not zero'), index: heaps.length, heap: null, total, wins, message: wins ? `Total ${total} is nonzero: the first player wins.` : 'Total is zero: the second player wins.' })
  return { input: heaps, result: wins, total, frames }
}
