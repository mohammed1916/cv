// Tribonacci: T0 = 0, T1 = 1, T2 = 1, and each later term is the sum of the three before it.
// The trace keeps a sliding window of the last three terms and slides it forward one step at a time.

const N_LIMIT = 37

export const phases = [
  { id: 'start', label: 'Start', description: 'Check for the special case n = 0.' },
  { id: 'seed', label: 'Seed', description: 'Load the first three terms into the window.' },
  { id: 'step', label: 'Slide', description: 'Add the three window terms, then slide the window forward.' },
  { id: 'done', label: 'Result', description: 'Return the last term of the window.' },
]

export function parseInput(text) {
  let obj = text
  if (typeof obj === 'string') {
    try { obj = JSON.parse(obj) } catch { throw new Error('Use a JSON object with an integer n.') }
  }
  if (!obj || typeof obj !== 'object' || !Number.isInteger(obj.n)) throw new Error('Use an object with an integer n.')
  if (obj.n < 0 || obj.n > N_LIMIT) throw new Error(`n must be from 0 to ${N_LIMIT} in this visualization.`)
  return { n: obj.n }
}

export const code = `tribonacci (n):
  if n is 0 then return 0
  window = [0, 1, 1]
  for i from 3 to n:
    window = [window[1], window[2], window[0] + window[1] + window[2]]
  return window[2]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def tribonacci(n):
    if n == 0:
        return 0
    window = [0, 1, 1]
    for _ in range(3, n + 1):
        window = [window[1], window[2], sum(window)]
    return window[2]
`

const P = text => python.split('\n').findIndex(line => line.includes(text)) + 1

export function buildTrace(input) {
  const { n } = parseInput(input)
  if (n === 0) {
    return {
      input: { n },
      result: 0,
      frames: [
        { phase: 'start', activeLine: 2, pythonLine: P('if n == 0'), message: 'n is 0, so the answer is the first term, 0.', snapshot: { n, window: [], index: 0 } },
        { phase: 'done', activeLine: 2, pythonLine: P('return 0'), message: 'The answer is 0.', snapshot: { n, window: [0], index: 0 } },
      ],
    }
  }
  const frames = [{
    phase: 'start', activeLine: 2, pythonLine: P('if n == 0'),
    message: `n is ${n}, which is not 0, so build the window.`,
    snapshot: { n, window: [], index: 0 },
  }]
  let window = [0, 1, 1]
  frames.push({
    phase: 'seed', activeLine: 3, pythonLine: P('window = [0, 1, 1]'),
    message: 'The window holds T0, T1 and T2 = 0, 1, 1.',
    snapshot: { n, window: [...window], index: 2 },
  })
  for (let i = 3; i <= n; i++) {
    const next = window[0] + window[1] + window[2]
    window = [window[1], window[2], next]
    frames.push({
      phase: 'step', activeLine: 5, pythonLine: P('window = [window[1]'),
      message: `T${i} is ${next}, the sum of the previous three terms. The window now ends with ${next}.`,
      snapshot: { n, window: [...window], index: i },
    })
  }
  const result = window[2]
  frames.push({
    phase: 'done', activeLine: 6, pythonLine: P('return window[2]'),
    message: `The window ends with T${n} = ${result}.`,
    snapshot: { n, window: [...window], index: n },
  })
  return { input: { n }, result, frames }
}
