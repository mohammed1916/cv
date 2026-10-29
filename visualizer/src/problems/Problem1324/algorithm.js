const SENTENCE_PATTERN = /^[A-Z]+(?: [A-Z]+)*$/

export function parseInput(text) {
  let obj
  try { obj = typeof text === 'string' ? JSON.parse(text) : text } catch { throw new Error('Use a JSON object like {"s":"HOW ARE YOU"}.') }
  if (!obj || typeof obj !== 'object' || typeof obj.s !== 'string') throw new Error('Use an object with a string field s.')
  if (obj.s.length < 1 || obj.s.length > 200) throw new Error('s must be 1 to 200 characters long.')
  if (!SENTENCE_PATTERN.test(obj.s)) throw new Error('s must be uppercase letters with single spaces between words (no leading, trailing or double spaces).')
  return { s: obj.s }
}

export const code = [
  { line: 1, text: 'words = split s on single spaces' },
  { line: 2, text: 'width = length of the longest word' },
  { line: 3, text: 'for row from 0 to width - 1:' },
  { line: 4, text: '  build row: character at position row of each word, or a space if that word is shorter' },
  { line: 5, text: '  append row with trailing spaces removed to the answer' },
  { line: 6, text: 'return the answer' },
]

export const python = `def printVertically(s):
    words = s.split(" ")
    width = max(len(word) for word in words)
    result = []
    for r in range(width):
        row = "".join(word[r] if r < len(word) else " " for word in words)
        result.append(row.rstrip())
    return result`

export const pythonLineMap = { 1: 2, 2: 3, 3: 5, 4: 6, 5: 7, 6: 8 }

export function buildTrace(input) {
  const { s } = parseInput(input)
  const words = s.split(' ')
  const width = Math.max(...words.map(word => word.length))
  const result = []
  const frames = []
  const push = (phase, activeLine, message, extra = {}) =>
    frames.push({ phase, activeLine, message, words, result: [...result], ...extra })

  push('split', 1, `Split s into ${words.length} words.`)
  push('measure', 2, `The longest word has ${width} characters, so the answer has ${width} rows.`, { width })
  for (let row = 0; row < width; row += 1) {
    const chars = words.map(word => (row < word.length ? word[row] : ' '))
    const raw = chars.join('')
    push('row', 4, `Row ${row}: take character ${row} of each word; use a space where a word is shorter.`, { row, chars, raw })
    result.push(raw.replace(/ +$/, ''))
    push('trim', 5, `Remove trailing spaces from row ${row} and add it to the answer.`, { row, chars, raw })
  }
  push('done', 6, `Return the ${result.length} rows.`, { result: [...result] })
  return { input: { s }, result: [...result], frames }
}
