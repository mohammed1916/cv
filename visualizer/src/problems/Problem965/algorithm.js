// The tree is stored level by level: the children of position i sit at 2i + 1 and 2i + 2, and null marks a
// missing node. A search from the root visits every node and stops at the first value that differs.
export const code = String.raw`function isUnivalued(tree) {
  const target = tree[0]; // the root's value is the one every node must match
  const stack = [0]; // positions still to check
  while (stack.length > 0) {
    const i = stack.pop();
    if (tree[i] !== target) return false;
    for (const child of [2 * i + 1, 2 * i + 2]) {
      if (child < tree.length && tree[child] !== null) stack.push(child);
    }
  }
  return true;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`Missing JavaScript line for "${s}"`); return i + 1 }

export const python = String.raw`def is_univalued(tree):
    target = tree[0]  # the root's value is the one every node must match
    stack = [0]  # positions still to check
    while stack:
        i = stack.pop()
        if tree[i] != target:
            return False
        for child in (2 * i + 1, 2 * i + 2):
            if child < len(tree) and tree[child] is not None:
                stack.append(child)
    return True`
const PYL = python.split('\n')
const PY = s => { const i = PYL.findIndex(t => t.includes(s)); if (i < 0) throw new Error(`Missing Python line for "${s}"`); return i + 1 }

export const phases = [
  { id: 'check', label: 'Check nodes', description: 'Visit each node and compare it with the root value.' },
  { id: 'done', label: 'Result', description: 'Every node matched, or the search stopped at a mismatch.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const tree = input && input.tree
  if (!Array.isArray(tree) || tree.length < 1 || tree.length > 31) {
    throw new Error('Use tree: a level-order list of 1 to 31 entries, with null for a missing node.')
  }
  if (tree[0] === null) throw new Error('The root cannot be null.')
  tree.forEach((value, i) => {
    if (value !== null && (!Number.isInteger(value) || value < 0 || value > 99)) throw new Error('Values must be integers from 0 to 99.')
    if (i > 0 && value !== null && tree[(i - 1) >> 1] === null) throw new Error('Every node must hang below a node that is present.')
  })
  return { tree }
}

export function buildTrace({ tree }) {
  const target = tree[0]
  const stack = [0]
  const frames = []
  const checked = []
  let answer = true
  while (stack.length > 0) {
    const i = stack.pop()
    const matches = tree[i] === target
    frames.push({ phase: 'check', activeLine: L('const i = stack.pop()'), pythonLine: PY('i = stack.pop()'), current: i, checked: [...checked], mismatch: matches ? null : i, target, message: matches ? `Position ${i} holds ${tree[i]}, the same as the root.` : `Position ${i} holds ${tree[i]}, which differs from the root value ${target}. The search stops.` })
    if (!matches) { answer = false; break }
    checked.push(i)
    for (const child of [2 * i + 1, 2 * i + 2]) {
      if (child < tree.length && tree[child] !== null) stack.push(child)
    }
  }
  frames.push({ phase: 'done', activeLine: L('return true'), pythonLine: PY('return True'), current: null, checked: [...checked], mismatch: null, target, message: answer ? 'Every node holds the root value, so the tree is univalued.' : 'A node differs from the root, so the tree is not univalued.' })
  return { input: { tree }, result: answer, frames }
}
