export const phases = [
  { id: 'start', label: 'Start', description: 'Plan to fill n slots with distinct integers whose total is zero.' },
  { id: 'pair', label: 'Add a pair', description: 'Add i and -i; the pair contributes zero to the total and no value repeats.' },
  { id: 'zero', label: 'Add zero', description: 'An odd n leaves one slot, which is filled with 0 without breaking the total.' },
  { id: 'done', label: 'Complete', description: 'Return the n distinct integers.' },
]

export const examples = [
  { label: 'Even count', input: '{"n":4}' },
  { label: 'Odd count', input: '{"n":7}' },
  { label: 'Six values', input: '{"n":6}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  const n = typeof data === 'number' ? data : data && typeof data === 'object' ? data.n : undefined
  if (!Number.isInteger(n)) throw new Error('Use an object with an integer n, such as {"n":5}.')
  if (n < 1 || n > 50) throw new Error('n must be from 1 to 50 in this visualization.')
  return n
}

export function buildTrace(n) {
  const answer = []
  const snap = (phaseIndex = null) => ({ answer: [...answer], sum: answer.reduce((a, b) => a + b, 0), target: n, phaseIndex })
  const frames = [{ phase: 'start', activeLine: L('const answer = []'), pythonLine: P('answer = []'), snapshot: snap(),
    message: `We need ${n} distinct integers that add up to 0.` }]
  for (let i = 1; i <= Math.floor(n / 2); i++) {
    answer.push(i, -i)
    frames.push({ phase: 'pair', activeLine: L('answer.push(i, -i)'), pythonLine: P('answer.append(-i)'), snapshot: snap(i),
      message: `Add the pair ${i} and ${-i}. Their sum is 0, and neither value has appeared before.` })
  }
  if (n % 2 === 1) {
    answer.push(0)
    frames.push({ phase: 'zero', activeLine: L('answer.push(0)'), pythonLine: P('answer.append(0)'), snapshot: snap(),
      message: 'n is odd, so add 0 to fill the last slot. Zero is distinct from every pair and adds nothing.' })
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: P('return answer'), snapshot: snap(),
    message: `Return ${JSON.stringify(answer)}; it holds ${answer.length} values and sums to 0.`, result: answer })
  return { input: n, result: answer, frames }
}

export const code = `function sumZero(n) {
  const answer = []
  for (let i = 1; i <= Math.floor(n / 2); i++) {
    answer.push(i, -i)
  }
  if (n % 2 === 1) answer.push(0)
  return answer
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_zero(n):
    answer = []
    for i in range(1, n // 2 + 1):
        answer.append(i)
        answer.append(-i)
    if n % 2 == 1:
        answer.append(0)
    return answer
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
