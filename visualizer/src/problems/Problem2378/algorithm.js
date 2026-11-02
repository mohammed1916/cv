const CODE = [
  'FUNCTION maxScore(parents, weights)',
  '    children ← child lists built from parents',
  '    order ← nodes listed so that every child comes before its parent',
  '    free[v] ← best total in v subtree with v not matched to a child',
  '    matched[v] ← best total in v subtree with v matched to one child',
  '    FOR each node v in order',
  '        total ← sum of max(free[c], matched[c]) over children c',
  '        free[v] ← total',
  '        matched[v] ← max over children c of total - max(free[c], matched[c]) + free[c] + weights[c]',
  '    RETURN max(free[root], matched[root])',
]

const PY = [
  'def max_score(parents, weights):',
  '    n = len(parents)',
  '    children = [[] for _ in range(n)]',
  '    for v in range(1, n):',
  '        children[parents[v]].append(v)',
  '    order = [0]',
  '    for v in order:',
  '        order.extend(children[v])',
  '    NEG = float("-inf")',
  '    free = [0] * n',
  '    matched = [NEG] * n',
  '    for v in reversed(order):',
  '        total = sum(max(free[c], matched[c]) for c in children[v])',
  '        free[v] = total',
  '        best = NEG',
  '        for c in children[v]:',
  '            best = max(best, total - max(free[c], matched[c]) + free[c] + weights[c])',
  '        matched[v] = best',
  '    return max(free[0], matched[0])',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export const phases = [
  { id: 'start', label: 'Build', description: 'Read the tree and list children before parents.' },
  { id: 'node', label: 'Node', description: 'Combine the children of this node.' },
  { id: 'candidate', label: 'Match child', description: 'Try matching this node to one child through the edge.' },
  { id: 'done', label: 'Result', description: 'The root holds the best score.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with parents and weights.')
  const { parents, weights } = input
  if (!Array.isArray(parents) || !Array.isArray(weights) || parents.length !== weights.length) throw new Error('parents and weights must be lists of the same length.')
  const n = parents.length
  if (n < 1 || n > 10) throw new Error('The visualization caps the tree at 10 nodes.')
  if (parents[0] !== -1) throw new Error('Node 0 is the root and its parent is -1.')
  for (let v = 1; v < n; v++) {
    if (!Number.isInteger(parents[v]) || parents[v] < 0 || parents[v] >= n) throw new Error('Each parent must name another node.')
    let u = v, steps = 0
    while (u !== 0 && steps++ <= n) u = parents[u]
    if (u !== 0) throw new Error('parents must form a tree rooted at 0.')
  }
  if (!weights.every(w => Number.isInteger(w) && w >= -100 && w <= 100)) throw new Error('Weights are integers from -100 to 100 in this visualization.')
  return { parents, weights }
}

export function buildTrace({ parents, weights }) {
  const n = parents.length
  const children = Array.from({ length: n }, () => [])
  for (let v = 1; v < n; v++) children[parents[v]].push(v)
  const order = [0]
  for (let i = 0; i < order.length; i++) order.push(...children[order[i]])
  const NEG = -Infinity
  const free = Array(n).fill(0)
  const matched = Array(n).fill(NEG)
  const shown = v => (v === NEG ? null : v)
  const frames = []
  const snapshot = (current, child, message, phase, activeLine, pythonLine) => frames.push({ pythonLine, phase, activeLine, node: current, child, order: [...order].reverse(), free: free.map((x, i) => (done.has(i) ? x : null)), matched: matched.map((x, i) => (done.has(i) ? shown(x) : null)), message })
  const done = new Set()
  snapshot(null, null, 'Build the children lists. Process nodes so that every child is handled before its parent.', 'start', codeLine('children ← child lists built from parents'), pyLine('children[parents[v]].append(v)'))
  for (const v of [...order].reverse()) {
    const total = children[v].reduce((sum, c) => sum + Math.max(free[c], matched[c]), 0)
    snapshot(v, null, `Node ${v}: the children contribute their best totals, ${children[v].map(c => `child ${c} gives ${Math.max(free[c], matched[c])}`).join(', ') || 'none (leaf)'}. Sum ${total}.`, 'node', codeLine('total ← sum of max(free[c], matched[c]) over children c'), pyLine('total = sum(max(free[c], matched[c]) for c in children[v])'))
    free[v] = total
    done.add(v)
    let best = NEG
    for (const c of children[v]) {
      const candidate = total - Math.max(free[c], matched[c]) + free[c] + weights[c]
      best = Math.max(best, candidate)
      snapshot(v, c, `Match ${v} with child ${c} using weight ${weights[c]}: the child must stay free for this edge, giving ${candidate}.`, 'candidate', codeLine('matched[v] ← max over children c of total - max(free[c], matched[c]) + free[c] + weights[c]'), pyLine('best = max(best, total - max(free[c], matched[c]) + free[c] + weights[c])'))
    }
    matched[v] = best
  }
  const answer = Math.max(free[0], matched[0])
  frames.push({ pythonLine: pyLine('return max(free[0], matched[0])'), phase: 'done', activeLine: codeLine('RETURN max(free[root], matched[root])'), node: 0, child: null, order: [...order].reverse(), free: [...free], matched: matched.map(shown), message: `Root keeps the best total ${answer}. Selecting no edge is included as the free option.` })
  return { input: { parents, weights }, result: answer, free: [...free], matched: matched.map(shown), frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
