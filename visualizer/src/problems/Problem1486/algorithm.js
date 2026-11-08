export const phases = [
  { id: 'start', label: 'Start', description: 'The array is start, start + 2, start + 4, and so on. Begin the XOR at zero.' },
  { id: 'value', label: 'Next value', description: 'Compute nums[i] = start + 2i for the next position.' },
  { id: 'accumulate', label: 'XOR in', description: 'XOR the value into the running result; XOR-ing the same value twice cancels.' },
  { id: 'done', label: 'Complete', description: 'Return the XOR of every value in the array.' },
]

export const examples = [
  { label: 'Four values', input: '{"n":4,"start":2}' },
  { label: 'Odd start', input: '{"n":5,"start":7}' },
  { label: 'Single value', input: '{"n":1,"start":0}' },
  { label: 'Start at a multiple', input: '{"n":3,"start":9}' },
  { label: 'Largest n', input: '{"n":60,"start":1000}' },
  { label: 'Long run: 40 values', input: '{"n":40,"start":123}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data) || !Number.isInteger(data.n) || !Number.isInteger(data.start)) throw new Error('Use an object with integers n and start, such as {"n":4,"start":2}.')
  if (data.n < 1 || data.n > 60) throw new Error('n must be from 1 to 60 in this visualization.')
  if (data.start < 0 || data.start > 1000) throw new Error('start must be from 0 to 1000 in this visualization.')
  return { n: data.n, start: data.start }
}

export function buildTrace({ n, start }) {
  let result = 0
  const values = []
  const snap = (i, extra = {}) => ({ n, start, index: i, values: [...values], result, ...extra })
  const frames = [{ phase: 'start', activeLine: L('let result = 0'), pythonLine: P('result = 0'), snapshot: snap(-1),
    message: `Build ${n} values starting at ${start}, step 2, and XOR them together.` }]
  for (let i = 0; i < n; i++) {
    const value = start + 2 * i
    values.push(value)
    frames.push({ phase: 'value', activeLine: L('for (let i = 0'), pythonLine: P('value = start'), snapshot: snap(i, { value }),
      message: `Position ${i} holds ${start} + 2 * ${i} = ${value}.` })
    result ^= value
    frames.push({ phase: 'accumulate', activeLine: L('result ^='), pythonLine: P('result ^='), snapshot: snap(i, { value }),
      message: `XOR ${value} into the running result: ${result}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return result'), pythonLine: P('return result'), snapshot: snap(n, {}),
    message: `Return ${result}.`, result })
  for (const f of frames) f.scene = { ...f.snapshot }
  return { input: { n, start }, result, frames }
}

export const code = `function xorOperation(n, start) {
  let result = 0
  for (let i = 0; i < n; i++) result ^= start + 2 * i
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def xor_operation(n, start):
    result = 0
    for i in range(n):
        value = start + 2 * i
        result ^= value
    return result
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
