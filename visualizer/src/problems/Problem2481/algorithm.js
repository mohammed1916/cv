export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 1 || n > 100) throw new Error('n is an integer from 1 to 100.')
  return { n }
}

export function buildTrace({ n }) {
  const frames = []
  frames.push({ pythonLine: PL('if n == 1'), phase: 'check', activeLine: CL('IF n equals 1'), n, result: null, message: `Is n = ${n} equal to 1?` })
  let result
  if (n === 1) {
    result = 0
    frames.push({ pythonLine: PL('return 0'), phase: 'done', activeLine: CL('RETURN 0'), n, result, message: 'A single piece needs no cuts.' })
  } else if (n % 2 === 0) {
    result = n / 2
    frames.push({ pythonLine: PL('return n // 2'), phase: 'even', activeLine: CL('IF n is even'), n, result, message: `Even: ${n / 2} diameters through the centre.` })
  } else {
    result = n
    frames.push({ pythonLine: PL('return n'), phase: 'odd', activeLine: CL('ELSE'), n, result, message: `Odd: each of the ${n} cuts must be a full line.` })
  }
  return { input: { n }, result, frames }
}

export const code = `FUNCTION numberOfCuts(n)
  IF n equals 1 THEN RETURN 0
  IF n is even THEN RETURN n / 2
  ELSE RETURN n`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def number_of_cuts(n):
    if n == 1:
        return 0
    if n % 2 == 0:
        return n // 2
    return n
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
