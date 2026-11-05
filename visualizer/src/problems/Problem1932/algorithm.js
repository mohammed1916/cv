// LeetCode 1932: a tree whose root is not a leaf of any other tree is the top. Each leaf whose value equals another tree's root is replaced by that tree; the result must be a valid search tree.
const SOURCE = [
  'function canMerge(trees) {',
  '  const pool = new Map()',
  '  const childValues = new Set()',
  '  for (const t of trees) {',
  '    pool.set(t.val, t)',
  '    for (const child of [t.left, t.right]) if (child) childValues.add(child.val)',
  '  }',
  '  const roots = trees.filter(t => !childValues.has(t.val))',
  '  if (roots.length !== 1) return null',
  '  const root = roots[0]',
  '  pool.delete(root.val)',
  '  const build = node => {',
  '    const side = child => {',
  '      if (!child) return null',
  '      if (pool.has(child.val)) {',
  '        const tree = pool.get(child.val)',
  '        pool.delete(child.val)',
  '        return build(tree)',
  '      }',
  '      return { val: child.val, left: null, right: null }',
  '    }',
  '    return { val: node.val, left: side(node.left), right: side(node.right) }',
  '  }',
  '  const merged = build(root)',
  '  if (pool.size > 0) return null',
  '  const values = inorder(merged)',
  '  for (let i = 1; i < values.length; i++) if (values[i - 1] >= values[i]) return null',
  '  return merged',
  '}',
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def can_merge(trees):
    pool = {}
    child_values = set()
    for t in trees:
        pool[t["val"]] = t
        for child in (t["left"], t["right"]):
            if child:
                child_values.add(child["val"])
    roots = [t for t in trees if t["val"] not in child_values]
    if len(roots) != 1:
        return None
    root = roots[0]
    del pool[root["val"]]

    def build(node):
        def side(child):
            if not child:
                return None
            if child["val"] in pool:
                tree = pool.pop(child["val"])
                return build(tree)
            return {"val": child["val"], "left": None, "right": None}
        return {"val": node["val"], "left": side(node["left"]), "right": side(node["right"])}

    merged = build(root)
    if pool:
        return None
    values = inorder(merged)
    for i in range(1, len(values)):
        if values[i - 1] >= values[i]:
            return None
    return merged

def inorder(node):
    if not node:
        return []
    return inorder(node["left"]) + [node["val"]] + inorder(node["right"])
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export function inorder(node) {
  if (!node) return []
  return [...inorder(node.left), node.val, ...inorder(node.right)]
}

// Real merge. onStep receives each replacement so the visualization can show it.
export function canMerge(trees, onStep = () => {}) {
  const pool = new Map()
  const childValues = new Set()
  for (const t of trees) {
    pool.set(t.val, t)
    for (const child of [t.left, t.right]) if (child) childValues.add(child.val)
  }
  const roots = trees.filter(t => !childValues.has(t.val))
  if (roots.length !== 1) return null
  const root = roots[0]
  pool.delete(root.val)
  const build = node => {
    const side = child => {
      if (!child) return null
      if (pool.has(child.val)) {
        const tree = pool.get(child.val)
        pool.delete(child.val)
        onStep({ type: 'attach', leaf: child.val, root: tree.val })
        return build(tree)
      }
      return { val: child.val, left: null, right: null }
    }
    return { val: node.val, left: side(node.left), right: side(node.right) }
  }
  const merged = build(root)
  if (pool.size > 0) return null
  const values = inorder(merged)
  for (let i = 1; i < values.length; i++) if (values[i - 1] >= values[i]) return null
  return merged
}

const leaf = value => ({ value, left: null, right: null })
const toPlain = t => (t === null ? null : { value: t.value, left: t.left ? toPlain(t.left) : null, right: t.right ? toPlain(t.right) : null })
const toInput = t => ({ val: t.value, left: t.left ? toInput(t.left) : null, right: t.right ? toInput(t.right) : null })

export const phases = [
  { id: 'pool', label: 'Pool', description: 'Find the tree whose root is not a leaf of another tree.' },
  { id: 'attach', label: 'Attach', description: 'Replace a leaf with the tree whose root has that value.' },
  { id: 'check', label: 'Check', description: 'The merged values must rise strictly in order.' },
  { id: 'done', label: 'Result', description: 'Merged tree in-order values, or null.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"trees":[{"value":5,"left":{"value":3,"left":null,"right":null},"right":null}]}.') }
  if (!Array.isArray(input?.trees) || input.trees.length < 1 || input.trees.length > 4) throw new Error('trees is a list of 1 to 4 nested {value, left, right} objects.')
  const check = (node, depth) => {
    if (node === null) return
    if (!node || !Number.isInteger(node.value) || depth > 1) throw new Error('Each tree has at most three nodes: a root and up to two leaves.')
    check(node.left ?? null, depth + 1)
    check(node.right ?? null, depth + 1)
  }
  input.trees.forEach(t => check(t, 0))
  return { trees: input.trees.map(t => toPlain(t)) }
}

export function buildTrace({ trees }) {
  const frames = []
  const pool = trees.map(t => toPlain(t))
  const childValues = new Set(trees.flatMap(t => [t.left?.value, t.right?.value]).filter(v => v !== undefined))
  const roots = pool.filter(t => !childValues.has(t.value))
  frames.push({ phase: 'pool', activeLine: L('const pool'), pythonLine: P('pool = {}'), message: roots.length === 1 ? `The top tree has root ${roots[0].value}.` : `${roots.length} candidate tops: the merge cannot finish.`, pool, focus: roots.length === 1 ? roots[0].value : null, attached: [], merged: null })
  const attached = []
  let result
  if (roots.length !== 1) {
    result = null
  } else {
    result = canMerge(trees, ev => {
      attached.push(ev)
      frames.push({ phase: 'attach', activeLine: L('onStep'), pythonLine: P('tree = pool.pop'), message: `Leaf ${ev.leaf} is replaced by the tree rooted at ${ev.root}.`, pool, focus: ev.root, attached: attached.map(a => ({ ...a })), merged: null })
    })
    if (result) {
      const values = inorder(result)
      frames.push({ phase: 'check', activeLine: L('values[i - 1] >= values[i]'), pythonLine: P('if values[i - 1]'), message: 'Checking that the in-order values rise strictly.', pool: [], focus: null, attached, merged: toPlain(result) })
    } else {
      frames.push({ phase: 'check', activeLine: L('return null'), pythonLine: P('return None'), message: 'The merge fails: a tree is left over or the in-order values do not rise.', pool, focus: null, attached, merged: null })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return merged'), pythonLine: P('return merged'), message: result ? `Merged in-order values: ${inorder(result).join(', ')}.` : 'Result is null.', pool: [], focus: null, attached, merged: result ? toPlain(result) : null, result })
  return { input: { trees }, result: result ? inorder(result) : null, frames, merged: result }
}

export { leaf, toInput }
