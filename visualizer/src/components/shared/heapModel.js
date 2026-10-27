// Binary heap with an operation log. Plain JS (no React) so the view and the story solvers share one model.
// `compare(a, b) < 0` means a belongs nearer the root than b. Values in the log are already formatted strings.
export const HEAP_VIEW_LIMIT = 48
export const HEAP_TREE_LIMIT = 31

const defaultFormat = value => (Array.isArray(value) ? value.join(',') : String(value))

export class TracedHeap {
  constructor(compare = (a, b) => (Array.isArray(a) ? a[0] - b[0] : a - b), { order = 'min', format = defaultFormat } = {}) {
    this.data = []
    this.compare = compare
    this.order = order
    this.format = format
    this.ops = []
  }

  get size() { return this.data.length }

  peek() { return this.data[0] }

  push(value) {
    const a = this.data, f = this.format
    a.push(value)
    let i = a.length - 1
    const steps = []
    const start = i
    while (i > 0) {
      const p = (i - 1) >> 1
      const swap = this.compare(a[i], a[p]) < 0
      steps.push({ index: i, parent: p, value: f(a[i]), parentValue: f(a[p]), swap })
      if (!swap) break;
      [a[p], a[i]] = [a[i], a[p]]
      i = p
    }
    this.ops.push({ type: 'push', value: f(value), start, end: i, steps })
  }

  pop() {
    const a = this.data, f = this.format
    if (!a.length) return undefined
    const top = a[0], last = a.pop()
    if (!a.length) {
      this.ops.push({ type: 'pop', value: f(top), moved: null, end: -1, steps: [] })
      return top
    }
    a[0] = last
    const steps = []
    let i = 0
    for (;;) {
      const kids = [2 * i + 1, 2 * i + 2].filter(c => c < a.length)
      if (!kids.length) { steps.push({ index: i, value: f(a[i]), leaf: true }); break }
      const best = kids.length === 2 && this.compare(a[kids[1]], a[kids[0]]) < 0 ? kids[1] : kids[0]
      const swap = this.compare(a[best], a[i]) < 0
      steps.push({ index: i, value: f(a[i]), child: best, childValue: f(a[best]), both: kids.length === 2, swap })
      if (!swap) break;
      [a[i], a[best]] = [a[best], a[i]]
      i = best
    }
    this.ops.push({ type: 'pop', value: f(top), moved: f(last), end: i, steps })
    return top
  }

  takeOps() { const ops = this.ops; this.ops = []; return ops }
}

/** State for a story frame: spread into emit(...). Larger heaps keep only what the story already shows. */
export function heapView(heap, { title, labels } = {}) {
  const ops = heap.takeOps()
  if (heap.size > HEAP_VIEW_LIMIT) return {}
  return { heap: { items: heap.data.map(heap.format), ops, order: heap.order, title, labels } }
}

const word = order => (order === 'max' ? ['larger', 'smaller'] : order === 'min' ? ['smaller', 'larger'] : ['higher priority', 'lower priority'])

/** Plain-language lines for the pushes and pops since the previous step. */
export function describeHeapOps(ops = [], order = 'min') {
  const [better] = word(order)
  const rootName = order === 'max' ? 'maximum' : order === 'min' ? 'minimum' : 'top item'
  return ops.map(op => {
    if (op.type === 'push') {
      const head = `push(${op.value}): append it at the end of the array, index ${op.start}.`
      if (!op.steps.length) return `${head} It is the root, so there is nothing to sift.`
      const parts = op.steps.map(s => (s.swap
        ? `${s.value} is ${better} than its parent ${s.parentValue}, so swap them (sift-up to index ${s.parent})`
        : `${s.value} is not ${better} than its parent ${s.parentValue}, so it stays at index ${s.index}`))
      return `${head} Sift-up: ${parts.join('; ')}.`
    }
    if (op.moved === null) return `pop(): remove ${op.value}; the heap is now empty.`
    const head = `pop(): remove the ${rootName} ${op.value} from the root.`
    const moved = ` Move the last item ${op.moved} to the root.`
    if (op.steps.length === 1 && op.steps[0].leaf && op.end === 0) return `${head}${moved} It is the only item, so nothing to sift.`
    const parts = op.steps.map(s => {
      if (s.leaf) return `${s.value} has no children, so it stops at index ${s.index}`
      const pick = s.both ? `the ${better} child is ${s.childValue}` : `its only child is ${s.childValue}`
      return s.swap
        ? `${pick}, which is ${better} than ${s.value}, so swap them (sift-down to index ${s.child})`
        : `${pick}, which is not ${better} than ${s.value}, so it stays at index ${s.index}`
    })
    return `${head}${moved} Sift-down: ${parts.join('; ')}.`
  })
}

/** Indices to highlight: where each operation ended, plus the swap path. */
export function heapHighlights(ops = []) {
  const roles = {}
  for (const op of ops) {
    for (const s of op.steps) {
      if (s.swap) { roles[s.index] = 'path'; roles[s.parent ?? s.child] = 'path' }
    }
  }
  for (const op of ops) if (op.end >= 0) roles[op.end] = op.type === 'push' ? 'new' : 'moved'
  return roles
}

/** Tree geometry for a heap array: level by level, children at 2i+1 and 2i+2. */
export function heapLayout(count) {
  const levels = count ? Math.floor(Math.log2(count)) + 1 : 0
  const slots = 2 ** Math.max(0, levels - 1)
  return Array.from({ length: count }, (_, i) => {
    const depth = Math.floor(Math.log2(i + 1)), at = i + 1 - 2 ** depth
    return { index: i, depth, x: (at + 0.5) * slots / 2 ** depth, parent: i ? (i - 1) >> 1 : -1 }
  })
}
