const CODE = [
  'function numberOfCuts(n) {',
  '  if (n === 1) return 0',
  '  if (n % 2 === 0) return n / 2',
  '  return n',
  '}',
]

const PY = [
  'def number_of_cuts(n):',
  '    if n == 1:',
  '        return 0',
  '    if n % 2 == 0:',
  '        return n // 2',
  '    return n',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text.trim()))
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export const phases = [
  { id: 'check', label: 'Check', description: 'Test whether one piece is needed.' },
  { id: 'even', label: 'Even', description: 'Even n uses diameters through the centre.' },
  { id: 'odd', label: 'Odd', description: 'Odd n needs one cut per piece.' },
  { id: 'done', label: 'Result', description: 'Return the number of cuts.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 1 || n > 100) throw new Error('n is an integer from 1 to 100.')
  return { n }
}

export function buildTrace({ n }) {
  const frames = []
  frames.push({ pythonLine: pyLine('if n == 1'), phase: 'check', activeLine: codeLine('if (n === 1)'), n, result: null, cutKind: null, message: `Is n = ${n} equal to 1?` })
  let result
  if (n === 1) {
    result = 0
    frames.push({ pythonLine: pyLine('return 0'), phase: 'done', activeLine: codeLine('if (n === 1) return 0'), n, result, cutKind: 'none', message: 'A single piece needs no cuts.' })
  } else if (n % 2 === 0) {
    result = n / 2
    frames.push({ pythonLine: pyLine('if n % 2 == 0'), phase: 'even', activeLine: codeLine('if (n % 2 === 0)'), n, result, cutKind: 'diameter', message: `Even: ${n / 2} diameters through the centre give ${n} equal pieces.` })
  } else {
    result = n
    frames.push({ pythonLine: pyLine('return n'), phase: 'odd', activeLine: codeLine('return n'), n, result, cutKind: 'radius', message: `Odd: each of the ${n} cuts must be a radius, since no diameter gives an odd number of equal pieces.` })
  }
  return { input: { n }, result, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
