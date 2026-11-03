export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a and b.')
  const { a, b } = input
  for (const [name, list] of [['a', a], ['b', b]]) {
    if (!Array.isArray(list) || list.length < 1 || list.length > 8) throw new Error(`${name} holds 1 to 8 coefficients.`)
    if (!list.every(c => Number.isInteger(c) && c >= -9 && c <= 9)) throw new Error(`Each coefficient of ${name} is an integer from -9 to 9.`)
  }
  return { a, b }
}

export function buildTrace({ a, b }) {
  const result = Array(a.length + b.length - 1).fill(0)
  const frames = []
  const frame = fields => frames.push({ result: [...result], ...fields })
  frame({ pythonLine: P('result = [0]'), phase: 'start', activeLine: L('make a result list'), i: -1, j: -1, message: `The product has ${result.length} coefficients, from degree 0 up.` })
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      result[i + j] += a[i] * b[j]
      frame({ pythonLine: P('result[i + j] +='), phase: 'pair', activeLine: L('add the product'), i, j, message: `a[${i}] * b[${j}] = ${a[i] * b[j]} goes to degree ${i + j}; that degree now holds ${result[i + j]}.` })
    }
  }
  frame({ pythonLine: P('return result'), phase: 'done', activeLine: L('return the result'), i: -1, j: -1, message: 'Every pair of terms has been combined.' })
  return { input: { a, b }, result: [...result], frames }
}

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const code = `product of two polynomials given lowest degree first
  make a result list of length len(a) + len(b) - 1 filled with zeros
  for each index i in a
    for each index j in b
      add the product of a[i] and b[j] to the coefficient of degree i + j
  return the result`.split('\n').map((text, index) => ({ line: index + 1, text: text.trimEnd() }))

export const python = `def multiply_polynomials(a, b):
    result = [0] * (len(a) + len(b) - 1)
    for i in range(len(a)):
        for j in range(len(b)):
            result[i + j] += a[i] * b[j]
    return result
`
