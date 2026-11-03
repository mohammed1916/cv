export const code = `build the child lists from the edges
list the nodes depth first from the root, parents before children
go through that list in reverse, so children come before parents
for a leaf, finish is its base duration
for a nonleaf, finish is twice the latest child finish minus the earliest child finish plus its duration
return the finish time of the root`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def finish_time(durations, edges):
    n = len(durations)
    children = [[] for _ in range(n)]
    for u, v in edges:
        children[u].append(v)
    order = []
    stack = [0]
    while stack:
        v = stack.pop()
        order.append(v)
        stack.extend(children[v])
    finish = [0] * n
    for v in reversed(order):
        if not children[v]:
            finish[v] = durations[v]
        else:
            ends = [finish[c] for c in children[v]]
            finish[v] = 2 * max(ends) - min(ends) + durations[v]
    return finish[0]
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with durations and edges.')
  const { durations, edges } = input
  if (!Array.isArray(durations) || durations.length < 1 || durations.length > 12) throw new Error('durations holds 1 to 12 integers.')
  if (!durations.every(d => Number.isInteger(d) && d >= 1 && d <= 100)) throw new Error('Each duration is an integer from 1 to 100.')
  const n = durations.length
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('edges must have exactly one pair per non-root task.')
  const parent = Array(n).fill(-1)
  for (const pair of edges) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(x => Number.isInteger(x) && x >= 0 && x < n)) throw new Error('Each edge is [parent, child] with valid task numbers.')
    const [u, v] = pair
    if (v === 0 || parent[v] !== -1 || u === v) throw new Error('Each task except 0 needs exactly one parent.')
    parent[v] = u
  }
  // Every task must be reachable from the root, which rules out cycles.
  const reach = new Set([0])
  let grew = true
  while (grew) {
    grew = false
    for (const [u, v] of edges) if (reach.has(u) && !reach.has(v)) { reach.add(v); grew = true }
  }
  if (reach.size !== n) throw new Error('The edges must form a tree rooted at 0.')
  return { durations, edges }
}

export function buildTrace({ durations, edges }) {
  const n = durations.length
  const children = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) children[u].push(v)
  const frames = []
  const finish = Array(n).fill(null)
  const push = (phase, codeText, pyText, node, ends, message) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), node, ends, children: children.map(c => [...c]),
    finish: [...finish], message,
  })
  push('start', 'build the child lists', 'children[u].append(v)', -1, null, 'Children lists are built from the parent-child edges.')
  const order = []
  const stack = [0]
  while (stack.length) {
    const v = stack.pop()
    order.push(v)
    stack.push(...children[v])
  }
  push('order', 'list the nodes depth first', 'order.append(v)', -1, null, `Depth-first order from the root: ${order.join(' ')}. Reversed, children come before parents.`)
  for (const v of [...order].reverse()) {
    if (children[v].length === 0) {
      finish[v] = durations[v]
      push('leaf', 'for a leaf, finish is its base duration', 'finish[v] = durations[v]', v, null, `Task ${v} is a leaf, so it finishes at ${durations[v]}.`)
    } else {
      const ends = children[v].map(c => finish[c])
      const latest = Math.max(...ends)
      const earliest = Math.min(...ends)
      finish[v] = 2 * latest - earliest + durations[v]
      push('node', 'for a nonleaf, finish is twice the latest', 'finish[v] = 2 * max(ends)', v, ends, `Task ${v}: 2 × ${latest} − ${earliest} + ${durations[v]} = ${finish[v]}.`)
    }
  }
  push('done', 'return the finish time of the root', 'return finish[0]', 0, null, `The root finishes at ${finish[0]}.`)
  return { input: { durations, edges }, result: finish[0], frames }
}
