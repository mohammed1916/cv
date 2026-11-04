export const phases = [
  { id: 'start', label: 'Start', description: 'S1 is "0". Each level is S(n-1), a center 1, then the reversed inverse of S(n-1).' },
  { id: 'descend', label: 'Left half', description: 'A position left of the center is unchanged in the previous level.' },
  { id: 'mirror', label: 'Right half', description: 'A position right of the center mirrors to 2^n - k and inverts the bit.' },
  { id: 'middle', label: 'Center', description: 'The center bit of every level above one is 1, possibly inverted by earlier mirrors.' },
  { id: 'done', label: 'Complete', description: 'Level one is "0", so the answer is the accumulated inversion parity.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"n": 3, "k": 6}.')
  const { n, k } = input
  if (!Number.isInteger(n) || n < 1 || n > 20) throw new Error('n is an integer from 1 to 20.')
  if (!Number.isInteger(k) || k < 1 || k > 2 ** n - 1) throw new Error(`k is an integer from 1 to ${2 ** n - 1} for this n.`)
  return { n, k }
}

export function buildTrace({ n, k }) {
  const frames = []
  let level = n
  let pos = k
  let flips = 0
  const snap = (extra = {}) => ({ level, pos, flips, ...extra })
  frames.push({ phase: 'start', activeLine: L('let level = n, flips = 0'), pythonLine: P('level, flips = n, 0'), snapshot: snap(), message: `Find position ${k} in S${n}. Track how many inversions the path has passed.` })
  let result = null
  while (level > 1) {
    const mid = 2 ** (level - 1)
    if (pos === mid) {
      result = 1 ^ flips
      frames.push({ phase: 'middle', activeLine: L('if (k === mid)'), pythonLine: P('if k == mid'), snapshot: snap({ mid }), message: `Position ${pos} is the center of S${level}, a 1 with ${flips} inversion(s) applied.` })
      break
    }
    if (pos < mid) {
      frames.push({ phase: 'descend', activeLine: L('if (k < mid)'), pythonLine: P('if k < mid'), snapshot: snap({ mid }), message: `Position ${pos} is left of center ${mid}, so the bit is unchanged in S${level - 1}.` })
      level -= 1
    } else {
      pos = 2 ** level - pos
      flips ^= 1
      frames.push({ phase: 'mirror', activeLine: L('k = 2 ** level - k'), pythonLine: P('k = (1 << level) - k'), snapshot: snap({ mid }), message: `The right half mirrors to position ${pos} in S${level - 1} and inverts the bit.` })
      level -= 1
    }
  }
  if (result === null) {
    result = 0 ^ flips
  }
  frames.push({ phase: 'done', activeLine: L('return flips'), pythonLine: P('return'), snapshot: snap({ result }), message: `Level one is 0, so the bit is ${result}.` })
  return { input: { n, k }, result, frames }
}

export const code = [
  "function kthBit(n, k) {",
  "  let level = n, flips = 0",
  "  while (level > 1) {",
  "    const mid = 2 ** (level - 1)",
  "    if (k === mid) return 1 ^ flips",
  "    if (k < mid) {",
  "      level -= 1",
  "    } else {",
  "      k = 2 ** level - k",
  "      flips ^= 1",
  "      level -= 1 }",
  "  }",
  "  return flips }",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_kth_bit(n, k):
    level, flips = n, 0
    while level > 1:
        mid = 1 << (level - 1)
        if k == mid:
            return 1 ^ flips
        if k < mid:
            level -= 1
        else:
            k = (1 << level) - k
            flips ^= 1
            level -= 1
    return 0 ^ flips
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
