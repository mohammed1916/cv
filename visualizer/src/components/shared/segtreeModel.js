/**
 * Segment tree with lazy propagation that LOGS every operation (visit, push-down, tag, pull-up), so a
 * view can show which nodes a query/update touched, which were fully covered, and where pending tags moved.
 * Nodes use heap numbering (root 1, children 2i and 2i+1) over leaves 0..n-1, inclusive ranges [lo, hi].
 * Pure JS: no React, runs in node tests.
 */

/** Ready-made behaviours. merge combines two child values; apply puts a tag on a node of `len` leaves. */
export const SEGTREE_MODES = {
  'sum-add': { name: 'range sum, range add', identity: 0, none: 0, merge: (a, b) => a + b, apply: (v, t, len) => v + t * len, compose: (a, b) => a + b, fmtTag: t => (t >= 0 ? `+${t}` : String(t)) },
  'max-add': { name: 'range max, range add', identity: 0, none: 0, merge: (a, b) => Math.max(a, b), apply: (v, t) => v + t, compose: (a, b) => a + b, fmtTag: t => (t >= 0 ? `+${t}` : String(t)) },
  'max-assign': { name: 'range max, range assign', identity: 0, none: null, merge: (a, b) => Math.max(a, b), apply: (_v, t) => t, compose: (_a, b) => b, fmtTag: t => `=${t}` },
  'cover-assign': { name: 'covered count, range cover/uncover', identity: 0, none: null, merge: (a, b) => a + b, apply: (_v, t, len) => t * len, compose: (_a, b) => b, fmtTag: t => (t ? 'cover' : 'clear') },
}

export class SegTree {
  constructor(n, modeName = 'sum-add', initial = null) {
    this.mode = SEGTREE_MODES[modeName]
    this.n = n
    this.value = {}
    this.tag = {}
    this.bounds = {}
    this.ops = []
    this.build(1, 0, n - 1, initial)
  }

  build(id, lo, hi, initial) {
    this.bounds[id] = [lo, hi]
    this.tag[id] = this.mode.none
    if (lo === hi) { this.value[id] = initial ? initial[lo] : this.mode.identity; return }
    const mid = (lo + hi) >> 1
    this.build(id * 2, lo, mid, initial)
    this.build(id * 2 + 1, mid + 1, hi, initial)
    this.value[id] = this.mode.merge(this.value[id * 2], this.value[id * 2 + 1])
  }

  hasTag(id) { return this.tag[id] !== this.mode.none }
  len(id) { const [lo, hi] = this.bounds[id]; return hi - lo + 1 }

  put(id, tag) {
    this.value[id] = this.mode.apply(this.value[id], tag, this.len(id))
    this.tag[id] = this.hasTag(id) ? this.mode.compose(this.tag[id], tag) : tag
  }

  push(id) {
    if (!this.hasTag(id) || this.bounds[id][0] === this.bounds[id][1]) return
    const tag = this.tag[id]
    this.ops.push({ type: 'push', id, lo: this.bounds[id][0], hi: this.bounds[id][1], tag: this.mode.fmtTag(tag), kids: [id * 2, id * 2 + 1].map(k => ({ id: k, lo: this.bounds[k][0], hi: this.bounds[k][1] })) })
    this.put(id * 2, tag)
    this.put(id * 2 + 1, tag)
    this.tag[id] = this.mode.none
  }

  visit(id, kind, intent, ql, qr, extra = {}) {
    this.ops.push({ type: 'visit', id, lo: this.bounds[id][0], hi: this.bounds[id][1], kind, intent, ql, qr, value: this.value[id], ...extra })
  }

  /** Apply `tag` to leaves l..r (inclusive). */
  update(l, r, tag, id = 1) {
    const [lo, hi] = this.bounds[id]
    if (id === 1) this.ops.push({ type: 'begin', intent: 'update', ql: l, qr: r, tag: this.mode.fmtTag(tag) })
    if (r < lo || hi < l) { this.visit(id, 'outside', 'update', l, r); return }
    if (l <= lo && hi <= r) {
      this.put(id, tag)
      this.visit(id, 'covered', 'update', l, r, { tag: this.mode.fmtTag(tag), leaf: lo === hi })
      return
    }
    this.visit(id, 'partial', 'update', l, r)
    this.push(id)
    this.update(l, r, tag, id * 2)
    this.update(l, r, tag, id * 2 + 1)
    this.value[id] = this.mode.merge(this.value[id * 2], this.value[id * 2 + 1])
    this.ops.push({ type: 'pull', id, lo, hi, value: this.value[id] })
  }

