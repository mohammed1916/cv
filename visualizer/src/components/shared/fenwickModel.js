/** Pure Fenwick (binary indexed tree) helpers: bit jumps, covered ranges, and plain-language operation lines. */
export const lowbit = i => i & -i

/** Cell i stores the combined value of positions (i - lowbit(i), i], i.e. i - lowbit(i) + 1 .. i. */
export function fenwickRange(i) {
  return [i - lowbit(i) + 1, i]
}

/** Cells touched by an update at position i: i, i + lowbit(i), ... while <= n. */
export function updateChain(i, n) {
  const chain = []
  for (let p = i; p <= n; p += lowbit(p)) chain.push(p)
  return chain
}

/** Cells read by a prefix query up to position i: i, i - lowbit(i), ... while > 0. */
export function queryChain(i) {
  const chain = []
  for (let p = i; p > 0; p -= lowbit(p)) chain.push(p)
  return chain
}

const bin = i => i.toString(2)

/** Which cells were written (update) or read (query) by the operations of this step. */
export function fenwickRoles(ops = []) {
  const roles = {}
  for (const op of ops) for (const cell of op.chain) roles[cell] = op.type
  return roles
}

/** One sentence per update/query, showing every bit jump. */
export function describeFenwickOps(ops = []) {
  return ops.map(op => {
    const mode = op.mode === 'max' ? 'max' : 'sum'
    if (op.type === 'update') {
      if (!op.chain.length) return `update(${op.index}): position ${op.index} is outside the tree, so no cell changes.`
      const jumps = op.chain.map(c => `${c} (${bin(c)}, covers ${fenwickRange(c).join('..')})`).join(' → ')
      const what = mode === 'max' ? `raise to at least ${op.value}` : `add ${op.value}`
      return `update(${op.index}): ${what} in every cell that covers position ${op.index}. Start at ${op.index}, then repeat i += i & -i: ${jumps}.`
    }
    if (!op.chain.length) return `query(${op.index}): the prefix is empty, so the result is ${op.total}.`
    const jumps = op.chain.map(c => `${c} (${bin(c)}, covers ${fenwickRange(c).join('..')})`).join(' → ')
    const combine = mode === 'max' ? 'max' : 'add'
    const parts = op.parts.map(p => p.value).join(mode === 'max' ? ', ' : ' + ')
    return `query(${op.index}): ${mode === 'max' ? 'best' : 'sum'} of positions 1..${op.index}. Start at ${op.index}, then repeat i -= i & -i: ${jumps}. ${combine === 'max' ? 'Take the max of' : 'Add'} ${parts} = ${op.total}.`
  })
}
