// Convert number words to digits.
// Scan left to right. A digit word starting at the current position is replaced by its digit and the scan
// jumps past the whole word, so letters inside a consumed word are never reconsidered. Otherwise one
// character is skipped. At most one digit word can start at any position.

const CODE_TEXT = `FUNCTION wordsToDigits(s)
    digits ← empty text
    i ← 0
    WHILE i < length of s
        word ← a digit word that starts at position i, if any
        IF word exists THEN
            append its digit to digits
            i ← i + length of word
        ELSE
            i ← i + 1
    RETURN digits`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = key => {
  const index = code.findIndex(entry => entry.text.includes(key))
  if (index < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return index + 1
}

export const python = `DIGIT_WORDS = {"zero": "0", "one": "1", "two": "2", "three": "3", "four": "4",
               "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9"}


def words_to_digits(s):
    digits = []
    i = 0
    while i < len(s):
        match = next((w for w in DIGIT_WORDS if s.startswith(w, i)), None)
        if match is not None:
            digits.append(DIGIT_WORDS[match])
            i += len(match)
        else:
            i += 1
    return "".join(digits)


if __name__ == "__main__":
    import json
    import sys
    print(json.dumps(words_to_digits(json.loads(sys.stdin.read()))))
`

const PY_LINES = python.split('\n')
const P = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing python line: ${key}`)
  return index + 1
}

export const DIGIT_WORDS = { zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9' }

export const phases = [
  { id: 'scan', label: 'Scan', description: 'Look for a digit word at the cursor.' },
  { id: 'match', label: 'Match', description: 'A digit word starts here: emit its digit and jump past it.' },
  { id: 'skip', label: 'Skip', description: 'No digit word starts here: move one character on.' },
  { id: 'done', label: 'Result', description: 'Report the digits found.' },
]

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 40) throw new Error('Use a JSON string of 1 to 40 lowercase letters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('Use lowercase letters only.')
  return s
}

export function buildTrace(s) {
  const frames = []
  const digits = []
  let i = 0
  const push = (phase, line, py, message, extra = {}) => frames.push({
    phase, activeLine: L(line), pythonLine: P(py), message, at: i, digits: digits.join(''), span: null, word: null, ...extra,
  })
  push('scan', 'digits ← empty text', 'digits = []', 'Start at the first character with no digits yet.')
  while (i < s.length) {
    push('scan', 'WHILE i < length of s', 'while i < len(s)', `Cursor at position ${i} ("${s[i]}").`)
    const word = Object.keys(DIGIT_WORDS).find(w => s.startsWith(w, i)) || null
    if (word) {
      digits.push(DIGIT_WORDS[word])
      push('match', 'append its digit to digits', 'digits.append', `"${word}" starts at ${i}: append ${DIGIT_WORDS[word]} and jump ${word.length} characters.`, { word, span: [i, i + word.length - 1] })
      i += word.length
    } else {
      push('skip', 'i ← i + 1', 'i += 1', `No digit word starts at ${i}; skip "${s[i]}".`, { word: null })
      i += 1
    }
  }
  const result = digits.join('')
  push('done', 'RETURN digits', 'return "".join(digits)', `Digits extracted: ${result || '(none)'}.`, { at: s.length, digits: result })
  return { input: s, result, frames }
}
