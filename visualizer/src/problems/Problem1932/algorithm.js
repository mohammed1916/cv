// Merge small BSTs: a tree whose root value equals a leaf of another tree plugs into that leaf.
// Returns the merged tree as nested {val, left, right}, or null when the merge is impossible.
export function canMerge(trees) {
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

  const copyLeaf = child => ({ val: child.val, left: null, right: null })
  const build = node => {
    const side = child => {
      if (!child) return null
      if (pool.has(child.val)) {
        const tree = pool.get(child.val)
        pool.delete(child.val)
        return build(tree)
      }
      return copyLeaf(child)
    }
    return { val: node.val, left: side(node.left), right: side(node.right) }
  }

  const merged = build(root)
  if (pool.size > 0) return null
  const values = []
  const walk = node => { if (!node) return; walk(node.left); values.push(node.val); walk(node.right) }
  walk(merged)
  for (let i = 1; i < values.length; i++) if (values[i - 1] >= values[i]) return null
  return merged
}

export function inorder(node) {
  if (!node) return []
  return [...inorder(node.left), node.val, ...inorder(node.right)]
}
