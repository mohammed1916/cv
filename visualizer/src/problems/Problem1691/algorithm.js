export const phases = [
  { id: 'sort', label: 'Sort each box', description: 'Sort the three sides of every box so the smallest comes first and the largest last.' },
  { id: 'order', label: 'Order the boxes', description: 'Order the boxes so that any box that could sit on another comes first.' },
  { id: 'extend', label: 'Extend a stack', description: 'For each box, take the tallest stack that a smaller box can extend, then add this box height.' },
  { id: 'done', label: 'Tallest stack', description: 'The best stack ends at the box with the largest total, and we follow the links back.' },
]

export function parseInput(text) {
  const boxes = JSON.parse(text)
  if (!Array.isArray(boxes) || boxes.length < 1 || boxes.length > 20 || !boxes.every(b => Array.isArray(b) && b.length === 3 && b.every(v => Number.isInteger(v) && v >= 1 && v <= 100))) {
    throw new Error('Enter a JSON array of 1 to 20 boxes, each as [length, width, height] with whole numbers from 1 to 100.')
  }
  return boxes
}

export const code = `max stack height (boxes):
  for each box: sort its three sides, smallest first
  sort the boxes by their sorted sides
  for i from 0 to n - 1:
    best[i] = height of box i (its largest side)
    for each earlier box j:
      if every side of j fits under box i:
        best[i] = max(best[i], best[j] + height of box i)
  return max of best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_stack_height(boxes):
    boxes = sorted(sorted(box) for box in boxes)
    best = [0] * len(boxes)
    for i, box in enumerate(boxes):
        best[i] = box[2]
        for j in range(i):
            low = boxes[j]
            if low[0] <= box[0] and low[1] <= box[1] and low[2] <= box[2]:
                best[i] = max(best[i], best[j] + box[2])
    return max(best)
`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (pseudo, py) => ({ activeLine: L(pseudo), pythonLine: P(py) })

const fits = (low, high) => low[0] <= high[0] && low[1] <= high[1] && low[2] <= high[2]
const lexCompare = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]

export function buildTrace(input) {
  const sorted = input.map(box => [...box].sort((a, b) => a - b))
  const frames = []
  sorted.forEach((box, k) => frames.push({ phase: 'sort', ...at('sort its three sides', 'sorted(sorted(box)'), snapshot: { boxes: sorted.slice(0, k + 1), ordered: null, best: null, current: null, from: null, chain: null }, message: `Box ${k + 1} ${input[k].join(' x ')} sorted to ${box.join(' x ')}, so its largest side ${box[2]} is its height.` }))
  const ordered = [...sorted].sort(lexCompare)
  frames.push({ phase: 'order', ...at('sort the boxes by', 'boxes = sorted('), snapshot: { boxes: sorted, ordered, best: null, current: null, from: null, chain: null }, message: `Boxes in order from smallest to largest: ${ordered.map(b => b.join('x')).join(', ')}.` })
  const best = []
  const from = []
  ordered.forEach((box, i) => {
    best[i] = box[2]
    from[i] = -1
    for (let j = 0; j < i; j++) {
      if (fits(ordered[j], box) && best[j] + box[2] > best[i]) { best[i] = best[j] + box[2]; from[i] = j }
    }
    frames.push({ phase: 'extend', ...at('best[i] = height of box i', 'best[i] = box[2]'), snapshot: { boxes: sorted, ordered, best: [...best], current: i, from: [...from], chain: null }, message: `Box ${box.join('x')} starts a stack of ${box[2]}${from[i] >= 0 ? `, and it extends the stack ending at ${ordered[from[i]].join('x')} for a total of ${best[i]}` : ''}.` })
  })
  const top = best.indexOf(Math.max(...best))
  const chain = []
  for (let k = top; k >= 0; k = from[k]) chain.unshift(k)
  const result = Math.max(...best)
  frames.push({ phase: 'done', ...at('return max of best', 'return max(best)'), snapshot: { boxes: sorted, ordered, best: [...best], current: top, from: [...from], chain: chain.map(k => ordered[k]) }, message: `The tallest stack is ${result}, built from ${chain.map(k => ordered[k].join('x')).join(' then ')}.` })
  return { input, result, frames }
}
