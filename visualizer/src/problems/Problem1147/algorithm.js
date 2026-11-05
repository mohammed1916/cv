export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || typeof data.text !== 'string') throw new Error('Use an object with a string text, for example {"text":"ghiabcdefhelloadamhelloabcdefghi"}.')
  if (data.text.length < 1 || data.text.length > 40) throw new Error('text must have 1 to 40 characters.')
  if (!/^[a-z]+$/.test(data.text)) throw new Error('text may contain only lowercase English letters.')
  return { text: data.text }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function longestDecomposition(text) {', 'def longest_decomposition(text):'],
  ['  let count = 0', '    count = 0'],
  ['  let left = 0', '    left = 0'],
  ['  let right = text.length', '    right = len(text)'],
  ['  while (left < right) {', '    while left < right:'],
  ['    let size = 0', '        size = 0'],
  ['    for (let candidate = 1; candidate <= Math.floor((right - left) / 2); candidate++) {', '        for candidate in range(1, (right - left) // 2 + 1):'],
  ['      if (text.slice(left, left + candidate) === text.slice(right - candidate, right)) { size = candidate; break }', '            if text[left:left + candidate] == text[right - candidate:right]: size = candidate; break'],
  ['    }', ''],
  ['    if (size === 0) { count += 1; break }', '        if size == 0: count += 1; break'],
  ['    count += 2', '        count += 2'],
  ['    left += size', '        left += size'],
  ['    right -= size', '        right -= size'],
  ['  }', ''],
  ['  return count', '    return count'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ text }) {
  const frames = []
  let count = 0
  let left = 0
  let right = text.length
  frames.push({ phase: 'start', pythonLine: P('count = 0'), activeLine: L('let count = 0'), left, right, count, result: null, message: `Start with all of ${text}. Each step peels off the shortest equal prefix and suffix.` })
  while (left < right) {
    let size = 0
    for (let candidate = 1; candidate <= Math.floor((right - left) / 2); candidate++) {
      if (text.slice(left, left + candidate) === text.slice(right - candidate, right)) { size = candidate; break }
    }
    if (size === 0) {
      count += 1
      frames.push({ phase: 'middle', pythonLine: P('if size == 0'), activeLine: L('if (size === 0)'), left, right, count, result: null, message: `No prefix matches a suffix in ${text.slice(left, right)}, so it stays as one chunk.` })
      break
    }
    count += 2
    frames.push({ phase: 'pair', pythonLine: P('count += 2'), activeLine: L('count += 2'), left, right, count, result: null, message: `Prefix ${text.slice(left, left + size)} matches the suffix. Two chunks added; count is ${count}.` })
    left += size
    right -= size
  }
  frames.push({ phase: 'done', pythonLine: P('return count'), activeLine: L('return count'), left, right, count, result: count, message: `The longest decomposition has ${count} chunks.` })
  return { input: { text }, result: count, frames }
}
