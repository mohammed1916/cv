export function parseInput(text) {
  const data = JSON.parse(text)
  const { a, b } = data ?? {}
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length < 2 || a.length > 60) throw new Error('a and b must be arrays of the same length, 2 to 60.')
  if ([...a, ...b].some(v => !Number.isInteger(v) || v < 0 || v > 2000)) throw new Error('Values are integers from 0 to 2000.')
  return { a, b }
}

const JS_LINES = [
  'function minSwap(a, b) {',
  '  let keep = 0, swap = 1 // fewest swaps so far when position i keeps or swaps its pair',
  '  for (let i = 1; i < a.length; i++) {',
  '    let nextKeep = Infinity, nextSwap = Infinity',
  '    if (a[i] > a[i - 1] && b[i] > b[i - 1]) { // both sequences rise without any swap change',
  '      nextKeep = Math.min(nextKeep, keep)',
  '      nextSwap = Math.min(nextSwap, swap + 1)',
  '    }',
  '    if (a[i] > b[i - 1] && b[i] > a[i - 1]) { // the rise works only if the previous pair was swapped',
  '      nextKeep = Math.min(nextKeep, swap)',
  '      nextSwap = Math.min(nextSwap, keep + 1)',
  '    }',
  '    keep = nextKeep',
  '    swap = nextSwap',
  '  }',
  '  return Math.min(keep, swap) // return the fewest swaps',
  '}',
]
const PY_LINES = [
  'def min_swap(a, b):',
  '    keep, swap = 0, 1',
  '    for i in range(1, len(a)):',
  '        next_keep = next_swap = float(\'inf\')',
  '        if a[i] > a[i - 1] and b[i] > b[i - 1]:',
  '            next_keep = min(next_keep, keep)',
  '            next_swap = min(next_swap, swap + 1)',
  '        if a[i] > b[i - 1] and b[i] > a[i - 1]:',
  '            next_keep = min(next_keep, swap)',
  '            next_swap = min(next_swap, keep + 1)',
  '        keep, swap = next_keep, next_swap',
  '    return min(keep, swap)',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Two states per position: the pair is kept as given, or swapped. Each state reads the two states before it.
export function buildTrace({ a, b }) {
  let keep = 0, swap = 1
  const rows = [{ i: 0, a: a[0], b: b[0], keep, swap }]
  const frames = [{ phase: 'start', i: 0, rows: [...rows], activeLine: L('let keep = 0'), pythonLine: P('keep, swap = 0, 1'), message: `Position 0 costs 0 if kept and 1 if swapped.` }]
  const INF = Infinity
  for (let i = 1; i < a.length; i++) {
    let nextKeep = INF, nextSwap = INF
    const straight = a[i] > a[i - 1] && b[i] > b[i - 1]
    const crossed = a[i] > b[i - 1] && b[i] > a[i - 1]
    if (straight) { nextKeep = Math.min(nextKeep, keep); nextSwap = Math.min(nextSwap, swap + 1) }
    if (crossed) { nextKeep = Math.min(nextKeep, swap); nextSwap = Math.min(nextSwap, keep + 1) }
    keep = nextKeep
    swap = nextSwap
    rows.push({ i, a: a[i], b: b[i], keep, swap, straight, crossed })
    frames.push({ phase: 'step', i, rows: rows.map(r => ({ ...r })), activeLine: L('nextKeep = Math.min'), pythonLine: P('next_keep = min'),
      message: `Position ${i}: ${straight ? 'keeping pairs rises' : ''}${straight && crossed ? ' and ' : ''}${crossed ? 'swapping pairs rises' : ''}${!straight && !crossed ? 'neither choice rises, so the sequences cannot both stay increasing' : ''}.` })
  }
  const result = Math.min(keep, swap)
  frames.push({ phase: 'done', i: a.length - 1, rows: rows.map(r => ({ ...r })), result, activeLine: L('return Math.min(keep, swap)'), pythonLine: P('return min(keep, swap)'), message: `Fewest swaps: ${result}.` })
  return { input: { a, b }, result, frames }
}
