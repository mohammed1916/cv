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
  const newParent = [...parent]
  const frames = []
  frames.push({ phase: 'start', activeLine: L('set new parent of every node'), node: -1, y: -1, sizes: null, message: 'Start with the original parents.' })
  for (let x = 1; x < n; x++) {
    let y = parent[x]
    frames.push({ phase: 'climb', activeLine: L('walk up from the original parent'), node: x, y, sizes: null, message: `Node ${x} (letter ${s[x]}) climbs from its parent ${y}.` })
    while (y !== -1) {
      if (s[y] === s[x]) {
        newParent[x] = y
        frames.push({ phase: 'change', activeLine: L('if an ancestor y has the same letter'), node: x, y, sizes: null, message: `Node ${x} moves under ancestor ${y}, which has the same letter.` })
        break
      }
      y = parent[y]
      if (y !== -1) frames.push({ phase: 'climb', activeLine: L('walk up from the original parent'), node: x, y, sizes: null, message: `Letter ${s[y === -1 ? 0 : y]} differs; continue upward.` })
    }
  }
  const size = Array(n).fill(1)
  frames.push({ phase: 'size', activeLine: L('set size of every node to 1'), node: -1, y: -1, sizes: [...size], message: 'Every node starts with size 1.' })
  for (let x = n - 1; x >= 1; x--) {
    size[newParent[x]] += size[x]
    frames.push({ phase: 'size', activeLine: L('add size of x'), node: x, y: newParent[x], sizes: [...size], message: `Add subtree ${x} (size ${size[x]}) to node ${newParent[x]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return sizes'), node: -1, y: -1, sizes: [...size], message: `Subtree sizes: [${size.join(', ')}].` })
  const children = Array.from({ length: n }, () => [])
  for (let i = 1; i < n; i++) children[parent[i]].push(i)
  const tree = id => ({ id, children: children[id].map(tree) })
  return { input: { parent, s }, root: tree(0), result: size, frames }
}

export const code = `subtree sizes after moving each node under its nearest same-letter ancestor
  set new parent of every node to its original parent
  for each node x from 1 to n minus 1
    walk up from the original parent of x through the ancestors
    if an ancestor y has the same letter as x then set the new parent of x to y and stop walking
  set size of every node to 1
  for each node x from n minus 1 down to 1
    add size of x to the size of its new parent
  return sizes`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def subtree_sizes_after_changes(parent, s):
    n = len(parent)
    new_parent = list(parent)
    for x in range(1, n):
        y = parent[x]
        while y != -1:
            if s[y] == s[x]:
                new_parent[x] = y
                break
            y = parent[y]
    size = [1] * n
    for x in range(n - 1, 0, -1):
        size[new_parent[x]] += size[x]
    return size
`
