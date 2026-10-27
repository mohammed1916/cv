export function parseInput(text) {
  const data = JSON.parse(text)
  const { values, k } = data ?? {}
  if (!Array.isArray(values) || values.length > 1000 || values.some(v => !Number.isInteger(v) || Math.abs(v) > 1000)) throw new Error('values must be up to 1,000 integers with |v| ≤ 1,000.')
  if (!Number.isInteger(k) || k < 1 || k > 50) throw new Error('k must be an integer from 1 to 50.')
  return { values, k }
}

import { createListTracker } from '../../components/shared/listPointerModel.js'

// Each part gets floor(n / k) nodes, and the first n mod k parts get one extra.
export function buildTrace({ values, k }) {
  const n = values.length
  const base = Math.floor(n / k), extra = n % k
  const parts = []
  const table = Object.fromEntries(values.map((val, i) => [i, { val, next: i + 1 < n ? i + 1 : null }]))
  const tracker = createListTracker()
  const view = (head, pointers, hot) => tracker.snapshot(table, head, pointers, hot, { title: 'Pointers while cutting' })
  const frames = [{ phase: 'start', view: view(n ? 0 : null, [{ label: 'head', nodeId: n ? 0 : null }], []), parts: [], sizes: [], activeLine: 1, message: `${n} nodes into ${k} parts: ${base} each, with ${extra} part${extra === 1 ? '' : 's'} getting one more.` }]
  let cursor = 0
  for (let p = 0; p < k; p++) {
    const size = base + (p < extra ? 1 : 0)
    parts.push(values.slice(cursor, cursor + size))
    const partHead = size ? cursor : null, tail = size ? cursor + size - 1 : null
    const after = size && tail + 1 < n ? tail + 1 : null
    if (size) frames.push({ phase: 'cut', view: view(partHead, [{ label: 'part head', nodeId: partHead }, { label: 'tail', nodeId: tail }, { label: 'rest', nodeId: after }], [tail]), parts: parts.slice(0, -1).map(x => [...x]), sizes: parts.slice(0, -1).map(x => x.length), current: p, activeLine: 5, message: `Part ${p}: walk tail ${size - 1} step${size === 2 ? '' : 's'} from the part head to its last node; rest is tail.next.` })
    if (size) table[tail].next = null
    cursor += size
    frames.push({ phase: 'cut', view: view(partHead, [{ label: 'part head', nodeId: partHead }, { label: 'tail', nodeId: tail }], [tail]), parts: parts.map(x => [...x]), sizes: parts.map(x => x.length), current: p, activeLine: 6, message: size ? `Part ${p} takes ${size} node${size === 1 ? '' : 's'}: tail.next = null cuts it from the rest, which becomes detached from this part.` : `Part ${p} is empty (null): no nodes are left.` })
  }
  frames.push({ phase: 'done', parts: parts.map(x => [...x]), sizes: parts.map(x => x.length), result: parts, activeLine: 7, message: `Built ${k} parts.` })
  return { input: { values, k }, result: parts, frames }
}

export const code = `set n to the number of nodes, base to n divided by k rounded down, and extra to n mod k
set cursor to the first node
for each part p from 0 to k minus 1
  set size to base, plus one when p is less than extra
  walk size minus one steps from the part head to its tail, and note the rest after it
  cut the rest off by setting the tail's next to null, then move cursor forward by size
return all k parts, including empty ones`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def split_list_to_parts(values, k):
    n = len(values)
    base, extra = divmod(n, k)
    out, i = [], 0
    for p in range(k):
        size = base + (1 if p < extra else 0)
        out.append(values[i:i + size])
        i += size
    return out`
