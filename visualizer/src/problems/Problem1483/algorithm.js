export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with parent and queries.')
  const { parent, queries } = data
  if (!Array.isArray(parent) || parent.length < 1 || parent.length > 12) throw new Error('parent must be an array of 1 to 12 entries.')
  const n = parent.length
  if (parent[0] !== -1) throw new Error('parent[0] must be -1 because node 0 is the root.')
  for (let i = 1; i < n; i++) {
    if (!Number.isInteger(parent[i]) || parent[i] < 0 || parent[i] >= n) throw new Error('Each parent must be a node number from 0 to n-1.')
  }
  for (let i = 0; i < n; i++) {
    let v = i
    for (let step = 0; step <= n && v !== -1; step++) v = parent[v]
    if (v !== -1) throw new Error('parent must describe a tree with no cycles.')
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('queries must be an array of 1 to 8 [node, k] pairs.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || !Number.isInteger(q[0]) || !Number.isInteger(q[1]) || q[0] < 0 || q[0] >= n || q[1] < 1 || q[1] > n) {
      throw new Error('Each query is [node, k] with 0 <= node < n and 1 <= k <= n.')
    }
  }
  return { parent, queries }
}

export const code = `kth ancestor for each query using binary lifting
  let n be the number of nodes and LOG be four
  let up[0] be the parent array
  for each level j from 1 to LOG minus 1
  up[j][v] is up[j-1] applied twice, or minus one if missing
  for each query [node, k]
  let v be node
  for each bit j set in k
  move v to up[j][v], or keep minus one if v is already minus one
  record v as the answer
  return the recorded answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ parent, queries }) {
  const LOG = 4
  const up = [parent.slice()]
  const frames = [{ phase: 'start', activeLine: L('let n be the number'), node: -1, jump: 0, up: up[0], message: 'Build jump tables: 1 step, 2 steps, 4 steps and so on.' }]
  for (let j = 1; j < LOG; j++) {
    up[j] = up[j - 1].map(p => (p === -1 ? -1 : up[j - 1][p]))
    frames.push({ phase: 'lift', activeLine: L('up[j][v] is'), node: -1, jump: j, up: up[j], message: `Jump table ${1 << j} steps up.` })
  }
  const answers = []
  for (const [node, k] of queries) {
    let v = node
    frames.push({ phase: 'query', activeLine: L('for each query'), node, jump: -1, up: null, message: `Find the ${k}th ancestor of ${node}.` })
    for (let j = 0; j < LOG; j++) {
      if (((k >> j) & 1) === 1) {
        v = v === -1 ? -1 : up[j][v]
        frames.push({ phase: 'jump', activeLine: L('move v to up'), node, jump: j, up: null, message: `Jump ${1 << j} step(s) to reach ${v === -1 ? 'nothing' : v}.` })
      }
    }
    answers.push(v)
    frames.push({ phase: 'answer', activeLine: L('record v as the answer'), node, jump: -1, up: null, message: `Answer: ${v}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the recorded answers'), node: -1, jump: -1, up: null, message: `Answers: [${answers.join(', ')}].` })
  return { input: { parent, queries }, result: answers, frames }
}

export const python = `def kth_ancestors(parent, queries):
    LOG = 4
    up = [list(parent)]
    for j in range(1, LOG):
        prev = up[j - 1]
        up.append([-1 if p == -1 else prev[p] for p in prev])
    answers = []
    for node, k in queries:
        v = node
        for j in range(LOG):
            if (k >> j) & 1:
                v = -1 if v == -1 else up[j][v]
        answers.append(v)
    return answers
`
