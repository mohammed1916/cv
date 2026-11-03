export const phases = [
  { id: 'start', label: 'Start', description: 'Every position holds at least value 1 and at most value 26. Fill from the last position backwards.' },
  { id: 'place', label: 'Place letter', description: 'Give this position the largest value that still leaves one unit for each earlier position.' },
  { id: 'done', label: 'Answer', description: 'Every position is filled. Reading the letters left to right gives the smallest string.' },
]

const codeText = `smallest string (n, k):
  chars = n empty slots
  for position i from n - 1 down to 0:
    value = min(26, k - i)
    chars[i] = letter number value
    k = k - value
  return the joined chars`

export const code = codeText.split('\n').map((text, index) => ({ line: index + 1, text }))

const pythonText = `def smallest_string(n, k):
    chars = [""] * n
    for i in range(n - 1, -1, -1):
        value = min(26, k - i)
        chars[i] = chr(ord("a") + value - 1)
        k -= value
    return "".join(chars)
`

export const python = pythonText
const L = s => codeText.split('\n').findIndex(line => line.includes(s)) + 1
const P = s => pythonText.split('\n').findIndex(line => line.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"n": 3, "k": 27}.')
  const { n, k } = input
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new Error('n is an integer from 1 to 12.')
  if (!Number.isInteger(k) || k < n || k > 26 * n) throw new Error(`k is an integer from n (${n}) to 26 times n (${26 * n}).`)
  return { n, k }
}

const letter = value => String.fromCharCode(96 + value)

export function buildTrace({ n, k }) {
  const chars = Array(n).fill('?')
  const frames = [{
    phase: 'start', activeLine: L('chars = n empty'), pythonLine: P('chars = [""] * n'),
    snapshot: { chars: chars.slice(), budget: k, value: null, position: null },
    message: `Total value ${k} across ${n} positions. Each letter is worth its alphabet index from 1 to 26.`,
  }]
  let budget = k
  for (let i = n - 1; i >= 0; i--) {
    const value = Math.min(26, budget - i)
    chars[i] = letter(value)
    budget -= value
    frames.push({
      phase: 'place', activeLine: L('value = min(26'), pythonLine: P('value = min(26'),
      snapshot: { chars: chars.slice(), budget, value, position: i },
      message: `Position ${i}: ${i} earlier positions still need one unit each, so this one takes ${value} ("${chars[i]}"). Budget left ${budget}.`,
    })
  }
  const result = chars.join('')
  frames.push({
    phase: 'done', activeLine: L('return the joined'), pythonLine: P('return "".join(chars)'),
    snapshot: { chars: chars.slice(), budget, value: null, position: null },
    message: `Answer "${result}". Its values sum to ${k}.`,
  })
  return { input: { n, k }, result, frames }
}
