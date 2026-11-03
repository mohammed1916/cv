const KEYPAD = ['ab', 'cde', 'fgh', 'ijk', 'lmn', 'opq', 'rst', 'uvw', 'xyz']
const WEIGHT = Object.fromEntries(KEYPAD.flatMap((letters, index) => [...letters].map(ch => [ch, index + 1])))

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a word field.')
  const { word } = input
  if (typeof word !== 'string' || word.length < 1 || word.length > 30 || !/^[a-z]+$/.test(word)) throw new Error('word has 1 to 30 lowercase letters.')
  return { word }
}

// A substring has weight sum S and length L. S / L is an integer q between 1 and 9 exactly when L divides S,
// so every divisible substring is counted once, under its own q. For a fixed q, subtract q from each weight:
// a substring has sum S - q * L = 0 exactly when two prefix values are equal.
export function buildTrace({ word }) {
  const frames = []
  let total = 0
  const push = (phase, pythonLine, text, state, message) =>
    frames.push({ phase, pythonLine, activeLine: L(text), total, ...state, message })

  push('start', 6, 'total is zero', { q: 0, index: -1, running: null, add: null, seen: [] }, `Count substrings of "${word}" whose weight sum is divisible by length.`)
  for (let q = 1; q <= 9; q++) {
    let running = 0
    const seen = new Map([[0, 1]])
    push('average', 9, 'running is zero', { q, index: -1, running, add: null, seen: [...seen] }, `Try average weight ${q}: subtract ${q} from every letter weight.`)
    for (let t = 0; t < word.length; t++) {
      running += WEIGHT[word[t]] - q
      const add = seen.get(running) ?? 0
      total += add
      seen.set(running, (seen.get(running) ?? 0) + 1)
      push('count', 12, 'add the count of earlier', { q, index: t, running, add, seen: [...seen] },
        add > 0 ? `After ${word[t]}, the running value ${running} appeared ${add} time${add === 1 ? '' : 's'} before: ${add} divisible substring${add === 1 ? '' : 's'} with average ${q}.`
          : `After ${word[t]}, the running value ${running} is new for average ${q}.`)
    }
  }
  push('done', 14, 'return total', { q: 0, index: -1, running: null, add: null, seen: [] }, `There are ${total} divisible substrings.`)
  return { input: { word }, result: total, frames }
}

export const code = `count substrings whose weight sum is divisible by their length
  total is zero
  for each average q from 1 to 9
    running is zero and seen holds one zero
    for each letter, running adds its weight minus q
      add the count of earlier equal running values to total
      record the running value in seen
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def count_divisible_substrings(word):
    weight = {}
    for group, letters in enumerate(["ab", "cde", "fgh", "ijk", "lmn", "opq", "rst", "uvw", "xyz"], 1):
        for ch in letters:
            weight[ch] = group
    total = 0
    for q in range(1, 10):
        running = 0
        seen = {0: 1}
        for ch in word:
            running += weight[ch] - q
            total += seen.get(running, 0)
            seen[running] = seen.get(running, 0) + 1
    return total
`
