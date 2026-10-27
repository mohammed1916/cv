// Pure model for pointer-level linked list views: node chains, detached nodes, and next-pointer rewrites.

/** Human label for a node id, e.g. "node 3 (value 7)". */
export const listNodeLabel = (id, valueOf) => (id === null || id === undefined ? 'null' : `node ${id}${valueOf && valueOf(id) !== undefined ? ` (value ${valueOf(id)})` : ''}`)

/** Compare two link tables ({ nexts: {id: nextId|null}, head }) and return every pointer that changed. */
export function diffListLinks(before, after) {
  const rewrites = []
  if (!before) return rewrites
  if (before.head !== after.head) rewrites.push({ field: 'head', id: 'head', from: before.head ?? null, to: after.head ?? null })
  for (const id of Object.keys(after.nexts)) {
    if (!(id in before.nexts)) continue
    const from = before.nexts[id] ?? null, to = after.nexts[id] ?? null
    if (from !== to) rewrites.push({ field: 'next', id: Number.isNaN(Number(id)) ? id : Number(id), from, to })
  }
  return rewrites
}

/** One plain sentence per rewrite: before and after values of the pointer. */
export function describeLinkRewrites(rewrites, valueOf) {
  return rewrites.map(({ field, id, from, to }) => (field === 'head'
    ? `head moved from ${listNodeLabel(from, valueOf)} to ${listNodeLabel(to, valueOf)}`
    : `${listNodeLabel(id, valueOf)}.next was ${listNodeLabel(from, valueOf)}, now ${listNodeLabel(to, valueOf)}`))
}

/** Follow next pointers from head; stops at null or on revisiting a node (cycle). */
export function walkList(nexts, head) {
  const order = [], seen = new Set()
  let cycleTo = null, id = head
  while (id !== null && id !== undefined) {
    if (seen.has(id)) { cycleTo = id; break }
    seen.add(id); order.push(id); id = nexts[id] ?? null
  }
  return { order, cycleTo }
}

/** Nodes that exist but cannot be reached from head. */
export function detachedIds(allIds, nexts, head) {
  const { order } = walkList(nexts, head)
  const reachable = new Set(order)
  return allIds.filter(id => !reachable.has(id))
}

/** Named pointers grouped by node id (null key means "points at null"). */
export function groupPointers(pointers) {
  const groups = new Map()
  for (const pointer of pointers) {
    const key = pointer.nodeId ?? null
    groups.set(key, [...(groups.get(key) ?? []), pointer.label])
  }
  return groups
}

/**
 * Tracks a link table ({ [id]: { val, next } }) across steps. Each snapshot returns the props for ListPointerView,
 * including the pointers rewritten since the previous snapshot and the nodes now cut off from the head.
 */
export function createListTracker() {
  let previous = null
  return {
    snapshot(table, head, pointers = [], highlightedIds = [], extra = {}) {
      const ids = Object.keys(table)
      const keyOf = id => (Number.isNaN(Number(id)) ? id : Number(id))
      const nexts = Object.fromEntries(ids.map(id => [id, table[id].next ?? null]))
      const links = { head: head ?? null, nexts }
      const rewrites = diffListLinks(previous, links)
      previous = links
      const { order } = walkList(nexts, head ?? null)
      const asNode = id => ({ id, val: table[id].val, nextId: table[id].next ?? null, prevId: table[id].prev ?? null })
      const detached = detachedIds(ids.map(keyOf), nexts, head ?? null).map(asNode)
      return { nodes: order.map(asNode), pointers, highlightedIds, detached, rewrites, ...extra }
    },
  }
}
