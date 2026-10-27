export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, edges and labels, such as {"n":2,"edges":[[0,1]],"labels":"ab"}.')
  const { n, edges, labels } = input
  if (!Number.isInteger(n) || n < 2 || n > 12) throw new Error('n must be an integer from 2 to 12.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error(`edges must hold exactly ${n - 1} pairs.`)
  if (typeof labels !== 'string' || labels.length !== n || !/^[a-z]+$/.test(labels)) throw new Error(`labels must be ${n} lowercase letters.`)
  const owner = Array.from({ length: n }, (_, i) => i)
  const find = x => (owner[x] === x ? x : (owner[x] = find(owner[x])))
  for (const pair of edges) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(v => Number.isInteger(v) && v >= 0 && v < n) || pair[0] === pair[1]) throw new Error('Each edge is a pair [a, b] of different node numbers from 0 to n-1.')
    const a = find(pair[0]), b = find(pair[1])
    if (a === b) throw new Error('The edges must form a tree, without cycles.')
    owner[a] = b
  }
  return { n, edges, labels }
}

export const code = `count nodes with the same label in each subtree
  root the tree at node 0 and order nodes so children come before parents
  set counts of every node to a zero vector of 26 letters
  for each node v from the bottom up
    add one to the letter of v in counts of v
    add the counts of each child of v into counts of v
    set answer of v to the count of the letter of v in counts of v
  return the answer list`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ n, edges, labels }) {
  const adj = Array.from({ length: n }, () => [])
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a) })
  const children = Array.from({ length: n }, () => [])
  const seen = Array(n).fill(false)
  seen[0] = true
  const order = [0]
  for (let q = 0; q < order.length; q++) {
    const p = order[q]
    for (const c of adj[p]) {
      if (seen[c]) continue
      seen[c] = true
      children[p].push(c)
      order.push(c)
    }
  }
  const counts = Array.from({ length: n }, () => Array(26).fill(0))
  const answer = Array(n).fill(null)
  const letter = v => labels.charCodeAt(v) - 97
  const frames = [{ phase: 'start', activeLine: L('root the tree at node 0'), current: null, answer: [...answer], message: 'Root the tree at node 0. Each subtree collects letter counts from its children.' }]
  for (let i = order.length - 1; i >= 0; i--) {
    const v = order[i]
    counts[v][letter(v)] += 1
    for (const child of children[v]) {
      for (let k = 0; k < 26; k++) counts[v][k] += counts[child][k]
    }
    answer[v] = counts[v][letter(v)]
    frames.push({ phase: 'climb', activeLine: L('set answer of v'), current: v, answer: [...answer], message: `Node ${v} (label ${labels[v]}): ${answer[v]} nodes in its subtree share that label.` })
  }
  const toTree = id => ({ id, children: children[id].map(child => toTree(child)) })
  frames.push({ phase: 'done', activeLine: L('return the answer list'), current: null, answer: [...answer], message: `Answers for nodes 0 to ${n - 1}: ${answer.join(', ')}.` })
  return { input: { n, edges, labels }, tree: toTree(0), labels, result: answer, frames }
}

export const python = `def count_same_label_subtree(n, edges, labels):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    parent = [-1] * n
    seen = [False] * n
    seen[0] = True
    order = [0]
    for current in order:
        for other in adj[current]:
            if not seen[other]:
                seen[other] = True
                parent[other] = current
                order.append(other)
    counts = [[0] * 26 for _ in range(n)]
    answer = [0] * n
    for current in reversed(order):
        own = ord(labels[current]) - 97
        counts[current][own] += 1
        for other in adj[current]:
            if parent[other] == current:
                for letter in range(26):
                    counts[current][letter] += counts[other][letter]
        answer[current] = counts[current][own]
    return answer
`
