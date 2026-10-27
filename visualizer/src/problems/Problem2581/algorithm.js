export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with edges, guesses, and k.')
  const { edges, guesses, k } = data
  if (!Array.isArray(edges) || edges.length < 1 || edges.length > 9) throw new Error('edges lists 1 to 9 pairs for a tree.')
  const n = edges.length + 1
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = v => (parent[v] === v ? v : (parent[v] = find(parent[v])))
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(v => Number.isInteger(v) && v >= 0 && v < n)) throw new Error(`Each edge joins two vertices from 0 to ${n - 1}.`)
    const [a, b] = edge
    if (find(a) === find(b)) throw new Error('The edges must form a tree: no cycles.')
    parent[find(a)] = find(b)
  }
  if (!Array.isArray(guesses) || guesses.length < 1 || guesses.length > 8) throw new Error('guesses lists 1 to 8 pairs [u, v].')
  const seen = new Set()
  for (const guess of guesses) {
    if (!Array.isArray(guess) || guess.length !== 2 || !guess.every(v => Number.isInteger(v) && v >= 0 && v < n) || guess[0] === guess[1]) throw new Error(`Each guess is a pair of different vertices from 0 to ${n - 1}.`)
    const key = `${guess[0]},${guess[1]}`
    if (seen.has(key)) throw new Error('Each guess appears at most once.')
    seen.add(key)
  }
  if (!Number.isInteger(k) || k < 0 || k > guesses.length) throw new Error(`k must be an integer from 0 to ${guesses.length}.`)
  return { edges, guesses, k }
}

export function buildTrace(input) {
  const { edges, guesses, k } = input
  const n = edges.length + 1
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const guessed = new Set(guesses.map(([u, v]) => `${u},${v}`))
  const has = (u, v) => guessed.has(`${u},${v}`)
  const parent = Array(n).fill(-1)
  const order = []
  const seen = Array(n).fill(false)
  seen[0] = true
  const stack = [0]
  while (stack.length) {
    const v = stack.pop()
    order.push(v)
    for (const w of adj[v]) if (!seen[w]) { seen[w] = true; parent[w] = v; stack.push(w) }
  }
  const correct = Array(n).fill(0)
  const frames = []
  const frame = (phase, line, node, message) => frames.push({ phase, activeLine: line, node, k, correct: [...correct], message })
  let base = 0
  for (let v = 1; v < n; v++) if (has(parent[v], v)) base++
  correct[0] = base
  frame('base', L('set base to'), 0, `Rooted at 0, ${base} of the ${guesses.length} guesses are correct.`)
  for (const v of order) {
    if (v === 0) continue
    const p = parent[v]
    correct[v] = correct[p] - (has(p, v) ? 1 : 0) + (has(v, p) ? 1 : 0)
    frame('reroot', L('set correct of v'), v, `Moving the root to ${v} changes only the edge ${p}-${v}: ${correct[v]} guesses are correct.`)
  }
  const roots = []
  for (let v = 0; v < n; v++) if (correct[v] >= k) roots.push(v)
  frame('done', L('return the number'), null, `${roots.length} roots have at least ${k} correct guesses.`)
  return { input, result: roots.length, frames }
}

export const code = `count roots where at least k guesses are correct
  build a neighbour list from the edges
  set guessed to the set of pairs in guesses
  set base to the number of correct guesses when rooted at 0
  walk the tree from 0 and list vertices so parents come first
  for each vertex v in that list except 0, do
    set correct of v to correct of its parent, minus guessed (parent, v), plus guessed (v, parent)
  return the number of vertices whose correct count is at least k`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def root_count(edges, guesses, k):
    n = len(edges) + 1
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    guessed = set((u, v) for u, v in guesses)
    parent = [-1] * n
    order = []
    seen = [False] * n
    seen[0] = True
    stack = [0]
    while stack:
        v = stack.pop()
        order.append(v)
        for w in adj[v]:
            if not seen[w]:
                seen[w] = True
                parent[w] = v
                stack.append(w)
    correct = [0] * n
    correct[0] = sum(1 for v in range(1, n) if (parent[v], v) in guessed)
    for v in order:
        if v == 0:
            continue
        p = parent[v]
        correct[v] = correct[p] - (1 if (p, v) in guessed else 0) + (1 if (v, p) in guessed else 0)
    return sum(1 for c in correct if c >= k)
`
