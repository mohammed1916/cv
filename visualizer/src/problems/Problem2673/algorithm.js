export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n and cost.')
  const { n, cost } = data
  if (!Number.isInteger(n) || n < 3 || n > 15 || n % 2 === 0) throw new Error('n must be an odd integer from 3 to 15.')
  if (!Array.isArray(cost) || cost.length !== n || cost.some(v => !Number.isInteger(v) || v < 1 || v > 9)) throw new Error(`cost must list ${n} integers from 1 to 9.`)
  return { n, cost }
}

export function buildTrace(input) {
  const { n, cost } = input
  // Path cost of node i (1-based): the cost of the node plus the costliest path below it.
  const path = [0, ...cost]
  const frames = []
  let total = 0
  const frame = (phase, line, node, left, right, message) => frames.push({
    phase, activeLine: line, node, left, right, total, path: [...path], message,
  })
  frame('start', L('set total increments to 0'), null, null, null, 'Leaves start with their own cost. Work upward from the last internal node.')
  for (let i = (n - 1) / 2; i >= 1; i--) {
    const left = 2 * i, right = 2 * i + 1
    frame('pair', L('set left to node'), i, left, right, `Node ${i} compares its children ${left} and ${right}, with path costs ${path[left]} and ${path[right]}.`)
    total += Math.abs(path[left] - path[right])
    frame('balance', L('add the absolute difference'), i, left, right, `Raise the cheaper side by ${Math.abs(path[left] - path[right])}, so the two children match.`)
    path[i] = cost[i - 1] + Math.max(path[left], path[right])
    frame('lift', L('set path cost of node'), i, left, right, `Node ${i} now has path cost ${path[i]}, its cost plus the costlier child.`)
  }
  frame('done', L('return total increments'), null, null, null, `The fewest increments needed: ${total}.`)
  return { input, result: total, frames }
}

export const code = `minimum cost increments so every root-to-leaf path has equal cost
  children of node i are 2i and 2i plus 1, with nodes numbered 1 to n
  set total increments to 0
  for each internal node i from the last one down to 1, do
    set left to node 2i and right to node 2i plus 1
    add the absolute difference of their path costs to total increments
    set path cost of node i to its cost plus the larger child path cost
  return total increments`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_increments(n, cost):
    path = [0] + list(cost)
    total = 0
    for i in range((n - 1) // 2, 0, -1):
        left, right = 2 * i, 2 * i + 1
        total += abs(path[left] - path[right])
        path[i] = path[i] + max(path[left], path[right])
    return total
`
