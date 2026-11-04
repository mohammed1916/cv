const CODE = [
  'function closestFair(n) {',
  '  let x = n',
  '  while (true) {',
  '    const digits = String(x).split("").map(Number)',
  '    const odd = digits.filter(d => d % 2 === 1).length',
  '    const even = digits.length - odd',
  '    if (odd === even) return x',
  '    x += 1',
  '  }',
  '}',
]

const PY = [
  'def closest_fair(n):',
  '    x = n',
  '    while True:',
  '        digits = str(x)',
  '        odd = sum(1 for d in digits if int(d) % 2 == 1)',
  '        even = len(digits) - odd',
  '        if odd == even:',
  '            return x',
  '        x += 1',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text.trim()))
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin at n.' },
  { id: 'check', label: 'Check', description: 'Count odd and even digits of the candidate.' },
  { id: 'found', label: 'Found', description: 'The counts match, so this is the answer.' },
]

export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error('n is an integer from 1 to 1000 in this visualization.')
  return n
}

function digitsOf(x) {
  return String(x).split('').map(Number)
}

export function buildTrace(n) {
  const frames = []
  let x = n
  frames.push({ pythonLine: pyLine('x = n'), phase: 'start', activeLine: codeLine('let x = n'), candidate: x, digits: [], odd: 0, even: 0, message: `Start at ${n} and test each candidate upward.` })
  for (;;) {
    const digits = digitsOf(x)
    const odd = digits.filter(d => d % 2 === 1).length
    const even = digits.length - odd
    const fair = odd === even
    frames.push({ pythonLine: pyLine(fair ? 'if odd == even:' : 'odd = sum('), phase: fair ? 'found' : 'check', activeLine: codeLine(fair ? 'if (odd === even) return x' : 'const odd = digits.filter'), candidate: x, digits, odd, even, fair, message: fair ? `${x} has ${odd} odd and ${even} even digits, so it is fair.` : `${x} has ${odd} odd and ${even} even digit${even === 1 ? '' : 's'}. Not fair; try ${x + 1}.` })
    if (fair) break
    x += 1
  }
  return { input: n, result: x, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
