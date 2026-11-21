// Iterative DFS with child lists. Entering a node records it as the latest ancestor of its letter;
// leaving it restores the previous ancestor and adds its subtree size to the effective parent.
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

export const CODE_LINES = [
  'def find_subtree_sizes(parent, s):',
  '    n = len(s)',
  '    head, nxt = [-1] * n, [-1] * n',
  '    for i in range(1, n):',
  '        nxt[i] = head[parent[i]]',
  '        head[parent[i]] = i',
  '    size = [1] * n',
  '    last = {}',
  '    stack = [(0, False, -1)]',
  '    while stack:',
  '        x, exiting, old = stack.pop()',
  '        c = s[x]',
  '        if not exiting:',
  '            old = last.get(c, -1)',
  '            last[c] = x',
  '            stack.append((x, True, old))',
  '            child = head[x]',
  '            while child != -1:',
  '                stack.append((child, False, -1))',
  '                child = nxt[child]',
  '        else:',
  '            last[c] = old',
  '            if x:',
  '                p = old if old != -1 else parent[x]',
  '                size[p] += size[x]',
  '    return size',
]
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = CODE_LINES.join('\n') + '\n'

export function buildTrace({ parent, s }) {
  const n = s.length
  const frames = []
  const head = Array(n).fill(-1)
  const nxt = Array(n).fill(-1)
  const size = Array(n).fill(1)
  const last = {}
  const snapshot = () => Object.fromEntries(Object.entries(last).sort())
  const push = (frame) => frames.push({ sizes: [...size], last: snapshot(), node: -1, y: -1, ...frame })

  push({ pythonLine: 2, activeLine: 2, phase: 'start', message: `Start with ${n} nodes; the root is node 0.` })
  for (let i = 1; i < n; i++) {
    nxt[i] = head[parent[i]]
    head[parent[i]] = i
    push({ pythonLine: 5, activeLine: 5, phase: 'build', node: i, y: parent[i], message: `Link node ${i} as a child of ${parent[i]}.` })
  }
  push({ pythonLine: 7, activeLine: 7, phase: 'start', message: 'Every subtree starts with size 1.' })

  const stack = [[0, false, -1]]
  push({ pythonLine: 9, activeLine: 9, phase: 'start', node: 0, message: 'Push the root onto the stack.' })
  while (stack.length) {
    let [x, exiting, old] = stack.pop()
    const c = s[x]
    if (!exiting) {
      push({ pythonLine: 11, activeLine: 11, phase: 'enter', node: x, message: `Enter node ${x} (letter ${c}).` })
      old = last[c] ?? -1
      push({ pythonLine: 14, activeLine: 14, phase: 'enter', node: x, y: old, message: old === -1
        ? `No ancestor with letter ${c} yet.`
        : `Remember the previous ${c} ancestor, node ${old}.` })
      last[c] = x
      push({ pythonLine: 15, activeLine: 15, phase: 'link', node: x, y: x, message: `Node ${x} is now the latest ${c} on this path.` })
      stack.push([x, true, old])
      push({ pythonLine: 16, activeLine: 16, phase: 'children', node: x, message: `Push the exit marker for node ${x}, so it runs after its subtree.` })
      const kids = []
      for (let child = head[x]; child !== -1; child = nxt[child]) {
        stack.push([child, false, -1])
        kids.push(child)
      }
      push({ pythonLine: 18, activeLine: 18, phase: 'children', node: x, message: kids.length
        ? `Push children ${kids.join(', ')} to visit next.`
        : `Node ${x} is a leaf; nothing to push.` })
    } else {
      push({ pythonLine: 11, activeLine: 11, phase: 'exit', node: x, message: `Leave node ${x}.` })
      last[c] = old
      push({ pythonLine: 22, activeLine: 22, phase: 'exit', node: x, y: old, message: old === -1
        ? `No earlier ${c} ancestor; remove ${c} from the path.`
        : `Restore the ${c} ancestor to node ${old}.` })
      if (x) {
        const p = old !== -1 ? old : parent[x]
        size[p] += size[x]
        push({ pythonLine: 25, activeLine: 25, phase: 'merge', node: x, y: p, message: `Add subtree ${x} (size ${size[x]}) to node ${p}${old !== -1 ? ', its nearest same-letter ancestor' : ', its original parent'}.` })
      }
    }
  }
  push({ pythonLine: 26, activeLine: 26, phase: 'done', message: `Subtree sizes: [${size.join(', ')}].` })

  const children = Array.from({ length: n }, () => [])
  for (let i = 1; i < n; i++) children[parent[i]].push(i)
  const tree = id => ({ id, children: children[id].map(tree) })
  return { input: { parent, s }, root: tree(0), result: size, frames }
}
