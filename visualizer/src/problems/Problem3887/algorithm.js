const codeLines = `set count to 0
for each node v: parent[v] = v and parity[v] = 0
for each edge (u, v, w) in order
  find the root and parity of u and of v
  if the roots differ then join them with parity so that u xor v = w, count += 1
  else if parity[u] xor parity[v] equals w then count += 1
  otherwise skip the edge
return count`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))
const L = s => codeLines.findIndex(c => c.text.includes(s)) + 1
const pythonLines = `def count_added(n, edges):
    parent = list(range(n))
    par = [0] * n
    def find(x):
        if parent[x] == x:
            return x, 0
        root, p = find(parent[x])
        parent[x] = root
        par[x] ^= p
        return root, par[x]
    count = 0
    for u, v, w in edges:
        ru, pu = find(u)
        rv, pv = find(v)
        if ru != rv:
            parent[ru] = rv
            par[ru] = pu ^ pv ^ w
            count += 1
        elif pu ^ pv == w:
            count += 1
    return count`.split('\n')
const P = s => pythonLines.findIndex(t => t.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Number.isInteger(input.n) || !Array.isArray(input.edges)) throw new Error('Use an object with n and edges.')
  const { n, edges } = input
  if (n < 1 || n > 10) throw new Error('n is from 1 to 10 in this visual.')
  if (edges.length > 14) throw new Error('At most 14 edges in this visual.')
  for (const [u, v, w] of edges) {
    if (![u, v].every(x => Number.isInteger(x) && x >= 0 && x < n) || u === v) throw new Error('Each edge joins two different nodes below n.')
    if (w !== 0 && w !== 1) throw new Error('Edge weights are 0 or 1.')
  }
  return { n, edges }
}

export function buildTrace({ n, edges }) {
  const parent = Array.from({ length: n }, (_, i) => i)
  const par = Array(n).fill(0)
  const find = x => {
    if (parent[x] === x) return [x, 0]
    const [root, p] = find(parent[x])
    par[x] ^= p
    parent[x] = root
    return [root, par[x]]
  }
  const frames = []
  let count = 0
  edges.forEach(([u, v, w], index) => {
    const [ru, pu] = find(u)
    const [rv, pv] = find(v)
    let added
    let message
    if (ru !== rv) {
      parent[ru] = rv
      par[ru] = pu ^ pv ^ w
      added = true
      message = `Edge ${u}-${v} (weight ${w}) joins two parts; no new cycle.`
    } else {
      added = (pu ^ pv) === w
      message = added ? `Edge ${u}-${v} closes a cycle with even total weight.` : `Edge ${u}-${v} would close an odd cycle; skipped.`
    }
    if (added) count++
    frames.push({ phase: 'edge', activeLine: L(ru !== rv ? 'join them' : 'if the roots'), pythonLine: P(ru !== rv ? 'parent[ru] = rv' : 'elif pu ^ pv'), index, edge: [u, v, w], added, count,
      parent: parent.slice(), par: par.slice(), message })
  })
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), index: -1, edge: null, added: null, count, parent: parent.slice(), par: par.slice(),
    message: `${count} edge${count === 1 ? '' : 's'} added.` })
  return { input: { n, edges }, result: count, frames }
}

export const code = codeLines
export const python = pythonLines.join('\n')
