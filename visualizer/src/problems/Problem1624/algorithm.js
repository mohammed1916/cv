export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with no letters seen and no best gap.' },
  { id: 'first', label: 'First sighting', description: 'Remember where a letter first appears.' },
  { id: 'gap', label: 'Repeat found', description: 'A letter repeats, so the letters strictly between the two copies form a candidate.' },
  { id: 'done', label: 'Result', description: 'Report the best gap, or -1 when no letter repeats.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"s": "abcabc"}.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 50) throw new Error('s must be a string of 1 to 50 characters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('Use lowercase letters only.')
  return { s }
}

// Lines of the solver the story points at (1-based, matching `code` below).
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export function buildTrace({ s }) {
  const frames = []
  const first = new Map()
  let best = -1
  const at = (pseudo, py) => ({ activeLine: L(pseudo), pythonLine: P(py) })
  const snap = (i, ch, gap = null) => ({
    i, ch, gap, best, first: [...first].map(([letter, index]) => ({ letter, index })),
  })

  frames.push({ phase: 'start', ...at('first = empty map', 'first = {}'), message: `Scan ${s.length} letters from left to right, keeping the first position of each letter seen so far.`, snapshot: snap(null, null) })
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (first.has(ch)) {
      const gap = i - first.get(ch) - 1
      best = Math.max(best, gap)
      frames.push({ phase: 'gap', ...at('best = max(best, i - first[ch] - 1)', 'best = max(best, i - first[ch] - 1)'),
        message: `'${ch}' at ${i} repeats the copy at ${first.get(ch)}. The letters between them number ${gap}, so the best is now ${best}.`,
        snapshot: snap(i, ch, { from: first.get(ch), to: i }) })
    } else {
      first.set(ch, i)
      frames.push({ phase: 'first', ...at('first[ch] = i', 'first[ch] = i'),
        message: `First sighting of '${ch}' at ${i}. Store that position.`, snapshot: snap(i, ch) })
    }
  }
  frames.push({ phase: 'done', ...at('return best', 'return best'),
    message: best >= 0 ? `The longest gap between two equal letters has ${best} letters.` : 'No letter repeats, so the answer is -1.',
    snapshot: snap(null, null) })
  return { input: { s }, result: best, frames }
}

export const code = `longest gap (s):
  first = empty map
  best = -1
  for i, ch in s:
    if ch in first:
      best = max(best, i - first[ch] - 1)
    else:
      first[ch] = i
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_gap_between_equal(s):
    first = {}
    best = -1
    for i, ch in enumerate(s):
        if ch in first:
            best = max(best, i - first[ch] - 1)
        else:
            first[ch] = i
    return best
`
