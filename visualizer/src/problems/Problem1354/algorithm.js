export function parseInput(text) {
  const data = JSON.parse(text)
  const { target } = data ?? {}
  if (!Array.isArray(target) || target.length < 1 || target.length > 5) throw new Error('Use "target" as an array of 1 to 5 values.')
  if (target.some(v => !Number.isInteger(v) || v < 1 || v > 12)) throw new Error('Each target value is an integer from 1 to 12.')
  return { target }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function possibleFromOnes(target) {', 'import heapq'],
  ['  if (target.length === 1) return target[0] === 1', 'def possible_from_ones(target):'],
  ['  const heap = target.map(v => -v)', '    if len(target) == 1:'],
  ['  heap.sort((a, b) => a - b)', '        return target[0] == 1'],
  ['  let total = target.reduce((a, b) => a + b, 0)', '    heap = [-v for v in target]'],
  ['  while (true) {', '    heapq.heapify(heap)'],
  ['    const x = -heap.shift()', '    total = sum(target)'],
  ['    const rest = total - x', '    while True:'],
  ['    if (x === 1 || rest === 1) return true', '        x = -heapq.heappop(heap)'],
  ['    if (x <= rest) return false', '        rest = total - x'],
  ['    const next = x % rest', '        if x == 1 or rest == 1: return True'],
  ['    if (next === 0) return false', '        if x <= rest: return False'],
  ['    heap.push(-next); heap.sort((a, b) => a - b)', '        new = x % rest'],
  ['    total = rest + next', '        if new == 0: return False'],
  ['  }', '        heapq.heappush(heap, -new)'],
  ['}', '        total = rest + new'],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ target }) {
  const values = [...target]
  let total = values.reduce((a, b) => a + b, 0)
  const frames = []
  let result
  let exitKey
  if (values.length === 1) {
    result = values[0] === 1
    exitKey = result ? ['return true', 'return True'] : ['return false', 'return False']
    frames.push({ phase: 'single', pythonLine: P('if len(target) == 1'), activeLine: L('if (target.length === 1)'), values: [...values], picked: 0, message: 'A single value can only come from a start of [1].' })
  } else {
    for (;;) {
      let at = 0
      for (let i = 1; i < values.length; i++) if (values[i] > values[at]) at = i
      const x = values[at]
      const rest = total - x
      frames.push({ phase: 'undo', pythonLine: P('x = -heapq'), activeLine: L('const x = -heap'), values: [...values], picked: at, message: `Largest ${x}; the other values sum to ${rest}.` })
      if (x === 1 || rest === 1) { result = true; exitKey = ['return true', 'return True']; break }
      if (x <= rest) { result = false; exitKey = ['return false', 'return False']; break }
      const next = x % rest
      if (next === 0) { result = false; exitKey = ['return false', 'return False']; break }
      values[at] = next
      total = rest + next
    }
  }
  frames.push({ phase: 'done', pythonLine: P(exitKey[1]), activeLine: L(exitKey[0]), values: [...values], picked: -1, message: `Answer: ${result}.` })
  return { input: { target }, result, frames }
}
