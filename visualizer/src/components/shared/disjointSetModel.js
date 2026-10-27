/** Plain-language lines for the find/union operations since the previous step. */
export function describeDisjointSetOps(ops = [], label = String) {
  return ops.map(op => {
    if (op.type === 'find') {
      const path = op.chain.map(label).join(' → ')
      const compressed = op.repointed.length
        ? ` Path halving re-points ${op.repointed.map(r => `${label(r.node)} from ${label(r.from)} to ${label(r.to)}`).join(', ')}.`
        : ''
      return `find(${label(op.node)}): follow ${path}; the root is ${label(op.root)}.${compressed}`
    }
    if (!op.merged) return `union(${label(op.a)}, ${label(op.b)}): both are already under root ${label(op.rootA)}, so nothing changes.`
    const total = op.winnerSize + op.loserSize
    const choice = op.winnerSize === op.loserSize
      ? `Both trees have size ${op.winnerSize}, so root ${label(op.loser)} hangs under root ${label(op.winner)}`
      : `The smaller tree (root ${label(op.loser)}, size ${op.loserSize}) hangs under root ${label(op.winner)} (size ${op.winnerSize})`
    return `union(${label(op.a)}, ${label(op.b)}): roots ${label(op.rootA)} and ${label(op.rootB)} differ. ${choice}, giving size ${total}.`
  })
}

/** Trees of the current forest, one per root. Ids are the labels when unique, otherwise the indices. */
export function disjointSetForest(parent, labels) {
  const unique = new Set(labels).size === labels.length
  const idOf = i => (unique ? labels[i] : String(i))
  const nodes = parent.map((_, i) => ({ id: idOf(i), children: [] }))
  const roots = []
  parent.forEach((p, i) => { if (p === i) roots.push(nodes[i]); else nodes[p].children.push(nodes[i]) })
  return { roots, idOf }
}
