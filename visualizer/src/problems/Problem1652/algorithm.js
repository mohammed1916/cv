export const phases = [
  { id: 'start', label: 'Prepare output', description: 'Create an output list of zeros with one position for each value.' },
  { id: 'inspect', label: 'Choose window', description: 'Choose the neighbouring positions that position i reads, from the unchanged input.' },
  { id: 'update', label: 'Write sum', description: 'Write the sum of the chosen neighbours into the output at position i.' },
  { id: 'done', label: 'Result', description: 'Return the completed output list.' },
]

export const code = `defuse the bomb (code, k):
  n = length of code
  result = n zeros
  for each position i:
    choose window indices from k
    result[i] = sum of code over window
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def decrypt(code, k):
    n = len(code)
    result = [0] * n
    for i in range(n):
        if k > 0:
            window = [(i + j) % n for j in range(1, k + 1)]
        elif k < 0:
            window = [(i - j) % n for j in range(1, -k + 1)]
        else:
            window = []
        result[i] = sum(code[j] for j in window)
    return result
`

const pc = needle => code.findIndex(line => line.text.includes(needle)) + 1
const py = needle => python.split('\n').findIndex(line => line.includes(needle)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"code": [6, 1, 3, 8], "k": 2}.')
  const { code: values, k } = input
  if (!Array.isArray(values) || values.length < 1 || values.length > 20 || !values.every(v => Number.isInteger(v) && Math.abs(v) <= 100)) {
    throw new Error('code is a list of 1 to 20 integers from -100 to 100.')
  }
  if (!Number.isInteger(k) || Math.abs(k) > values.length - 1) throw new Error('k is an integer from -(n-1) to n-1.')
  return { code: values, k }
}

export function buildTrace({ code: values, k }) {
  const n = values.length
  const result = Array(n).fill(null)
  const frames = []
  const snap = (index, window, sum) => ({ values, index, window, sum, output: [...result] })
  const push = (phase, pcNeedle, pyNeedle, message, snapshot) =>
    frames.push({ phase, activeLine: pc(pcNeedle), pythonLine: py(pyNeedle), message, snapshot })
  const describe = i => {
    if (k > 0) return { window: Array.from({ length: k }, (_, j) => (i + j + 1) % n), pyNeedle: 'if k > 0' }
    if (k < 0) return { window: Array.from({ length: -k }, (_, j) => ((i - j - 1) % n + n) % n), pyNeedle: 'elif k < 0' }
    return { window: [], pyNeedle: 'window = []' }
  }

  push('start', 'result = n zeros', 'result = [0] * n', `Prepare ${n} output positions, all empty for now.`, snap(null, [], null))
  for (let i = 0; i < n; i++) {
    const { window, pyNeedle } = describe(i)
    push('inspect', 'choose window', pyNeedle,
      window.length === 0 ? `k is ${k}, so position ${i} reads no neighbours.`
        : `Position ${i} reads indices ${window.join(', ')} from the unchanged input.`, snap(i, window, null))
    const sum = window.reduce((total, j) => total + values[j], 0)
    result[i] = sum
    push('update', 'result[i] = sum', 'result[i] = sum', `Position ${i} receives ${sum}.`, snap(i, window, sum))
  }
  push('done', 'return result', 'return result', 'Every position is filled from the original values.', snap(null, [], null))
  return { input: { code: values, k }, result: [...result], frames }
}
