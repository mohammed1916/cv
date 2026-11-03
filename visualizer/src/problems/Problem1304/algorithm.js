export const phases = [
  { id: 'start', label: 'Empty answer', description: 'Start with an empty list. Every pair of opposite numbers adds zero to the total.' },
  { id: 'pair', label: 'Add a pair', description: 'Add a positive number and its negative. Both are new, and the pair keeps the sum at zero.' },
  { id: 'zero', label: 'Add zero', description: 'An odd count needs one more number. Zero is distinct from every pair and adds nothing to the sum.' },
  { id: 'done', label: 'Complete', description: 'The list holds n distinct integers whose sum is zero.' },
]

export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 50) throw new Error('Enter a single integer n from 1 to 50.')
  return n
}

export function buildTrace(n) {
  const frames = []
  const answer = []
  const frame = (phase, line, message, snapshot, pyLine = line) => frames.push({ phase, activeLine: L(line), pythonLine: P(pyLine), snapshot, message })
  const snap = (i = null) => ({ answer: [...answer], n, i, total: answer.reduce((s, v) => s + v, 0) })
  frame('start', 'answer = []', `Build ${n} distinct integers with sum zero.`, snap())
  for (let i = 1; i <= Math.floor(n / 2); i++) {
    answer.push(i, -i)
    frame('pair', 'append i and -i', `Add ${i} and ${-i}. Their contribution to the sum is 0, and neither value has appeared before.`, snap(i), 'answer.append(-i)')
  }
  if (n % 2 === 1) {
    answer.push(0)
    frame('zero', 'if n is odd', 'n is odd, so add 0. It differs from every pair value because the pairs use only nonzero numbers.', snap(), 'if n % 2 == 1')
  }
  frame('done', 'return answer', `Result: [${answer.join(', ')}].`, snap(), 'return answer')
  return { input: n, result: answer, frames }
}

export const code = `unique sum zero (n):
  answer = []
  for i from 1 to n // 2:
    append i and -i
  if n is odd: append 0
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def sum_zero(n):
    answer = []
    for i in range(1, n // 2 + 1):
        answer.append(i)
        answer.append(-i)
    if n % 2 == 1:
        answer.append(0)
    return answer`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
