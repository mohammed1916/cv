export function parseInput(text) {
  const data = JSON.parse(text)
  const s = data?.s
  const k = data?.k
  if (typeof s !== 'string' || !/^[a-z]{1,10}$/.test(s)) throw new Error('s must be 1 to 10 lowercase letters.')
  if (!Number.isInteger(k) || k < 0 || k > 25) throw new Error('k must be an integer from 0 to 25.')
  return { s, k }
}

export const code = `longest ideal subsequence(s, k)
  best = list of 26 zeros, one for each letter
  for each character c in s
    index = position of c in the alphabet, with a = 0
    lowest = max(0, index - k), highest = min(25, index + k)
    best[index] = max(best[index], 1 + the largest value in best from lowest to highest)
  return the largest value in best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// best[x] is the longest ideal subsequence that ends with letter x, so each new letter only reads a window of letters.
export function buildTrace({ s, k }) {
  const best = Array(26).fill(0)
  const frames = [{ phase: 'start', position: -1, letter: -1, window: null, best: [...best], activeLine: L('best = list of 26 zeros'), message: 'No letters have been chosen yet.' }]
  for (let position = 0; position < s.length; position++) {
    const index = s.charCodeAt(position) - 97
    const lowest = Math.max(0, index - k)
    const highest = Math.min(25, index + k)
    const reach = Math.max(...best.slice(lowest, highest + 1))
    best[index] = Math.max(best[index], 1 + reach)
    frames.push({ phase: 'letter', position, letter: index, window: [lowest, highest], best: [...best], activeLine: L('best[index] = max'), message: `${s[position]} extends a chain from a letter within ${k} of it: best ending in ${s[position]} is ${best[index]}.` })
  }
  const result = Math.max(...best)
  frames.push({ phase: 'done', position: s.length, letter: -1, window: null, best: [...best], activeLine: L('return the largest value in best'), message: `Longest ideal subsequence: ${result}.` })
  return { input: { s, k }, result, frames }
}

export const python = `def longest_ideal_subsequence(s, k):
    best = [0] * 26
    for ch in s:
        index = ord(ch) - ord('a')
        lowest = max(0, index - k)
        highest = min(25, index + k)
        best[index] = max(best[index], 1 + max(best[lowest:highest + 1]))
    return max(best)
`
