// Every powerful integer is a power of x plus a power of y. Lay the powers out as a grid, test each sum once,
// and keep the distinct sums that do not pass the bound.
export const code = String.raw`function powerfulIntegers(x, y, bound) {
  const powers = base => { // 1, base, base squared, ... up to the bound
    const list = [];
    for (let p = 1; p <= bound; p *= base) {
      list.push(p);
      if (base === 1) break; // 1 raised to any power is 1, so one entry is enough
    }
    return list;
  };
  const found = new Set();
  for (const a of powers(x)) {
    for (const b of powers(y)) {
      if (a + b <= bound) found.add(a + b);
    }
  }
  return [...found].sort((p, q) => p - q);
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`Missing JavaScript line for "${s}"`); return i + 1 }

export const python = String.raw`def powerful_integers(x, y, bound):
    def powers(base):
        result = []
        p = 1
        while p <= bound:
            result.append(p)
            if base == 1:
                break
            p *= base
        return result
    found = set()
    for a in powers(x):
        for b in powers(y):
            if a + b <= bound:
                found.add(a + b)
    return sorted(found)`
const PYL = python.split('\n')
const PY = s => { const i = PYL.findIndex(t => t.includes(s)); if (i < 0) throw new Error(`Missing Python line for "${s}"`); return i + 1 }

export const phases = [
  { id: 'grid', label: 'Pairs', description: 'Each power of x meets each power of y in one cell of the grid.' },
  { id: 'done', label: 'Sorted sums', description: 'The distinct sums that stay within the bound.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const { x, y, bound } = input || {}
  for (const [name, value, min, max] of [['x', x, 1, 20], ['y', y, 1, 20], ['bound', bound, 0, 500]]) {
    if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${name} must be an integer from ${min} to ${max}.`)
  }
  return { x, y, bound }
}

function powersOf(base, bound) {
  const list = []
  for (let p = 1; p <= bound; p *= base) {
    list.push(p)
    if (base === 1) break
  }
  return list
}

export function buildTrace({ x, y, bound }) {
  const rows = powersOf(x, bound)
  const cols = powersOf(y, bound)
  const found = new Set()
  const frames = []
  const cells = []
  rows.forEach((a, i) => cols.forEach((b, j) => {
    const sum = a + b
    let status
    if (sum > bound) status = 'over'
    else if (found.has(sum)) status = 'repeat'
    else { status = 'new'; found.add(sum) }
    cells.push({ i, j, sum, status })
    const message = status === 'over' ? `${a} + ${b} = ${sum} is over the bound ${bound}, so it is skipped.`
      : status === 'repeat' ? `${a} + ${b} = ${sum} was already found through another pair.`
        : `${a} + ${b} = ${sum} is new and within the bound.`
    frames.push({ phase: 'grid', activeLine: L(sum > bound ? 'if (a + b <= bound)' : 'found.add'), pythonLine: PY('if a + b <= bound'), current: [i, j], cells: [...cells], found: [...found].sort((p, q) => p - q), rows, cols, message })
  }))
  const result = [...found].sort((p, q) => p - q)
  frames.push({ phase: 'done', activeLine: L('return [...found]'), pythonLine: PY('return sorted(found)'), current: null, cells: [...cells], found: result, rows, cols, message: `${result.length} distinct powerful integers are within the bound.` })
  return { input: { x, y, bound }, result, frames }
}
