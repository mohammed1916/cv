export const phases = [
  { id: 'start', label: 'Start', description: 'The set of distinct substrings is empty.' },
  { id: 'pick', label: 'Pick substring', description: 'Choose one start and end position; the substring is the text between them.' },
  { id: 'record', label: 'Record text', description: 'Add the text to the set. A text already present is counted once only.' },
  { id: 'done', label: 'Count', description: 'The set size is the number of distinct nonempty substrings.' },
]

// This visualizer enumerates every substring explicitly, so its input is kept short.
const MAX_LENGTH = 30

export function parseInput(text) {
  let value
  try { value = JSON.parse(text) } catch { throw new Error('Enter a JSON string such as "abab".') }
  if (typeof value !== 'string' || !/^[a-z]+$/.test(value)) throw new Error('Use lowercase letters a to z only.')
  if (value.length > MAX_LENGTH) throw new Error(`This visualizer accepts up to ${MAX_LENGTH} letters so every substring stays visible.`)
  return value
}

export function buildTrace(s) {
  const seen = new Set()
  const frames = [{ phase: 'start', activeLine: 2, message: `Start with an empty set for "${s}".`, snapshot: { start: -1, end: -1, text: '', isNew: false, count: 0 } }]
  for (let start = 0; start < s.length; start++) {
    for (let end = start + 1; end <= s.length; end++) {
      const text = s.slice(start, end)
      frames.push({ phase: 'pick', activeLine: 5, message: `Substring s[${start}..${end - 1}] is "${text}".`, snapshot: { start, end, text, isNew: null, count: seen.size } })
      const isNew = !seen.has(text)
      seen.add(text)
      frames.push({ phase: 'record', activeLine: 6, message: isNew ? `"${text}" is new; the count rises to ${seen.size}.` : `"${text}" was already counted; the count stays ${seen.size}.`, snapshot: { start, end, text, isNew, count: seen.size } })
    }
  }
  const result = seen.size
  frames.push({ phase: 'done', activeLine: 7, message: `Return ${result} distinct nonempty substrings.`, snapshot: { start: -1, end: -1, text: '', isNew: false, count: result, result } })
  return { input: s, result, frames }
}

export const python = `def count_distinct_substrings(s):
    seen = set()
    for start in range(len(s)):
        for end in range(start + 1, len(s) + 1):
            seen.add(s[start:end])
    return len(seen)`

export const code = [
  'FUNCTION countDistinctSubstrings(s)',
  '    seen = empty set',
  '    FOR start = 0 TO length - 1',
  '        FOR end = start + 1 TO length',
  '            text = s from start up to end',
  '            ADD text TO seen (repeats change nothing)',
  '    RETURN size of seen',
].map((text, index) => ({ line: index + 1, text }))

// Pseudocode activeLine -> Python line.
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 5, 7: 6 }
