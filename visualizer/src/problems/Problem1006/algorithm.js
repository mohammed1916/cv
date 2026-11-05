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
  const frames = [{ phase: 'start', activeLine: L('let term = n'), pythonLine: P('term = n'), snapshot: { terms: [], term, next: null, op: null }, message: `Start with ${n}. The operations cycle multiply, divide, add and subtract.` }]
  let op = 0
  for (let x = n - 1; x >= 1; x--) {
    const symbol = OPS[op % 4]
    op++
    frames.push({ phase: 'inspect', activeLine: L('for (let x = n - 1'), pythonLine: P('for x in range(n - 1, 0, -1)'), snapshot: { terms: [...terms], term, next: x, op: symbol }, message: `Next operation is ${symbol}, applied to ${x}.` })
    if (symbol === '*') term = Math.trunc(term * x)
    else if (symbol === '/') term = Math.trunc(term / x)
    else if (symbol === '+') {
      terms.push(term)
      term = x
    } else {
      terms.push(term)
      term = -x
    }
    const branch = { '*': ["if (symbol === '*')", 'if symbol == "*"'], '/': ["else if (symbol === '/')", 'elif symbol == "/"'], '+': ["else if (symbol === '+')", 'elif symbol == "+"'], '-': ['} else {', 'else:'] }[symbol]
    frames.push({ phase: 'update', activeLine: L(branch[0]), pythonLine: P(branch[1]), snapshot: { terms: [...terms], term, next: x, op: symbol }, message: symbol === '*' || symbol === '/' ? `The current term becomes ${term}.` : `Close the previous term and start a ${symbol === '+' ? 'positive' : 'negative'} term at ${term}.` })
  }
  terms.push(term)
  const result = terms.reduce((a, b) => a + b, 0)
  frames.push({ phase: 'done', activeLine: L('return terms.reduce'), pythonLine: P('return sum(terms)'), snapshot: { terms: [...terms], term: null, next: null, op: null }, message: `Terms ${terms.join(', ')} sum to ${result}.` })
  return { input: { n }, result, frames }
}

export const code = `function clumsy(n) {
  const ops = ['*', '/', '+', '-']
  const terms = []
  let term = n
  let op = 0
  for (let x = n - 1; x >= 1; x--) {
    const symbol = ops[op % 4]
    op++
    if (symbol === '*') term = Math.trunc(term * x)
    else if (symbol === '/') term = Math.trunc(term / x)
    else if (symbol === '+') {
      terms.push(term)
      term = x
    } else {
      terms.push(term)
      term = -x
    }
  }
  terms.push(term)
  return terms.reduce((a, b) => a + b, 0)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def clumsy(n):
    ops = ["*", "/", "+", "-"]
    terms = []
    term = n
    op = 0
    for x in range(n - 1, 0, -1):
        symbol = ops[op % 4]
        op += 1
        if symbol == "*":
            term = int(term * x)
        elif symbol == "/":
            term = int(term / x)
        elif symbol == "+":
            terms.append(term)
            term = x
        else:
            terms.append(term)
            term = -x
    terms.append(term)
    return sum(terms)
`
