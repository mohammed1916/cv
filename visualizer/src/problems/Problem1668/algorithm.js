export const phases = [
  { id: 'start', label: 'Start', description: 'Find the longest possible run: the sequence length divided by the word length, rounded down.' },
  { id: 'try', label: 'Try a count', description: 'Build the word repeated k times and check whether it appears as a contiguous piece of the sequence.' },
  { id: 'found', label: 'Found', description: 'The first count that fits, counting down from the largest, is the answer.' },
  { id: 'done', label: 'Complete', description: 'Return the largest count that appears.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"sequence": "abcabc", "word": "abc"}.')
  const { sequence, word } = input
  if (typeof sequence !== 'string' || !/^[a-z]{1,100}$/.test(sequence)) throw new Error('sequence is 1 to 100 lowercase letters.')
  if (typeof word !== 'string' || !/^[a-z]{1,100}$/.test(word)) throw new Error('word is 1 to 100 lowercase letters.')
  return { sequence, word }
}

// Pseudocode line numbers used by activeLine, and Python line numbers used by pythonLine.
const C = { header: 1, loop: 2, candidate: 3, test: 4, found: 5, zero: 6 }
const PY = { header: 1, loop: 2, candidate: 3, test: 4, found: 5, zero: 6 }

export function buildTrace({ sequence, word }) {
  const frames = []
  const top = Math.floor(sequence.length / word.length)
  const push = (phase, line, message, snapshot) => frames.push({ phase, activeLine: C[line], pythonLine: PY[line], snapshot, message })

  push('start', 'header', `The sequence has ${sequence.length} characters and the word has ${word.length}. The largest count that could fit is ${top}.`, { k: top, candidate: null, hit: null })
  let result = 0
  for (let k = top; k >= 0; k--) {
    const candidate = word.repeat(k)
    const hit = sequence.includes(candidate)
    push('try', k === 0 ? 'zero' : 'test', k === 0
      ? 'An empty candidate always matches, so 0 is the fallback answer.'
      : `Is "${candidate}" (${k} copies) inside the sequence? ${hit ? 'Yes.' : 'No, so try one fewer copy.'}`,
    { k, candidate, hit })
    if (hit) {
      result = k
      push('found', 'found', `${k} copies fit, and no larger count fits, so the answer is ${k}.`, { k, candidate, hit })
      break
    }
  }
  push('done', 'zero', `Return ${result} as the largest repeat count.`, { k: result, candidate: word.repeat(result), hit: true })
  return { input: { sequence, word }, result, frames }
}

export const code = `max repeating (sequence, word):
  for k from len(sequence) // len(word) down to 0:
    candidate = word repeated k times
    if candidate is inside sequence:
      return k
  return 0`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_repeating(sequence, word):
    for k in range(len(sequence) // len(word), -1, -1):
        candidate = word * k
        if candidate in sequence:
            return k
    return 0
`
