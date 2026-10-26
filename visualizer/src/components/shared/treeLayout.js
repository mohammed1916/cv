// Pure tree helpers shared by BinaryTreeLane and problem algorithms (no DOM or CSS imports).
const GAP_X = 46
const GAP_Y = 58
const RADIUS = 16

/** Lays out nodes by in-order position (x) and depth (y); children may be absent. */
export function layoutTree(root) {
  const positions = new Map()
  const edges = []
  let column = 0
  let deepest = 0
  function visit(node, depth) {
    if (!node) return
    deepest = Math.max(deepest, depth)
    visit(node.left, depth + 1)
    positions.set(node.id, { x: column * GAP_X + RADIUS + 8, y: depth * GAP_Y + RADIUS + 8, node })
    column++
    visit(node.right, depth + 1)
  }
  visit(root, 0)
  for (const [id, pos] of positions) {
    for (const child of [pos.node.left, pos.node.right]) {
      if (child) edges.push({ from: id, to: child.id })
    }
  }
  return { positions, edges, width: Math.max(1, column) * GAP_X + RADIUS * 2 + 16, height: (deepest + 1) * GAP_Y + RADIUS * 2 + 8, radius: RADIUS }
}

/** Builds { id, value, left, right } from LeetCode level-order arrays (null = missing). */
export function treeFromLevelOrder(values) {
  if (!values.length || values[0] === null) return null
  let id = 0
  const make = value => ({ id: id++, value, left: null, right: null })
  const root = make(values[0])
  const queue = [root]
  let cursor = 1
  for (let q = 0; q < queue.length && cursor < values.length; q++) {
    const node = queue[q]
    if (cursor < values.length && values[cursor] !== null) { node.left = make(values[cursor]); queue.push(node.left) }
    cursor++
    if (cursor < values.length && values[cursor] !== null) { node.right = make(values[cursor]); queue.push(node.right) }
    cursor++
  }
  return root
}

/**
 * Builds { id, value, children } from LeetCode's N-ary serialization: the root,
 * then for each node in level order a null separator followed by its children.
 */
export function treeFromNary(items) {
  if (!items.length || items[0] === null) return null
  let id = 0
  const make = value => ({ id: id++, value, children: [] })
  const root = make(items[0])
  const queue = [root]
  let cursor = 1
  if (cursor < items.length && items[cursor] === null) cursor++
  for (let q = 0; q < queue.length; q++) {
    const node = queue[q]
    while (cursor < items.length && items[cursor] !== null) {
      const child = make(items[cursor++])
      node.children.push(child)
      queue.push(child)
    }
    cursor++
  }
  return root
}

/** Serializes a binary tree to LeetCode's level-order array, with trailing nulls trimmed. */
export function levelOrderFromTree(root) {
  if (!root) return []
  const out = []
  const queue = [root]
  for (let q = 0; q < queue.length; q++) {
    const node = queue[q]
    if (node) {
      out.push(node.value)
      queue.push(node.left, node.right)
    } else {
      out.push(null)
    }
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

/**
 * Lays out a rooted tree of any branching factor. Leaves take consecutive columns; each parent sits
 * over the middle of its children. Input nodes are { id, children: [] }.
 */
export function layoutRootedTree(root) {
  const positions = new Map()
  const edges = []
  let column = 0
  let deepest = 0
  function place(node, depth) {
    deepest = Math.max(deepest, depth)
    const kids = node.children ?? []
    if (kids.length === 0) {
      positions.set(node.id, { x: column++, depth })
      return
    }
    const xs = kids.map(child => { place(child, depth + 1); edges.push([node.id, child.id]); return positions.get(child.id).x })
    positions.set(node.id, { x: (Math.min(...xs) + Math.max(...xs)) / 2, depth })
  }
  place(root, 0)
  return { positions, edges, columns: Math.max(1, column), rows: deepest + 1 }
}
