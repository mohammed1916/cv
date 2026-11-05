export const phases = [
  { id: 'start', label: 'Need pattern', description: 'One complete copy needs one b, one a, two l, two o and one n.' },
  { id: 'count', label: 'Count letters', description: 'Scan the text and count only the letters the pattern uses.' },
  { id: 'limit', label: 'Bottleneck', description: 'For each letter, supply divided by demand gives the copies that letter allows.' },
  { id: 'done', label: 'Copies', description: 'The smallest per-letter limit is the number of complete copies.' },
]

const NEED = { b: 1, a: 1, l: 2, o: 2, n: 1 }
const LETTERS = Object.keys(NEED)

export function parseInput(text) {
  const data = JSON.parse(text)
  const value = data?.text
  if (typeof value !== 'string' || value.length < 1 || value.length > 200) throw new Error('text must be a string of 1 to 200 characters.')
  if (!/^[a-z]+$/.test(value)) throw new Error('Use lowercase letters a to z only.')
  return { text: value }
}

export function buildTrace({ text }) {
  const frames = []
  const supply = Object.fromEntries(LETTERS.map(letter => [letter, 0]))
  const snap = (extra = {}) => ({ text, need: NEED, supply: { ...supply }, ...extra })

  frames.push({ phase: 'start', activeLine: 2, pythonLine: 2, message: 'One complete copy needs b, a, two l, two o and n. Only those five letters decide the answer.', snapshot: snap({ index: -1 }) })
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch in NEED) supply[ch] += 1
    frames.push({ phase: 'count', activeLine: 5, pythonLine: 5, message: ch in NEED
      ? `Letter ${ch} at position ${i} is used by the pattern; its supply becomes ${supply[ch]}.`
      : `Letter ${ch} at position ${i} is not part of the pattern, so it is ignored.`, snapshot: snap({ index: i }) })
  }

  let copies = Number.POSITIVE_INFINITY
  for (const letter of LETTERS) {
    const limit = Math.floor(supply[letter] / NEED[letter])
    copies = Math.min(copies, limit)
    frames.push({ phase: 'limit', activeLine: 9, pythonLine: 9, message: `${letter}: ${supply[letter]} available, ${NEED[letter]} needed per copy, so at most ${limit} copies. The running answer is ${copies}.`, snapshot: snap({ letter, limit, copies }) })
  }
  frames.push({ phase: 'done', activeLine: 11, pythonLine: 10, message: `The smallest limit is ${copies}, so that many complete copies can be formed.`, snapshot: snap({ copies }) })
  return { input: { text }, result: copies, frames }
}

export const code = `function maxNumberOfBalloons(text) {
  const need = { b: 1, a: 1, l: 2, o: 2, n: 1 }
  const supply = Object.fromEntries(Object.keys(need).map(letter => [letter, 0]))
  for (const ch of text) {
    if (ch in need) supply[ch] += 1
  }
  let copies = Infinity
  for (const letter of Object.keys(need)) {
    copies = Math.min(copies, Math.floor(supply[letter] / need[letter]))
  }
  return copies
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_copies(text):
    need = {"b": 1, "a": 1, "l": 2, "o": 2, "n": 1}
    supply = {letter: 0 for letter in need}
    for ch in text:
        if ch in need:
            supply[ch] += 1
    copies = float("inf")
    for letter in need:
        copies = min(copies, supply[letter] // need[letter])
    return copies`

export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 10 }
