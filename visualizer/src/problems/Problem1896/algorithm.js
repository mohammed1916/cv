const apply = (op, x, y) => (op === '&' ? x & y : x | y)
const flip = op => (op === '&' ? '|' : '&')

// Parse into a tree: leaves are digits, inner nodes are [op, left, right] built left to right inside each group.
export function parseExpression(text) {
  let pos = 0
  const term = () => {
    if (text[pos] === '(') {
      pos += 1
      const node = expr()
      pos += 1
      return node
    }
    return { leaf: Number(text[pos++]) }
  }
  const expr = () => {
    let node = term()
    while (pos < text.length && (text[pos] === '&' || text[pos] === '|')) {
      const op = text[pos++]
      node = { op, left: node, right: term() }
    }
    return node
  }
  return expr()
}

// cost[t] = fewest edits so that the subtree evaluates to t. Subtrees are independent, so the table combines exactly.
export function costTable(node) {
  if (node.leaf !== undefined) {
    const v = node.leaf
    return { value: v, cost: v === 0 ? [0, 1] : [1, 0] }
  }
  const a = costTable(node.left), b = costTable(node.right)
  const value = apply(node.op, a.value, b.value)
  const cost = [Infinity, Infinity]
  for (const t of [0, 1]) {
    for (const [op, extra] of [[node.op, 0], [flip(node.op), 1]]) {
      for (const x of [0, 1]) for (const y of [0, 1]) {
        if (apply(op, x, y) === t) cost[t] = Math.min(cost[t], extra + a.cost[x] + b.cost[y])
      }
    }
  }
  return { value, cost }
}

export function minCostToChangeFinalValue(text) {
  const root = costTable(parseExpression(text))
  return root.cost[1 - root.value]
}

// Reference evaluator for the same left-to-right rule, used by the tests.
export function evaluate(text) {
  return costTable(parseExpression(text)).value
}
