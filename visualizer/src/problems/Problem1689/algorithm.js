export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with a best digit of 0. Each deci-binary number contributes at most one 1 to each place value.' },
  { id: 'scan', label: 'Read digits', description: 'Look at each digit of n from left to right.' },
  { id: 'raise', label: 'New largest digit', description: 'A larger digit needs more deci-binary numbers, so the best value rises.' },
  { id: 'done', label: 'Layers', description: 'Show the deci-binary numbers that build n, one layer per count.' },
]

export function parseInput(text) {
  const digits = String(text).trim()
  if (!/^[1-9]\d{0,29}$/.test(digits)) throw new Error('Enter a positive whole number with up to 30 digits and no leading zero.')
  return digits
}

export const code = `min deci-binary count (n):
  best = 0
  for each digit d of n from left to right:
    if d > best: best = d
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_deci_binary(n):
    best = 0
    for ch in n:
        best = max(best, int(ch))
    return best
`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (pseudo, py) => ({ activeLine: L(pseudo), pythonLine: P(py) })

// Layer j is the 0/1 number whose digit is 1 wherever n has a digit of at least j.
function layersFor(digits, best) {
  const layers = []
  for (let j = 1; j <= best; j++) layers.push(digits.split('').map(ch => (Number(ch) >= j ? '1' : '0')).join('').replace(/^0+(?=\d)/, ''))
  return layers
}

export function buildTrace(digits) {
  let best = 0
  const frames = [{ phase: 'start', ...at('best = 0', 'best = 0'), snapshot: { digits, index: -1, best, layers: null }, message: `Start with best = 0 for the number ${digits}. The answer is the largest digit, because k numbers can reach a digit d only when k is at least d.` }]
  for (let i = 0; i < digits.length; i++) {
    const d = Number(digits[i])
    if (d > best) {
      best = d
      frames.push({ phase: 'raise', ...at('if d > best', 'best = max(best, int(ch))'), snapshot: { digits, index: i, best, layers: null }, message: `Digit ${d} at position ${i + 1} is larger than the best so far, so best becomes ${best}.` })
    } else {
      frames.push({ phase: 'scan', ...at('for each digit', 'for ch in n'), snapshot: { digits, index: i, best, layers: null }, message: `Digit ${d} at position ${i + 1} does not beat best = ${best}.` })
    }
  }
  const layers = layersFor(digits, best)
  frames.push({ phase: 'done', ...at('return best', 'return best'), snapshot: { digits, index: -1, best, layers }, message: `${best} deci-binary numbers are enough, and they add up to ${digits}.` })
  return { input: digits, result: best, frames }
}
