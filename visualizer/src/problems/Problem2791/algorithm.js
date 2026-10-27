export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with parent and s.')
  const { parent, s } = input
  if (!Array.isArray(parent) || parent.length < 1 || parent.length > 10) throw new Error('parent must have 1 to 10 entries.')
  if (parent[0] !== -1) throw new Error('The root (node 0) has parent -1.')
  for (let i = 1; i < parent.length; i++) {
    if (!Number.isInteger(parent[i]) || parent[i] < 0 || parent[i] >= i) throw new Error('Each parent is an earlier node, so the tree is rooted at 0.')
  }
  if (typeof s !== 'string' || s.length !== parent.length || !/^[a-e]+$/.test(s)) throw new Error('s has one letter a to e per node.')
  return { parent, s }
}

export function buildTrace({ parent, s }) {
  const n = parent.length
  const depth = Array(n).fill(0)
  for (let i = 1; i < n; i++) depth[i] = depth[parent[i]] + 1
  const pathNodes = (u, v) => {
    const left = [], right = []
    let a = u, b = v
    while (depth[a] > depth[b]) { left.push(a); a = parent[a] }
    while (depth[b] > depth[a]) { right.push(b); b = parent[b] }
    while (a !== b) { left.push(a); right.push(b); a = parent[a]; b = parent[b] }
    left.push(a)
    return [...left, ...right.reverse()]
  }
  const children = Array.from({ length: n }, () => [])
  for (let i = 1; i < n; i++) children[parent[i]].push(i)
  const tree = id => ({ id, children: children[id].map(tree) })
  const frames = []
  let count = 0
  frames.push({ phase: 'start', activeLine: L('set count to 0'), u: -1, v: -1, path: [], text: '', ok: null, count, message: 'Check every pair of nodes u less than v.' })
  for (let u = 0; u < n; u++) {
    for (let v = u + 1; v < n; v++) {
      const nodes = pathNodes(u, v)
      const text = nodes.map(x => s[x]).join('')
      const letters = {}
      for (const x of nodes) letters[s[x]] = (letters[s[x]] || 0) + 1
      const odd = Object.values(letters).filter(c => c % 2 === 1).length
      const ok = odd <= 1
      if (ok) count++
      frames.push({ phase: 'pair', activeLine: L('if at most one letter'), u, v, path: nodes, text, ok, count, message: `Path ${u} to ${v} reads "${text}" with ${odd} odd letter count${odd === 1 ? '' : 's'}; ${ok ? 'counted' : 'not counted'}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), u: -1, v: -1, path: [], text: '', ok: null, count, message: `Palindrome-able paths: ${count}.` })
  return { input: { parent, s }, root: tree(0), result: count, frames }
}

export const code = `count pairs u less than v whose path can form a palindrome
  set count to 0
  for each u from 0 to n minus 1
    for each v from u plus 1 to n minus 1
      collect the nodes on the path from u to v by climbing to their common ancestor
      count how many times each letter appears on those nodes
      if at most one letter appears an odd number of times then add one to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_palindrome_paths(parent, s):
    n = len(parent)
    depth = [0] * n
    for i in range(1, n):
        depth[i] = depth[parent[i]] + 1

    def path_nodes(u, v):
        left, right = [], []
        a, b = u, v
        while depth[a] > depth[b]:
            left.append(a)
            a = parent[a]
        while depth[b] > depth[a]:
            right.append(b)
            b = parent[b]
        while a != b:
            left.append(a)
            right.append(b)
            a = parent[a]
            b = parent[b]
        left.append(a)
        return left + right[::-1]

    count = 0
    for u in range(n):
        for v in range(u + 1, n):
            letters = {}
            for x in path_nodes(u, v):
                letters[s[x]] = letters.get(s[x], 0) + 1
            odd = sum(1 for c in letters.values() if c % 2 == 1)
            if odd <= 1:
                count += 1
    return count
`
