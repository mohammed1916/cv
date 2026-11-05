export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with num1 and num2.')
  const { num1, num2 } = input
  if (!Number.isInteger(num1) || num1 < -100 || num1 > 100) throw new Error('num1 is an integer from -100 to 100.')
  if (!Number.isInteger(num2) || num2 < -100 || num2 > 100) throw new Error('num2 is an integer from -100 to 100.')
  return { num1, num2 }
}

export function buildTrace({ num1, num2 }) {
  const sum = num1 + num2
  const frames = []
  frames.push({ pythonLine: PL('total = num1'), phase: 'setup', activeLine: CL('const sum'), at: null, num1, num2, sum: null, message: `Start from ${num1} and add ${num2}.` })
  frames.push({ pythonLine: PL('return total'), phase: 'done', activeLine: CL('return sum'), at: null, num1, num2, sum, message: `${num1} + ${num2} = ${sum}.` })
  return { input: { num1, num2 }, result: sum, frames }
}

export const code = `function addTwoIntegers(num1, num2) {
  const sum = num1 + num2;
  return sum;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def add_two_integers(num1, num2):
    total = num1 + num2
    return total
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
