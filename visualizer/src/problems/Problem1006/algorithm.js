export const phases = [
  { id: 'start', label: 'Start', description: 'Read n and set the first term to n, with the operations cycling multiply, divide, add, subtract.' },
  { id: 'inspect', label: 'Read operation', description: 'Take the next operation in the cycle and the next descending number.' },
  { id: 'update', label: 'Apply to term', description: 'Multiply or divide the current term, or close it and start a signed term for add or subtract.' },
  { id: 'done', label: 'Complete', description: 'Add the signed terms together to get the result.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"n": 7}.')
  if (!Number.isInteger(input.n) || input.n < 1 || input.n > 60) throw new Error('n is an integer from 1 to 60 for this view.')
  return { n: input.n }
}

const OPS = ['*', '/', '+', '-']

export function buildTrace({ n }) {
  const terms = []
  let term = n
  const frames = [{ phase: 'start', activeLine: L('term = n'), pythonLine: P('term = n'), snapshot: { terms: [], term, next: null, op: null }, message: `Start with ${n}. The operations cycle multiply, divide, add and subtract.` }]
  let op = 0
  for (let x = n - 1; x >= 1; x--) {
    const symbol = OPS[op % 4]
    op++
    frames.push({ phase: 'inspect', activeLine: L('for x from n - 1 down to 1'), pythonLine: P('enumerate(range(n - 1, 0, -1))'), snapshot: { terms: [...terms], term, next: x, op: symbol }, message: `Next operation is ${symbol}, applied to ${x}.` })
    if (symbol === '*') term = Math.trunc(term * x)
    else if (symbol === '/') term = Math.trunc(term / x)
    else if (symbol === '+') {
      terms.push(term)
      term = x
    } else {
      terms.push(term)
      term = -x
    }
    const branch = { '*': ['if operation is multiply', 'if op == "*"'], '/': ['if operation is divide', 'elif op == "/"'], '+': ['if operation is add', 'elif op == "+"'], '-': ['if operation is subtract', 'term = -x'] }[symbol]
    frames.push({ phase: 'update', activeLine: L(branch[0]), pythonLine: P(branch[1]), snapshot: { terms: [...terms], term, next: x, op: symbol }, message: symbol === '*' || symbol === '/' ? `The current term becomes ${term}.` : `Close the previous term and start a ${symbol === '+' ? 'positive' : 'negative'} term at ${term}.` })
  }
  terms.push(term)
  const result = terms.reduce((a, b) => a + b, 0)
  frames.push({ phase: 'done', activeLine: L('return sum(terms)'), pythonLine: P('return sum(terms)'), snapshot: { terms: [...terms], term: null, next: null, op: null }, message: `Terms ${terms.join(', ')} sum to ${result}.` })
  return { input: { n }, result, frames }
}

export const code = `clumsy factorial (n):
  term = n
  for x from n - 1 down to 1:
    operation = next of multiply, divide, add, subtract (cycling)
    if operation is multiply: term = trunc(term * x)
    if operation is divide: term = trunc(term / x)
    if operation is add: close term into terms, then term = x
    if operation is subtract: close term into terms, then term = -x
  close term into terms
  return sum(terms)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def clumsy(n):
    ops = ["*", "/", "+", "-"]
    terms = []
    term = n
    for i, x in enumerate(range(n - 1, 0, -1)):
        op = ops[i % 4]
        if op == "*":
            term = int(term * x)
        elif op == "/":
            term = int(term / x)
        elif op == "+":
            terms.append(term)
            term = x
        else:
            terms.append(term)
            term = -x
    terms.append(term)
    return sum(terms)
`
