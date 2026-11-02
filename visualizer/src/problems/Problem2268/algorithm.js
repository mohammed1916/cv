// LeetCode 2268: Minimum Number of Keypresses.
// Nine keys give 27 slots: slot r sits on key (r mod 9) + 1 and costs floor(r / 9) + 1 presses.
// Letters used more often take earlier (cheaper) slots, so sort the letter counts descending and
// assign them to slots 0, 1, 2, ... in that order.

const MAX_LEN = 26

export function parseInput(text) {
  const word = String(text).trim()
  if (!/^[a-z]{1,26}$/.test(word)) throw new Error(`Enter 1 to ${MAX_LEN} lowercase letters. The visualization caps the length at ${MAX_LEN}.`)
  return { word }
}

export const code = `FUNCTION minKeypresses(word)
    freq ← count of each letter in word
    ranked ← the letter counts sorted from largest to smallest
    total ← 0
    FOR each rank r with count c in ranked
        presses ← floor(r / 9) + 1
        total ← total + c * presses
    RETURN total`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minimum_keypresses(word):
    freq = {}
    for ch in word:
        freq[ch] = freq.get(ch, 0) + 1
    ranked = sorted(freq.values(), reverse=True)
    total = 0
    for rank, count in enumerate(ranked):
        presses = rank // 9 + 1
        total += count * presses
    return total
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'count', label: 'Count', description: 'Count how often each letter appears.' },
  { id: 'place', label: 'Place', description: 'Give the next most frequent letter the next slot.' },
  { id: 'done', label: 'Result', description: 'Total keypresses.' },
]

export function buildTrace({ word }) {
  const freq = new Map()
  for (const ch of word) freq.set(ch, (freq.get(ch) || 0) + 1)
  const ranked = [...freq].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  const frames = []
  frames.push({ phase: 'count', activeLine: L('freq ← count'), pythonLine: P('freq = {}'), message: `${freq.size} distinct letter${freq.size === 1 ? '' : 's'} in the word.`, rank: -1, letter: null, count: 0, presses: 0, slots: [], total: 0 })
  let total = 0
  const slots = []
  ranked.forEach(([letter, count], rank) => {
    const presses = Math.floor(rank / 9) + 1
    total += count * presses
    slots.push({ letter, count, rank, key: (rank % 9) + 1, presses })
    frames.push({ phase: 'place', activeLine: L('total ← total + c'), pythonLine: P('total += count * presses'), message: `${letter} (${count}×) takes slot ${rank}: key ${(rank % 9) + 1}, ${presses} press${presses === 1 ? '' : 'es'} each. Running total ${total}.`, rank, letter, count, presses, slots: slots.slice(), total })
  })
  frames.push({ phase: 'done', activeLine: L('RETURN total'), pythonLine: P('return total'), message: `Minimum keypresses: ${total}.`, rank: -1, letter: null, count: 0, presses: 0, slots: slots.slice(), total })
  return { input: { word }, result: total, frames }
}
