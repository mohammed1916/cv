export const phases = [
  { id: 'start', label: 'Input', description: 'Read the text, keeping its leading and trailing spaces.' },
  { id: 'count', label: 'Count spaces', description: 'Every space in the text must be placed in the output.' },
  { id: 'split', label: 'Find words', description: 'Words are the non-empty runs of letters.' },
  { id: 'single', label: 'One word', description: 'With one word there are no gaps, so every space goes after it.' },
  { id: 'gap', label: 'Even gaps', description: 'Divide the spaces evenly between words; leftovers go at the end.' },
  { id: 'build', label: 'Join words', description: 'Join the words with the even gap and append the leftover spaces.' },
  { id: 'done', label: 'Return', description: 'Return the rearranged text.' },
]

export const complexity = 'O(n) time for scanning and joining the text. O(n) extra space for the word list and output.'

export const examples = [
  { label: 'Uneven', input: ' quick  brown fox ' },
  { label: 'Single word', input: '   lantern  ' },
  { label: 'Tight', input: 'one two  three' },
]

export function parseInput(text) {
  const s = String(text).replace(/\r?\n$/, '')
  if (!/^[a-z ]{1,100}$/.test(s)) throw new Error('Use 1 to 100 lowercase letters and spaces.')
  if (!/[a-z]/.test(s)) throw new Error('Include at least one word.')
  return s
}

export function buildTrace(text) {
  const frames = []
  const spaces = [...text].filter(c => c === ' ').length
  const words = text.split(' ').filter(Boolean)
  const snap = extra => ({ spaces, words: [...words], gap: null, extra: null, result: null, ...extra })
  frames.push({ phase: 'start', activeLine: 1, message: `Read ${text.length} characters, including leading and trailing spaces.`, snapshot: snap() })
  frames.push({ phase: 'count', activeLine: 2, message: `Count ${spaces} spaces.`, snapshot: snap() })
  frames.push({ phase: 'split', activeLine: 3, message: `Found ${words.length} word${words.length === 1 ? '' : 's'}: ${words.join(' | ')}.`, snapshot: snap() })
  let result
  if (words.length === 1) {
    result = words[0] + ' '.repeat(spaces)
    frames.push({ phase: 'single', activeLine: 4, message: `One word, so all ${spaces} spaces trail it.`, snapshot: snap({ result }) })
    frames.push({ phase: 'done', activeLine: 4, message: 'Return the word followed by all spaces.', snapshot: snap({ result }) })
    return { input: text, result, frames }
  }
  const gaps = words.length - 1
  const gap = Math.floor(spaces / gaps)
  const extra = spaces % gaps
  frames.push({ phase: 'gap', activeLine: 5, message: `${gaps} gaps: each gets ${gap} space${gap === 1 ? '' : 's'}; ${extra} leftover go at the end.`, snapshot: snap({ gap, extra }) })
  result = words.join(' '.repeat(gap)) + ' '.repeat(extra)
  frames.push({ phase: 'build', activeLine: 6, message: `Joined the words, then appended ${extra} trailing space${extra === 1 ? '' : 's'}.`, snapshot: snap({ gap, extra, result }) })
  frames.push({ phase: 'done', activeLine: 7, message: 'Return the rearranged text.', snapshot: snap({ gap, extra, result }) })
  return { input: text, result, frames }
}

export const python = `def reorderSpaces(text):
    spaces = text.count(" ")
    words = text.split()
    if len(words) == 1:
        return words[0] + " " * spaces
    gap, extra = divmod(spaces, len(words) - 1)
    return (" " * gap).join(words) + " " * extra`

export const code = [
  'FUNCTION reorderSpaces(text)',
  '    spaces = count of " " in text',
  '    words = non-empty runs of letters in text',
  '    IF one word RETURN word + spaces',
  '    gap = floor(spaces / (words - 1)); extra = spaces mod (words - 1)',
  '    result = words joined by gap spaces',
  '    RETURN result + extra spaces',
].map((text, index) => ({ line: index + 1, text }))

// Pseudocode line -> Python line.
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 6, 6: 7, 7: 7 }
