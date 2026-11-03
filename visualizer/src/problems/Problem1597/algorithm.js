const PREC = { '+': 1, '-': 1, '*': 2, '/': 2 }

export function parseInput(text) {
  const raw = String(text).trim()
  const expr = raw.startsWith('"') ? JSON.parse(raw) : raw
  if (typeof expr !== 'string') throw new Error('Use an infix string such as "12+3*4".')
  if (expr.length < 1 || expr.length > 21) throw new Error('The expression has 1 to 21 characters.')
  if (!/^[0-9+\-*\/()]+$/.test(expr)) throw new Error('Use digits, + - * / and parentheses only, with no spaces.')
  const tokens = expr.match(/\d+|[-+*\/()]/g)
  let want = 'operand'
  let depth = 0
  for (const tok of tokens) {
    const isNum = /^\d+$/.test(tok)
    if (want === 'operand') {
      if (isNum) want = 'operator'
      else if (tok === '(') depth++
      else throw new Error(`Expected a number or "(" before "${tok}".`)
    } else if (tok === ')') {
      if (--depth < 0) throw new Error('Unmatched ")".')
    } else if (isNum || tok === '(') {
      throw new Error(`Expected an operator before "${tok}".`)
    } else {
      want = 'operand'
    }
  }
  if (want === 'operand') throw new Error('The expression must end with a number or ")".')
  if (depth !== 0) throw new Error('Parentheses are not balanced.')
  return { expr, tokens }
}

// Evaluates a built tree with integer division truncated toward zero.
function evaluate(nodes, id) {
  const n = nodes[id]
  if (n.left === null) return Number(n.val)
  const a = evaluate(nodes, n.left)
  const b = evaluate(nodes, n.right)
  if (n.val === '+') return a + b
  if (n.val === '-') return a - b
  if (n.val === '*') return a * b
  if (b === 0) throw new Error('Division by zero.')
  return Math.trunc(a / b)
}

export function buildTrace({ expr, tokens }) {
  const nodes = []
  const operands = []
  const operators = []
  const frames = []
  const newNode = val => {
    const id = nodes.length
    nodes.push({ id, val, left: null, right: null })
    return id
  }
  let curToken = -1
  const snap = extra => frames.push({
    operands: [...operands],
    operators: [...operators],
    nodes: nodes.map(n => ({ ...n })),
    made: -1,
    token: curToken,
    ...extra,
  })
  const combine = why => {
    const op = operators.pop()
    const right = operands.pop()
    const left = operands.pop()
    const id = newNode(op)
    nodes[id].left = left
    nodes[id].right = right
    operands.push(id)
    const lv = nodes[left].val
    const rv = nodes[right].val
    snap({
      phase: 'combine', activeLine: L('combine: pop'), pythonLine: P('op = operators.pop()'), made: id,
      message: `${why} Pop ${op}; build ${lv} ${op} ${rv} as a node.`,
    })
    return id
  }

  snap({ phase: 'start', activeLine: L('operands and operators start'), pythonLine: P('operands = []'), message: 'Both stacks start empty.' })
  tokens.forEach((tok, i) => {
    curToken = i
    snap({ phase: 'read', activeLine: L('for each token'), pythonLine: P('for tok in'), token: i, message: `Read token ${tok}.` })
    if (/^\d+$/.test(tok)) {
      const id = newNode(tok)
      operands.push(id)
      snap({ phase: 'leaf', activeLine: L('push a leaf node'), pythonLine: P('operands.append(Node(tok))'), token: i, made: id, message: `${tok} is an operand; push a leaf.` })
    } else if (tok === '(') {
      operators.push(tok)
      snap({ phase: 'open', activeLine: L('"(" then push'), pythonLine: P("elif tok == '('"), token: i, message: 'Open parenthesis: push it as a barrier.' })
    } else if (tok === ')') {
      while (operators[operators.length - 1] !== '(') {
        combine('Close parenthesis.')
      }
      operators.pop()
      snap({ phase: 'discard', activeLine: L('then discard'), pythonLine: P('            operators.pop()'), token: i, message: 'Discard the matching "(".' })
    } else {
      while (operators.length && operators[operators.length - 1] !== '(' && PREC[operators[operators.length - 1]] >= PREC[tok]) {
        snap({ phase: 'compare', activeLine: L('combine while the top'), pythonLine: P('while operators and'), token: i, message: `Top ${operators[operators.length - 1]} has precedence at least ${tok}; combine first.` })
        combine('Left associativity.')
      }
      operators.push(tok)
      snap({ phase: 'push', activeLine: L('then push the token'), pythonLine: P('operators.append(tok)', true), token: i, message: `Push ${tok} onto operators.` })
    }
  })
  curToken = -1
  snap({ phase: 'finish', activeLine: L('combine until operators is empty'), pythonLine: P('while operators:'), message: 'Input is consumed; combine what remains.' })
  while (operators.length) combine('Drain.')
  const root = operands[0]
  let result = null
  let note = ''
  try {
    result = evaluate(nodes, root)
    note = `The tree evaluates to ${result}.`
  } catch (e) {
    note = `The tree is built, but ${e.message}`
  }
  snap({ phase: 'done', activeLine: L('return the single node'), pythonLine: P('return operands[0]'), message: note })
  return { input: { expr, tokens }, result, root, frames }
}

function locate(lines, text, fromEnd) {
  const order = lines.map((line, i) => i)
  if (fromEnd) order.reverse()
  const index = order.find(i => lines[i].includes(text))
  if (index === undefined) throw new Error(`Missing text: ${text}`)
  return index + 1
}

export const code = `build an expression tree from the infix string
  operands and operators start as empty stacks
  for each token from left to right
    if the token is a number then push a leaf node on operands
    else if the token is "(" then push it on operators
    else if the token is ")" then combine until "(" is on top, then discard it
    else combine while the top operator has precedence at least the token's
      then push the token on operators
  combine until operators is empty
  return the single node left on operands as the root
  combine: pop an operator and two operands and make a node
    the node's left is the earlier operand and right is the later one`.split('\n').map((text, index) => ({ line: index + 1, text }))

const lines = code.map(c => c.text)
const L = s => {
  const index = lines.findIndex(text => text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}
const P = (s, fromEnd = false) => locate(python.split('\n'), s, fromEnd)

export const python = `import re


class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None


def build_tree(expr):
    prec = {'+': 1, '-': 1, '*': 2, '/': 2}
    operands = []
    operators = []

    def combine():
        op = operators.pop()
        right = operands.pop()
        left = operands.pop()
        node = Node(op)
        node.left = left
        node.right = right
        operands.append(node)

    for tok in re.findall(r'\\d+|[-+*/()]', expr):
        if tok.isdigit():
            operands.append(Node(tok))
        elif tok == '(':
            operators.append(tok)
        elif tok == ')':
            while operators[-1] != '(':
                combine()
            operators.pop()
        else:
            while operators and operators[-1] != '(' and prec[operators[-1]] >= prec[tok]:
                combine()
            operators.append(tok)
    while operators:
        combine()
    return operands[0]
`
