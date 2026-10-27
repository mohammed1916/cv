const where = prefix => (prefix ? `'${prefix}'` : 'the root')

/**
 * Plain-language lines for the trie operations logged since the previous step.
 * op kinds: create | reuse | miss (one character of a walk), end (word-end mark or count change), bit (binary trie decision).
 */
export function describeTrieOps(ops = []) {
  return ops.map(op => {
    if (op.kind === 'create') return `'${op.char}' below ${where(op.parentPrefix)}: no such edge yet, so a NEW node is created for prefix '${op.prefix}'.`
    if (op.kind === 'reuse') return `'${op.char}' below ${where(op.parentPrefix)}: the edge already exists, so the node for '${op.prefix}' is REUSED (shared with an earlier path).`
    if (op.kind === 'miss') return `'${op.char}' below ${where(op.parentPrefix)}: there is no such edge, so the walk stops here and nothing longer can match.`
    if (op.kind === 'end') {
      const what = op.text ?? `node '${op.prefix}' is marked as the end of a word`
      return `End of word: ${what}.`
    }
    return op.text ?? ''
  }).filter(Boolean)
}

/** One cell per character walked: created, reused or missing. */
export function trieWalkCells(ops = []) {
  return ops.filter(op => op.kind === 'create' || op.kind === 'reuse' || op.kind === 'miss')
    .map(op => ({ char: op.char, status: op.kind === 'create' ? 'created' : op.kind === 'reuse' ? 'reused' : 'missing' }))
}

/** Node id to role for the nodes touched by these ops (created wins over reused). */
export function trieNodeRoles(ops = []) {
  const roles = {}
  for (const op of ops) {
    if (op.node === undefined || (op.kind !== 'create' && op.kind !== 'reuse')) continue
    roles[op.node] = op.kind === 'create' || roles[op.node] === 'created' ? 'created' : 'reused'
  }
  return roles
}

/** Children of every node of a flat node list, for tests and layout checks. */
export function trieChildren(nodes) {
  const children = new Map(nodes.map(node => [node.id, []]))
  for (const node of nodes) if (node.parent !== null) children.get(node.parent)?.push(node.id)
  return children
}
