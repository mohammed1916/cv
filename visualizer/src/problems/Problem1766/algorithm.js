export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and edges.')
  const { nums, edges } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums must have 1 to 12 values.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Each value is an integer from 1 to 50.')
  if (!Array.isArray(edges) || edges.length !== nums.length - 1) throw new Error('A tree on n nodes needs n - 1 edges.')
  const parentOf = nums.map((_, i) => i)
  const find = x => (parentOf[x] === x ? x : (parentOf[x] = find(parentOf[x])))
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || e.some(v => !Number.isInteger(v) || v < 0 || v >= nums.length)) throw new Error('Each edge is a pair of node indices in range.')
    const [a, b] = e
    if (find(a) === find(b)) throw new Error('The edges must form a tree without cycles.')
    parentOf[find(a)] = find(b)
  }
  return { nums, edges }
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function buildTrace({ nums, edges }) {
  const n = nums.length
  const adjacency = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adjacency[a].push(b); adjacency[b].push(a) }
  const tree = Array.from({ length: n }, (_, id) => ({ id, children: [] }))
  const answer = Array(n).fill(-1)
  const seen = Array(n).fill(false)
  const frames = []
  frames.push({ phase: 'start', activeLine: L('build the adjacency'), node: 0, target: -1, answer: [...answer], message: 'Build the tree and start a walk at node 0.' })
  const visit = (v, ancestors) => {
    seen[v] = true
    frames.push({ phase: 'visit', activeLine: L('visit a node with a stack'), node: v, target: -1, answer: [...answer], message: `Visit node ${v} with value ${nums[v]}.` })
    let found = -1
    for (let k = ancestors.length - 1; k >= 0; k--) {
      const a = ancestors[k]
      const shared = gcd(nums[a], nums[v])
      frames.push({ phase: 'scan', activeLine: L('for each ancestor from nearest'), node: v, target: a, answer: [...answer], message: `Ancestor ${a} has value ${nums[a]}; gcd with ${nums[v]} is ${shared}.` })
      if (shared === 1) { found = a; break }
    }
    answer[v] = found
    if (found === -1) {
      frames.push({ phase: 'none', activeLine: L('set answer to -1'), node: v, target: -1, answer: [...answer], message: `No ancestor is coprime with ${nums[v]}; the answer is -1.` })
    } else {
      frames.push({ phase: 'found', activeLine: L('shares no factor'), node: v, target: found, answer: [...answer], message: `Nearest coprime ancestor of node ${v} is ${found}.` })
    }
    const next = [...ancestors, v]
    for (const w of adjacency[v]) {
      if (!seen[w]) {
        tree[v].children.push(tree[w])
        visit(w, next)
      }
    }
  }
  visit(0, [])
  frames.push({ phase: 'done', activeLine: L('return the answers'), node: -1, target: -1, answer: [...answer], message: `Answers: [${answer.join(', ')}].` })
  return { input: { nums, edges }, root: tree[0], result: answer, frames }
}

export const code = `nearest coprime ancestor for every node
  build the adjacency list and start a walk at node 0
  visit a node with a stack of ancestors
    set answer to -1
    for each ancestor from nearest to farthest
      if that ancestor shares no factor with this node then set answer to it and stop scanning
    add this node to the ancestors
    visit each unvisited neighbour
    remove this node from the ancestors
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import gcd

def coprime_ancestors(nums, edges):
    n = len(nums)
    adjacency = [[] for _ in range(n)]
    for a, b in edges:
        adjacency[a].append(b)
        adjacency[b].append(a)
    answer = [-1] * n

    def visit(v, parent, ancestors):
        answer[v] = -1
        for idx in reversed(ancestors):
            if gcd(nums[idx], nums[v]) == 1:
                answer[v] = idx
                break
        ancestors.append(v)
        for w in adjacency[v]:
            if w != parent:
                visit(w, v, ancestors)
        ancestors.pop()

    visit(0, -1, [])
    return answer
`
