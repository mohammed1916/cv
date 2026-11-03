// Own wording and sample data. Parity counts follow the Python solution in `python`.
export const phases = [
  { id: 'count', label: 'Classify chips', description: 'Sort each chip by the parity of its position. Two-step moves keep the parity, so a chip can reach any spot of its parity for free.' },
  { id: 'choose', label: 'Choose target', description: 'Gather everything onto the larger parity group. Each chip in the smaller group pays 1 to change parity.' },
  { id: 'done', label: 'Result', description: 'Return the cost of the smaller group.' },
]

export const inputLabel = 'Array of chip positions (JSON)'
export const complexity = 'O(n) time and O(1) extra space. The visualizer caps the input at 20 chips with positions from 0 to 30.'
export const examples = [
  { label: 'Mixed parity', input: '[1,2,3]' },
  { label: 'One odd chip', input: '[2,2,2,3]' },
  { label: 'Already together', input: '[4,4,4]' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!Array.isArray(data) || data.length < 1 || data.length > 20) throw new Error('Enter a JSON array of 1 to 20 chip positions.')
  data.forEach((p, i) => {
    if (!Number.isInteger(p) || p < 0 || p > 30) throw new Error(`Position ${i} must be an integer from 0 to 30.`)
  })
  return data
}

const codeText = `min_cost(positions):
  even = 0, odd = 0
  for each chip position p:
    if p is even: add 1 to even
    else: add 1 to odd
  cost = the smaller of even and odd
  return cost`
const pythonText = `def min_cost(position):
    even = odd = 0
    for p in position:
        if p % 2 == 0:
            even += 1
        else:
            odd += 1
    return min(even, odd)     # move the smaller group across, one coin each`

export const code = codeText.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = pythonText
const L = key => codeText.split('\n').findIndex(line => line.includes(key)) + 1
const P = key => pythonText.split('\n').findIndex(line => line.includes(key)) + 1

export function buildTrace(positions) {
  const frames = []
  let even = 0
  let odd = 0
  frames.push({
    phase: 'count', activeLine: L('even = 0'), pythonLine: P('even = odd = 0'),
    message: `There are ${positions.length} chips. Start both parity counts at zero.`,
    snapshot: { even, odd, index: -1 },
  })
  positions.forEach((p, index) => {
    if (p % 2 === 0) even += 1
    else odd += 1
    frames.push({
      phase: 'count', activeLine: L('if p is even'), pythonLine: P('if p % 2 == 0'),
      message: `Chip at ${p} is ${p % 2 === 0 ? 'even' : 'odd'}, so the ${p % 2 === 0 ? 'even' : 'odd'} count becomes ${p % 2 === 0 ? even : odd}.`,
      snapshot: { even, odd, index, position: p },
    })
  })
  const cost = Math.min(even, odd)
  const target = even >= odd ? 'even' : 'odd'
  frames.push({
    phase: 'choose', activeLine: L('cost = the smaller'), pythonLine: P('return min(even, odd)'),
    message: `${target === 'even' ? 'Even' : 'Odd'} positions hold the larger group, so gather there. The ${cost} chip${cost === 1 ? '' : 's'} on the other parity pay 1 each.`,
    snapshot: { even, odd, index: positions.length - 1, target, cost },
  })
  frames.push({
    phase: 'done', activeLine: L('return cost'), pythonLine: P('return min'),
    message: `Minimum cost: ${cost}.`,
    snapshot: { even, odd, index: positions.length - 1, target, cost },
  })
  return { input: positions, result: cost, frames }
}
