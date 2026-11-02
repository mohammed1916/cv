const PYTHON_SOURCE = `def kItemsWithMaximumSum(numOnes, numZeros, numNegOnes, k):
    total = 0
    picked = min(k, numOnes)
    total += picked
    zeros = min(k - picked, numZeros)
    negatives = min(k - picked - zeros, numNegOnes)
    total -= negatives
    return total`

const PY = PYTHON_SOURCE.split('\n')
const py = (text) => {
  const index = PY.findIndex((line) => line.trim() === text)
  if (index < 0) throw new Error(`Python line not found: ${text}`)
  return index + 1
}

export const python = PYTHON_SOURCE

export const code = [
  { line: 1, text: 'function kItemsWithMaximumSum(numOnes, numZeros, numNegOnes, k)' },
  { line: 2, text: 'total = 0' },
  { line: 3, text: 'take up to k of the +1 items and add their values' },
  { line: 4, text: 'take the 0 items with whatever budget remains' },
  { line: 5, text: 'take the -1 items with whatever budget remains and subtract them' },
  { line: 6, text: 'return total' },
]

export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Input must be valid JSON, for example {"numOnes": 3, "numZeros": 2, "numNegOnes": 0, "k": 2}')
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object with numOnes, numZeros, numNegOnes and k')
  const { numOnes, numZeros, numNegOnes, k } = data
  for (const [name, value] of [['numOnes', numOnes], ['numZeros', numZeros], ['numNegOnes', numNegOnes]]) {
    if (!Number.isInteger(value) || value < 0 || value > 50) throw new Error(`${name} must be an integer from 0 to 50`)
  }
  const total = numOnes + numZeros + numNegOnes
  if (!Number.isInteger(k) || k < 0 || k > total) throw new Error(`k must be an integer from 0 to ${total}`)
  return { numOnes, numZeros, numNegOnes, k }
}

export function buildTrace(input) {
  const { numOnes, numZeros, numNegOnes, k } = input
  const frames = []
  let total = 0
  let picked = 0
  let zeros = 0
  let negatives = 0
  const frame = (phase, activeLine, pythonLine, message) =>
    frames.push({ phase, activeLine, pythonLine, message, numOnes, numZeros, numNegOnes, k, total, picked, zeros, negatives })

  frame('setup', 2, py('total = 0'), 'Start with total = 0 and a budget of k picks.')
  picked = Math.min(k, numOnes)
  frame('ones', 3, py('picked = min(k, numOnes)'), `Take ${picked} item${picked === 1 ? '' : 's'} worth +1 (budget ${k}, +1 items ${numOnes}).`)
  total += picked
  frame('ones', 3, py('total += picked'), `Add ${picked}; total is now ${total}.`)
  zeros = Math.min(k - picked, numZeros)
  frame('zeros', 4, py('zeros = min(k - picked, numZeros)'), `Take ${zeros} zero-valued item${zeros === 1 ? '' : 's'}; they add nothing.`)
  negatives = Math.min(k - picked - zeros, numNegOnes)
  frame('negatives', 5, py('negatives = min(k - picked - zeros, numNegOnes)'), `The remaining budget forces ${negatives} item${negatives === 1 ? '' : 's'} worth -1.`)
  total -= negatives
  frame('negatives', 5, py('total -= negatives'), `Subtract ${negatives}; total is now ${total}.`)
  frame('done', 6, py('return total'), `Return ${total}.`)
  return { input, result: total, frames }
}
