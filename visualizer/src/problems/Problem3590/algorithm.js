export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with par, vals and queries, for example {"par":[-1,0,0],"vals":[1,1,1],"queries":[[0,1]]}.')
  const { par, vals, queries } = data
  if (!Array.isArray(vals) || vals.length < 1 || vals.length > 8) throw new Error('vals must have 1 to 8 entries.')
  if (!Array.isArray(par) || par.length !== vals.length) throw new Error('par must have the same length as vals.')
  if (vals.some(v => !Number.isInteger(v) || v < 0 || v > 15)) throw new Error('Each value is an integer from 0 to 15.')
  const n = vals.length
  if (par[0] !== -1) throw new Error('par[0] must be -1 for the root.')
  for (let i = 1; i < n; i++) {
    if (!Number.isInteger(par[i]) || par[i] < 0 || par[i] >= n || par[i] === i) throw new Error('Each par[i] must be another node label.')
    let v = i
    let steps = 0
    while (v !== 0 && steps <= n) { v = par[v]; steps++ }
    if (v !== 0) throw new Error('The parent array must describe a tree rooted at 0.')
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6) throw new Error('queries must have 1 to 6 pairs.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || !Number.isInteger(q[0]) || q[0] < 0 || q[0] >= n) throw new Error('Each query is [u, k] with u a node label.')
    if (!Number.isInteger(q[1]) || q[1] < 1 || q[1] > n) throw new Error('Each k is an integer from 1 to n.')
  }
  return { par: [...par], vals: [...vals], queries: queries.map(q => [...q]) }
}

export function buildTrace(input) {
  const { par, vals, queries } = input
  const n = vals.length
  const children = Array.from({ length: n }, () => [])
  for (let i = 1; i < n; i++) children[par[i]].push(i)
  const px = Array(n).fill(0)
  const order = [0]
  px[0] = vals[0]
  for (let i = 0; i < order.length; i++) {
    for (const c of children[order[i]]) { px[c] = px[order[i]] ^ vals[c]; order.push(c) }
  }
  const frames = [{ phase: 'start', activeLine: L('set px[0] to vals[0]'), query: null, answer: null, message: `The path XOR of each node is the XOR of values from the root down to it. Root value: ${vals[0]}.` }]
  const answers = []
  for (const [u, k] of queries) {
    // Collect the subtree of u by walking down from u.
    const subtree = []
    const stack = [u]
    while (stack.length) { const v = stack.pop(); subtree.push(v); for (const c of children[v]) stack.push(c) }
    const distinct = [...new Set(subtree.map(v => px[v]))].sort((a, b) => a - b)
    const answer = k <= distinct.length ? distinct[k - 1] : -1
    answers.push(answer)
    frames.push({ phase: 'query', activeLine: L('sorted distinct values'), query: [u, k], answer, message: `Subtree of ${u} has ${distinct.length} distinct path XOR values. The ${k}-th smallest is ${answer}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the answers'), query: null, answer: null, message: 'Every query is answered.' })
  return { input, result: answers, frames }
}

export const code = `kth smallest path xor sum (par, vals, queries)
  set px[0] to vals[0] and px[i] to px[par[i]] xor vals[i] in parent-first order
  set answers to an empty list
  for each query (u, k)
    collect the nodes of the subtree of u by walking down from u
    set distinct to the sorted distinct values of px over those nodes
    if k is at most the size of distinct then answer is distinct[k - 1], else answer is -1
    append the answer
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def kth_smallest_path_xor(par, vals, queries):
    n = len(vals)
    children = [[] for _ in range(n)]
    for i in range(1, n):
        children[par[i]].append(i)
    px = [0] * n
    px[0] = vals[0]
    order = [0]
    for v in order:
        for c in children[v]:
            px[c] = px[v] ^ vals[c]
            order.append(c)
    answers = []
    for u, k in queries:
        subtree = []
        stack = [u]
        while stack:
            v = stack.pop()
            subtree.append(v)
            stack.extend(children[v])
        distinct = sorted(set(px[v] for v in subtree))
        answers.append(distinct[k - 1] if k <= len(distinct) else -1)
    return answers
`
