export function parseInput(text) {
  const data = JSON.parse(text)
  const { barcodes } = data ?? {}
  if (!Array.isArray(barcodes) || barcodes.length < 1 || barcodes.length > 12) throw new Error('Use "barcodes" as an array of 1 to 12 values.')
  if (barcodes.some(v => !Number.isInteger(v) || v < 1 || v > 6)) throw new Error('Each barcode is an integer from 1 to 6.')
  const counts = new Map()
  for (const v of barcodes) counts.set(v, (counts.get(v) ?? 0) + 1)
  if (Math.max(...counts.values()) > Math.ceil(barcodes.length / 2)) throw new Error('No arrangement avoids neighbours: one value is more than half of the list.')
  return { barcodes }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function rearrangeBarcodes(barcodes) {', 'import heapq'],
  ['  const counts = new Map()', 'from collections import Counter'],
  ['  for (const v of barcodes) counts.set(v, (counts.get(v) ?? 0) + 1)', ''],
  ['  const heap = [...counts].map(([v, c]) => ({ c, v }))', 'def rearrange_barcodes(barcodes):'],
  ['  // Higher count first; on a tie, the smaller value first', '    heap = [(-c, v) for v, c in Counter(barcodes).items()]'],
  ['  const takeTop = () => { let at = 0; for (let j = 1; j < heap.length; j++) if (before(heap[j], heap[at])) at = j; return heap.splice(at, 1)[0] }', '    heapq.heapify(heap)'],
  ['  const result = []', '    result = []'],
  ['  while (heap.length) {', '    while heap:'],
  ['    const first = takeTop()', '        neg, v = heapq.heappop(heap)'],
  ['    if (result.length && result[result.length - 1] === first.v) {', '        if result and result[-1] == v:'],
  ['      const second = takeTop()', '            neg2, v2 = heapq.heappop(heap)'],
  ['      result.push(second.v)', '            result.append(v2)'],
  ['      if (second.c - 1 > 0) heap.push({ c: second.c - 1, v: second.v })', '            if neg2 + 1 < 0: heapq.heappush(heap, (neg2 + 1, v2))'],
  ['      heap.push(first)', '            heapq.heappush(heap, (neg, v))'],
  ['    } else {', '        else:'],
  ['      result.push(first.v)', '            result.append(v)'],
  ['      if (first.c - 1 > 0) heap.push({ c: first.c - 1, v: first.v })', '            if neg + 1 < 0: heapq.heappush(heap, (neg + 1, v))'],
  ['    }', ''],
  ['  }', ''],
  ['  return result', '    return result'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ barcodes }) {
  const counts = new Map()
  for (const v of barcodes) counts.set(v, (counts.get(v) ?? 0) + 1)
  const heap = [...counts].map(([v, c]) => ({ c, v }))
  // Higher remaining count first; on a tie, the smaller value first. This matches the Python heap order.
  const before = (a, b) => a.c > b.c || (a.c === b.c && a.v < b.v)
  const takeTop = () => {
    let at = 0
    for (let j = 1; j < heap.length; j++) if (before(heap[j], heap[at])) at = j
    return heap.splice(at, 1)[0]
  }
  const result = []
  const frames = [{ phase: 'start', pythonLine: P('heap = [(-c'), activeLine: L('const counts = new Map()'), placed: -1, result: [], heap: heap.map(e => ({ ...e })), message: 'Count each barcode, then place the most frequent one that differs from the last.' }]
  while (heap.length) {
    const first = takeTop()
    if (result.length && result[result.length - 1] === first.v) {
      const second = takeTop()
      result.push(second.v)
      if (second.c - 1 > 0) heap.push({ c: second.c - 1, v: second.v })
      heap.push(first)
      frames.push({ phase: 'swap', pythonLine: P('neg2, v2 = heapq'), activeLine: L('const second = takeTop()'), placed: second.v, result: [...result], heap: heap.map(e => ({ ...e })), message: `${first.v} would repeat, so ${second.v} is placed instead.` })
    } else {
      result.push(first.v)
      if (first.c - 1 > 0) heap.push({ c: first.c - 1, v: first.v })
      frames.push({ phase: 'place', pythonLine: P('result.append(v)'), activeLine: L('result.push(first.v)'), placed: first.v, result: [...result], heap: heap.map(e => ({ ...e })), message: `Place ${first.v}.` })
    }
  }
  frames.push({ phase: 'done', pythonLine: P('return result'), activeLine: L('return result'), placed: -1, result: [...result], heap: heap.map(e => ({ ...e })), message: 'No two neighbours match.' })
  return { input: { barcodes }, result, frames }
}