  /** Combine the stored values of the leaves l..r (inclusive). */
  query(l, r, id = 1) {
    const [lo, hi] = this.bounds[id]
    if (id === 1) this.ops.push({ type: 'begin', intent: 'query', ql: l, qr: r })
    if (r < lo || hi < l) { this.visit(id, 'outside', 'query', l, r); return this.mode.identity }
    if (l <= lo && hi <= r) { this.visit(id, 'covered', 'query', l, r); return this.value[id] }
    this.visit(id, 'partial', 'query', l, r)
    this.push(id)
    return this.mode.merge(this.query(l, r, id * 2), this.query(l, r, id * 2 + 1))
  }

  /** Current nodes plus the operations logged since the last `drain`. */
  snapshot(extra = {}) {
    const nodes = Object.keys(this.bounds).map(Number).sort((a, b) => a - b).map(id => ({
      id, lo: this.bounds[id][0], hi: this.bounds[id][1], label: String(this.value[id]),
      tag: this.hasTag(id) ? this.mode.fmtTag(this.tag[id]) : '',
    }))
    const ops = this.ops
    this.ops = []
    return { n: this.n, nodes, ops, ...extra }
  }
}

const range = (lo, hi) => (lo === hi ? `[${lo}]` : `[${lo}, ${hi}]`)

/** Role of each node id for this step: outside, partial, covered, pushed (gave a tag down), pulled (recomputed). */
export function segtreeRoles(ops = []) {
  const roles = {}
  for (const op of ops) {
    if (op.type === 'visit') roles[op.id] = op.kind
    else if (op.type === 'push') roles[op.id] = 'pushed'
    else if (op.type === 'pull' && !roles[op.id]) roles[op.id] = 'pulled'
  }
  return roles
}

/** Plain-language lines for the operations since the previous step. `names` may rename leaf indices for ranges. */
export function describeSegtreeOps(ops = [], leafRange = range) {
  const lines = []
  for (const op of ops) {
    const here = leafRange(op.lo, op.hi)
    if (op.type === 'begin') {
      lines.push(op.intent === 'update'
        ? `Update ${leafRange(op.ql, op.qr)} with ${op.tag}: walk down from the root.`
        : `Query ${leafRange(op.ql, op.qr)}: walk down from the root and combine the pieces that fit.`)
    } else if (op.type === 'visit') {
      if (op.kind === 'covered' && op.intent === 'set') lines.push(`Reached leaf ${here}: overwrite it with the new character.`)
      else if (op.kind === 'outside') lines.push(`Node ${here} does not overlap ${leafRange(op.ql, op.qr)}: skip it.`)
      else if (op.kind === 'covered' && op.intent === 'update') lines.push(`Node ${here} is fully covered: apply ${op.tag} to it (value becomes ${op.value})${op.leaf ? '.' : ' and leave the tag pending for its children (lazy).'}`)
      else if (op.kind === 'covered') lines.push(`Node ${here} is fully covered: take its stored value ${op.value} without going deeper.`)
      else lines.push(`Node ${here} overlaps only partly: split into both halves.`)
    } else if (op.type === 'push') {
      lines.push(`Push down: node ${here} carries a pending ${op.tag}, so give it to ${op.kids.map(k => range(k.lo, k.hi)).join(' and ')} and clear it here.`)
    } else if (op.type === 'pull') {
      lines.push(`Recompute node ${here} from its two children: ${op.value}.`)
    } else if (op.type === 'note') lines.push(op.text)
  }
  return lines
}

/** Horizontal slot and depth of a node: leaves get one slot each, internal nodes sit over their span. */
export function segtreeLayout(nodes) {
  const depth = id => Math.floor(Math.log2(id))
  return nodes.map(node => ({ ...node, depth: depth(node.id), center: (node.lo + node.hi + 1) / 2 }))
}
