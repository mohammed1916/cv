// Find the kth character in an expanded string.
// Each word expands on its own: its character at 1-based position t is repeated t times, so a word of
// length m expands to m(m + 1) / 2 characters. Expanded words are joined by one space. The walk subtracts
// whole blocks until k lands inside one of them.

const CODE_TEXT = `FUNCTION kthCharacter(words, k)
    position ← k
    FOR each word at index w
        IF w > 0 THEN
            IF position = 0 THEN RETURN space
            position ← position - 1
        size ← length × (length + 1) / 2
        IF position < size THEN
            FOR t from 0 to length - 1
                block ← t + 1
                IF position < block THEN RETURN word[t]
                position ← position - block
        position ← position - size
    RETURN error (k is out of range)`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = key => {
  const index = code.findIndex(entry => entry.text.includes(key))
  if (index < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return index + 1
}

export const python = `def kth_character(words, k):
    position = k
    for index, word in enumerate(words):
        if index > 0:
            if position == 0:
                return " "
            position -= 1
        size = len(word) * (len(word) + 1) // 2
        if position < size:
            for t, ch in enumerate(word):
                block = t + 1
                if position < block:
                    return ch
                position -= block
        position -= size
    raise ValueError("k is outside the expanded string")


if __name__ == "__main__":
    import json
    import sys
    data = json.loads(sys.stdin.read())
    print(json.dumps(kth_character(data["words"], data["k"])))
`

const PY_LINES = python.split('\n')
const P = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing python line: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Index', description: 'Start with the requested zero-based index.' },
  { id: 'space', label: 'Space', description: 'A single space sits between expanded words.' },
  { id: 'skip', label: 'Skip block', description: 'The index is past this expanded word; subtract its length.' },
  { id: 'locate', label: 'Locate', description: 'The index is inside this word; find the letter.' },
  { id: 'done', label: 'Answer', description: 'Return the character.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with words and k.')
  const { words, k } = input
  if (!Array.isArray(words) || words.length < 1 || words.length > 8) throw new Error('words has 1 to 8 entries.')
  if (!words.every(w => typeof w === 'string' && /^[a-z]{1,6}$/.test(w))) throw new Error('Each word is 1 to 6 lowercase letters.')
  const total = words.reduce((sum, w) => sum + (w.length * (w.length + 1)) / 2, 0) + words.length - 1
  if (!Number.isInteger(k) || k < 0 || k >= total) throw new Error(`k must be an integer from 0 to ${total - 1}.`)
  return { words, k }
}

export function buildTrace({ words, k }) {
  const frames = []
  const total = words.reduce((sum, w) => sum + (w.length * (w.length + 1)) / 2, 0) + words.length - 1
  let position = k
  const push = (phase, line, py, message, extra = {}) => frames.push({
    phase, activeLine: L(line), pythonLine: P(py), message, position, word: -1, block: -1, total, letter: null, ...extra,
  })
  push('start', 'position ← k', 'position = k', `Expanded string has ${total} characters; looking for index ${k}.`)
  let result = null
  for (let w = 0; w < words.length && result === null; w += 1) {
    if (w > 0) {
      if (position === 0) {
        result = ' '
        push('space', 'IF position = 0 THEN RETURN space', 'return " "', `Index lands on the space before word ${w + 1}.`, { word: w, letter: ' ' })
        break
      }
      position -= 1
      push('space', 'position ← position - 1', 'position -= 1', `Skip the space before word ${w + 1}; position is now ${position}.`, { word: w })
    }
    const word = words[w]
    const size = (word.length * (word.length + 1)) / 2
    if (position >= size) {
      position -= size
      push('skip', 'position ← position - size', 'position -= size', `Word "${word}" expands to ${size} characters; skip it. Position ${position} remains.`, { word: w })
      continue
    }
    for (let t = 0; t < word.length; t += 1) {
      const block = t + 1
      if (position < block) {
        result = word[t]
        push('locate', 'IF position < block THEN RETURN word[t]', 'if position < block', `Inside "${word}": the letter "${word[t]}" repeats ${block} times and holds the index.`, { word: w, block, letter: word[t] })
        break
      }
      position -= block
      push('locate', 'position ← position - block', 'position -= block', `"${word[t]}" block covers ${block} characters; move on with position ${position}.`, { word: w, block })
    }
  }
  if (result === null) throw new Error('k is outside the expanded string')
  push('done', 'RETURN error', 'return ch', `Character at index ${k}: "${result}".`, { word: -1, block: -1, letter: result })
  return { input: { words, k }, result, frames }
}
