export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with result 0.' },
  { id: 'accumulate', label: 'XOR value', description: 'XOR the current generated value into the result.' },
  { id: 'done', label: 'Complete', description: 'The result is the XOR of every generated value.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Number.isInteger(data.n) || !Number.isInteger(data.start)) throw new Error('Use an object with integers n and start, for example {"n":4,"start":3}.')
  if (data.n < 1 || data.n > 60) throw new Error('n must be from 1 to 60 in this visualization.')
  if (data.start < 0 || data.start > 1000) throw new Error('start must be from 0 to 1000.')
  return { n: data.n, start: data.start }
}

export const code = `xor operation (n, start):
  result = 0
  for i from 0 to n - 1:
    value = start + 2 * i
    result = result XOR value
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def xor_operation(n, start):
    result = 0
    for i in range(n):
        result ^= start + 2 * i
    return result
`

const binary = x => x.toString(2).padStart(8, '0')

export function buildTrace(input) {
  const { n, start } = input
  const frames = []
  let result = 0
  frames.push({
    phase: 'start', activeLine: L('result = 0'), pythonLine: P('result = 0'),
    index: -1, value: null, before: 0, result: 0,
    message: `Start with result 0. The array has ${n} values, and value i is ${start} + 2 × i.`,
  })
  for (let i = 0; i < n; i++) {
    const value = start + 2 * i
    const before = result
    result ^= value
    frames.push({
      phase: 'accumulate', activeLine: L('result = result XOR value'), pythonLine: P('result ^= start + 2 * i'),
      index: i, value, before, result,
      message: `Position ${i} holds ${value}. ${binary(before)} XOR ${binary(value)} = ${binary(result)}, so result is ${result}.`,
    })
  }
  frames.push({
    phase: 'done', activeLine: L('return result'), pythonLine: P('return result'),
    index: -1, value: null, before: result, result,
    message: `All ${n} values are folded in. The XOR of the array is ${result}.`,
  })
  return { input, result, frames }
}
