import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'

const code = [
  'parse the expression into a tree of groups',
  'for each leaf digit d: cost to make it d is 0, the other digit costs 1',
  'for each operator node with children A and B',
  '  for each target value t in 0 and 1',
  '    keep the operator, or flip it at cost 1',
  '    take the cheapest child pair that gives t',
  'the answer flips the root to the opposite of its value',
].map((text, index) => ({ line: index + 1, text }))

const python = `def min_cost_to_flip(expression):
    pos = 0
    def apply(op, x, y):
        return x & y if op == '&' else x | y
    def combine(op, a, b):
        value = apply(op, a[0], b[0])
        cost = []
        for target in (0, 1):
            best = float('inf')
            for choice, extra in ((op, 0), ('|' if op == '&' else '&', 1)):
                for x in (0, 1):
                    for y in (0, 1):
                        if apply(choice, x, y) == target:
                            best = min(best, extra + a[1][x] + b[1][y])
            cost.append(best)
        return (value, cost)
    def term():
        nonlocal pos
        if expression[pos] == '(':
            pos += 1
            node = expr()
            pos += 1
            return node
        value = int(expression[pos])
        pos += 1
        return (value, [0, 1] if value == 0 else [1, 0])
    def expr():
        nonlocal pos
        node = term()
        while pos < len(expression) and expression[pos] in '&|':
            op = expression[pos]
            pos += 1
            node = combine(op, node, term())
        return node
    root = expr()
    return root[1][1 - root[0]]
`

const PY = { leaf: 26, combine: 33, answer: 36 }

export function parse(text) {
  const input = JSON.parse(text)
  const expression = input?.expression
  if (typeof expression !== 'string' || expression.length < 1 || expression.length > 15) throw new Error('expression is a string of 1 to 15 characters.')
  if (!/^[01&|()]+$/.test(expression)) throw new Error('Use only 0, 1, &, |, ( and ).')
  return { expression }
}

// Sample grammar: a group is read left to right; parentheses set the grouping.
export function build({ expression }) {
  let pos = 0
  const frames = []
  const nodes = []
  const apply = (op, x, y) => (op === '&' ? x & y : x | y)
  const record = (phase, label, value, cost, line, pythonLine, message) => {
    nodes.push({ label, value, cost })
    frames.push({ phase, activeLine: line, pythonLine, message, nodes: nodes.map(n => ({ ...n, cost: [...n.cost] })) })
  }
  const combine = (op, a, b, label) => {
    const value = apply(op, a.value, b.value)
    const cost = [0, 1].map(target => {
      let best = Infinity
      for (const [choice, extra] of [[op, 0], [op === '&' ? '|' : '&', 1]]) {
        for (const x of [0, 1]) for (const y of [0, 1]) {
          if (apply(choice, x, y) === target) best = Math.min(best, extra + a.cost[x] + b.cost[y])
        }
      }
      return best
    })
    record('combine', 'combine', value, cost, 3, PY.combine, `${label}: value ${value}, cost to make 0 is ${cost[0]}, to make 1 is ${cost[1]}.`)
    return { value, cost, label }
  }
  const term = () => {
    if (expression[pos] === '(') {
      pos += 1
      const node = expr()
      pos += 1
      return node
    }
    const value = Number(expression[pos])
    pos += 1
    const cost = value === 0 ? [0, 1] : [1, 0]
    record('leaf', String(value), value, cost, 2, PY.leaf, `Leaf ${value}: cost ${cost[0]} to make 0, ${cost[1]} to make 1.`)
    return { value, cost, label: String(value) }
  }
  const expr = () => {
    let node = term()
    while (pos < expression.length && (expression[pos] === '&' || expression[pos] === '|')) {
      const op = expression[pos]
      pos += 1
      const right = term()
      node = combine(op, node, right, `${node.label} ${op} ${right.label}`)
    }
    return node
  }
  const root = expr()
  if (pos !== expression.length) throw new Error('Unexpected text after the expression. Check parentheses.')
  const answer = root.cost[1 - root.value]
  frames.push({ phase: 'answer', activeLine: 7, pythonLine: PY.answer, message: `Final value is ${root.value}; flipping it costs ${answer}.`, nodes: nodes.map(n => ({ ...n, cost: [...n.cost] })) })
  return { input: { expression }, result: answer, frames }
}

const definition = {
  phases: [
    { id: 'leaf', label: 'Digits', description: 'Each digit costs 0 for itself and 1 for the other value.' },
    { id: 'combine', label: 'Combine', description: 'Price each operator and its flip.' },
    { id: 'answer', label: 'Answer', description: 'Flip the root to the other value.' },
  ],
  parse, build, code, python,
  inputLabel: 'Object with expression (digits 0 and 1, operators & and |, parentheses)',
  url: 'https://leetcode.com/problems/minimum-cost-to-change-the-final-value-of-expression/',
  complexity: 'One pass over the tokens with a constant number of cases per node. The sample grammar reads operators left to right inside each parenthesised group.',
  examples: [
    { label: 'Example', input: '{"expression":"1|(0&1)"}' },
    { label: 'Nested', input: '{"expression":"((0&1)|1)"}' },
  ],
}

export default function MinimumCostToChangeFinalValue() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Subexpression costs">
      <thead><tr><th>Node</th><th>Value</th><th>Cost to 0</th><th>Cost to 1</th></tr></thead>
      <tbody>{step.nodes.map((node, i) => <tr key={i} data-current={i === step.nodes.length - 1 ? 'yes' : undefined}>
        <td>{node.label}</td><td>{node.value}</td><td>{Number.isFinite(node.cost[0]) ? node.cost[0] : '-'}</td><td>{Number.isFinite(node.cost[1]) ? node.cost[1] : '-'}</td>
      </tr>)}</tbody>
    </table>
  </>} renderReasoning={() => <>
    <p>Each group is summarised by two numbers: the fewest flips that make it 0 and the fewest that make it 1. Combining two groups only needs those summaries.</p>
    <p>An operator can be kept or swapped, and a swap costs one flip.</p>
  </>} />
}
