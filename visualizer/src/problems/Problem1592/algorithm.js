// Rearrange spaces: keep the words, share the spaces equally between gaps, put the remainder at the end.
const JS_LINES = [
  { text: 'const words = text.split(" ").filter(Boolean)', py: 'words = text.split()' },
  { text: 'const spaces = text.split("").filter(c => c === " ").length', py: 'spaces = text.count' },
  { text: 'if (words.length === 1) return words[0] + " ".repeat(spaces)', py: 'if len(words) == 1' },
  { text: 'const gap = Math.floor(spaces / (words.length - 1))', py: 'gap, extra = divmod' },
  { text: 'const extra = spaces % (words.length - 1)', py: 'gap, extra' },
  { text: 'let out = words.join(" ".repeat(gap))', py: 'return (' },
  { text: 'return out + " ".repeat(extra)', py: 'return (' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def reorderSpaces(text):
    words = text.split()
    spaces = text.count(' ')
    if len(words) == 1:
        return words[0] + ' ' * spaces
    gap, extra = divmod(spaces, len(words) - 1)
    return (' ' * gap).join(words) + ' ' * extra
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(
  JS_LINES.map((line, i) => [i + 1, pyAt(line.py)]),
)

export const phases = [
  { id: 'scan', label: 'Scan', description: 'Read each character: letters belong to words, spaces are counted.' },
  { id: 'share', label: 'Share', description: 'Divide the spaces by the number of gaps; the remainder goes at the end.' },
  { id: 'build', label: 'Build', description: 'Place each word, then the equal gap, until the last word.' },
  { id: 'done', label: 'Result', description: 'The rebuilt text has the same length as the input.' },
]

export const examples = [
  { label: 'Uneven spread', input: ' red  green blue ' },
  { label: 'Remainder at end', input: ' sun moon stars' },
  { label: 'Single word', input: '  alpha  ' },
    { label: "Single word, padded", input: "  hello  " },
    { label: "One space between two words", input: "a b" },
    { label: "Single letter, wide margins", input: "   x   " },
    { label: "Hundred characters", input: "abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc abc " },
    { label: "Long run: scattered spaces", input: "y   ff  ppp  j  cc  rrr  m  cc  www  d gg  nnn a  ww ggg  r " },
]

export const complexity = 'O(n) time and O(n) space for a text of n characters.'

export function parseInput(text) {
  if (typeof text !== 'string') throw new Error('Enter the text as a string.')
  if (text.length < 1 || text.length > 100) throw new Error('The text must be 1 to 100 characters long.')
  if (!/^[a-z ]+$/.test(text)) throw new Error('Use lowercase letters and spaces only.')
  if (!/[a-z]/.test(text)) throw new Error('The text must contain at least one word.')
  return text
}

export function buildTrace(text) {
  const frames = []
  const words = text.split(' ').filter(Boolean)
  const chars = [...text]
  let spaces = 0
  let scanned = 0
  const snap = extra => ({ words: words.length, spaces, scanned, ...extra })
  frames.push({ phase: 'scan', activeLine: 1, index: -1, message: 'Begin reading the text left to right.', snapshot: snap({}) })
  chars.forEach((c, i) => {
    if (c === ' ') spaces++
    scanned = i + 1
    frames.push({ phase: 'scan', activeLine: 2, index: i, message: c === ' ' ? `Position ${i} is a space; ${spaces} spaces so far.` : `Position ${i} belongs to a word.`, snapshot: snap({}) })
  })

  let gap = 0
  let extra = 0
  let out = ''
  if (words.length === 1) {
    out = words[0] + ' '.repeat(spaces)
    frames.push({ phase: 'share', activeLine: 3, index: -1, gap: 0, extra: spaces, message: 'One word has no gaps, so all spaces trail it.', snapshot: snap({ gap: 0, extra: spaces, out }) })
  } else {
    gap = Math.floor(spaces / (words.length - 1))
    extra = spaces % (words.length - 1)
    frames.push({ phase: 'share', activeLine: 4, index: -1, gap, extra, message: `${spaces} spaces over ${words.length - 1} gaps: ${gap} each, ${extra} left over.`, snapshot: snap({ gap, extra }) })
    out = words.map((w, i) => (i === 0 ? w : ' '.repeat(gap) + w)).join('')
    words.forEach((w, i) => {
      const partial = words.slice(0, i + 1).map((x, j) => (j === 0 ? x : ' '.repeat(gap) + x)).join('')
      frames.push({ phase: 'build', activeLine: 6, index: i, gap, extra, message: i === 0 ? `Place "${w}" first.` : `Add a gap of ${gap} and then "${w}".`, snapshot: snap({ placed: i + 1, out: partial }) })
    })
    out += ' '.repeat(extra)
    frames.push({ phase: 'build', activeLine: 7, index: -1, gap, extra, message: `Add the ${extra} leftover spaces at the end.`, snapshot: snap({ placed: words.length, out }) })
  }
  frames.push({ phase: 'done', activeLine: 7, index: -1, gap, extra, message: `Result has length ${out.length}, the same as the input.`, result: out, snapshot: snap({ out, length: out.length }) })
  return { input: text, result: out, words, spaces, gap, extra, frames }
}
