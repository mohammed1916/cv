export const phases = [
  { id: 'start', label: 'Start', description: 'Every node begins unlocked and the tree is set from the parent array.' },
  { id: 'lock', label: 'Lock or unlock', description: 'A lock needs an unlocked node; an unlock needs the same user who locked it.' },
  { id: 'upgrade', label: 'Upgrade', description: 'An upgrade needs an unlocked node with no locked ancestor and at least one locked descendant; it unlocks those descendants and locks the node.' },
  { id: 'done', label: 'Result', description: 'Return each operation result in order.' },
]

export const code = `function operateTree(parent, operations) {
  const children = parent.map(() => [])
  parent.forEach((p, i) => { if (p !== -1) children[p].push(i) })
  const owner = parent.map(() => null)
  const hasLockedAncestor = node => {
    for (let p = parent[node]; p !== -1; p = parent[p]) if (owner[p] !== null) return true
    return false
  }
  const lockedBelow = node => {
    const found = []
    const stack = [...children[node]]
    while (stack.length) {
      const v = stack.pop()
      if (owner[v] !== null) found.push(v)
      stack.push(...children[v])
    }
    return found
  }
  return operations.map(([type, num, user]) => {
    if (type === 'lock') {
      if (owner[num] !== null) return false
      owner[num] = user
      return true
    }
    if (type === 'unlock') {
      if (owner[num] !== user) return false
      owner[num] = null
      return true
    }
    const below = lockedBelow(num)
    if (owner[num] !== null || hasLockedAncestor(num) || below.length === 0) return false
    below.forEach(v => { owner[v] = null })
    owner[num] = user
    return true
  })
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def operate_tree(parent, operations):
    n = len(parent)
    children = [[] for _ in range(n)]
    for i, p in enumerate(parent):
        if p != -1:
            children[p].append(i)
    owner = [None] * n

    def has_locked_ancestor(node):
        p = parent[node]
        while p != -1:
            if owner[p] is not None:
                return True
            p = parent[p]
        return False

    def locked_below(node):
        found = []
        stack = list(children[node])
        while stack:
            v = stack.pop()
            if owner[v] is not None:
                found.append(v)
            stack.extend(children[v])
        return found

    results = []
    for kind, num, user in operations:
        if kind == 'lock':
            ok = owner[num] is None
            if ok:
                owner[num] = user
        elif kind == 'unlock':
            ok = owner[num] == user
            if ok:
                owner[num] = None
        else:
            below = locked_below(num)
            ok = owner[num] is None and not has_locked_ancestor(num) and len(below) > 0
            if ok:
                for v in below:
                    owner[v] = None
                owner[num] = user
        results.append(ok)
    return results
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"parent":[-1,0,0,1],"operations":[["lock",1,5]]}.') }
  const { parent, operations } = obj || {}
  if (!Array.isArray(parent) || parent.length < 1 || parent.length > 12 || parent[0] !== -1) throw new Error('parent must have 1 to 12 entries, and parent[0] must be -1.')
  for (let i = 1; i < parent.length; i++) {
    if (!Number.isInteger(parent[i]) || parent[i] < 0 || parent[i] >= parent.length) throw new Error('Each parent must be a node number from 0 to n - 1.')
    let p = parent[i], steps = 0
    while (p !== -1 && steps <= parent.length) { p = parent[p]; steps++ }
    if (p !== -1) throw new Error('The parent array must describe a tree rooted at 0.')
  }
  if (!Array.isArray(operations) || operations.length > 20) throw new Error('Give up to 20 operations.')
  for (const op of operations) {
    if (!Array.isArray(op) || !['lock', 'unlock', 'upgrade'].includes(op[0]) || !Number.isInteger(op[1]) || op[1] < 0 || op[1] >= parent.length || !Number.isInteger(op[2]) || op[2] < 1) {
      throw new Error('Each operation is [lock|unlock|upgrade, node, user] with user at least 1.')
    }
  }
  return { parent, operations }
}

export function buildTrace({ parent, operations }) {
  const frames = []
  const n = parent.length
  const children = parent.map(() => [])
  parent.forEach((p, i) => { if (p !== -1) children[p].push(i) })
  const owner = parent.map(() => null)
  const results = []
  const add = (phase, c, p, message, index, ok) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { parent, owner: owner.slice(), index, ok, results: results.slice(), operations, n },
  })
  const hasLockedAncestor = node => {
    for (let p = parent[node]; p !== -1; p = parent[p]) if (owner[p] !== null) return true
    return false
  }
  const lockedBelow = node => {
    const found = []
    const stack = [...children[node]]
    while (stack.length) {
      const v = stack.pop()
      if (owner[v] !== null) found.push(v)
      stack.push(...children[v])
    }
    return found
  }
  add('start', 'const children', 'children = [[]', 'All nodes start unlocked.', -1, null)
  operations.forEach(([type, num, user], index) => {
    let ok
    if (type === 'lock') {
      ok = owner[num] === null
      if (ok) owner[num] = user
      add('lock', "if (type === 'lock')", 'if kind == ', `Lock ${num} for user ${user}: ${ok ? 'succeeded' : 'the node is already locked'}.`, index, ok)
    } else if (type === 'unlock') {
      ok = owner[num] === user
      if (ok) owner[num] = null
      add('lock', "if (type === 'unlock')", "elif kind == 'unlock'", `Unlock ${num} for user ${user}: ${ok ? 'released' : 'not locked by this user'}.`, index, ok)
    } else {
      const below = lockedBelow(num)
      ok = owner[num] === null && !hasLockedAncestor(num) && below.length > 0
      if (ok) {
        below.forEach(v => { owner[v] = null })
        owner[num] = user
      }
      add('upgrade', 'const below = lockedBelow', 'below = locked_below', `Upgrade ${num} for user ${user}: ${ok ? `released ${below.length} locked descendant(s) and locked it` : 'it needs no locked ancestor and at least one locked descendant'}.`, index, ok)
    }
    results.push(ok)
  })
  add('done', 'return operations.map', 'return results', 'All operations are applied.', operations.length - 1, null)
  return { input: { parent, operations }, result: results, frames }
}
