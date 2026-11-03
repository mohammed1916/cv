const PHASES = [
  { id: 'start', label: 'Pool', description: 'Every bit is still unbroken; any element may come first.' },
  { id: 'pick', label: 'Pick', description: 'Choose the element that keeps the most unbroken bits set.' },
  { id: 'break', label: 'Break', description: 'Bits the chosen element lacks end their run here.' },
  { id: 'done', label: 'Vector', description: 'Report the fifteen run lengths from bit 14 down to bit 0.' },
]

export const phases = PHASES

const CODE_LINES = [
  'lexicographically largest power array',
  'U is the mask of bits still unbroken, all 15 bits at first; fixed[b] is the run length for bit b',
  'pool is nums; order is empty',
  'while the pool is not empty and U is not zero',
  '  pick x from the pool maximising x and U, and append it to order',
  '  for each bit b in U that x lacks, set fixed[b] to the current position',
  '  U = U and x',
  'for each bit b still unfixed, set fixed[b] to the length of nums',
  'return fixed from bit 14 down to bit 0',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))

function L(fragment) {
  const index = code.findIndex(c => c.text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

export const python = `def largest_power_array(nums):
    n = len(nums)
    U = (1 << 15) - 1
    fixed = [None] * 15
    pool = list(nums)
    order = []
    while pool and U:
        best = max(range(len(pool)), key=lambda i: pool[i] & U)
        x = pool.pop(best)
        order.append(x)
        pos = len(order) - 1
        for b in range(15):
            if (U >> b) & 1 and not (x >> b) & 1:
                fixed[b] = pos
        U &= x
    for b in range(15):
        if fixed[b] is None:
            fixed[b] = n
    return [fixed[b] for b in range(14, -1, -1)]
`

const PY = python.split('\n')

function P(fragment) {
  const index = PY.findIndex(line => line.includes(fragment))
  if (index < 0) throw new Error(`Missing Python line: ${fragment}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('nums has 1 to 10 values.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 32767)) throw new Error('Each value is an integer from 0 to 32767.')
  return { nums }
}

// Result: element at position p lacks bit b for the first time at p, so the run for bit b is p.
// Choosing the element with the largest value restricted to the unbroken bits delays the next break.
export function buildTrace({ nums }) {
  const n = nums.length
  let U = (1 << 15) - 1
  const fixed = Array(15).fill(null)
  const pool = [...nums]
  const order = []
  const frames = []
  const snap = () => [...fixed]
  frames.push({ pythonLine: P('U = (1 << 15) - 1'), phase: 'start', activeLine: L('U is the mask'), U, picked: null, order: [], fixed: snap(), message: `All 15 bits unbroken; ${pool.length} element${pool.length === 1 ? '' : 's'} to place.` })
  while (pool.length && U) {
    let best = 0
    for (let i = 1; i < pool.length; i++) if ((pool[i] & U) > (pool[best] & U)) best = i
    const x = pool.splice(best, 1)[0]
    order.push(x)
    const pos = order.length - 1
    frames.push({ pythonLine: P('best = max'), phase: 'pick', activeLine: L('pick x from the pool'), U, picked: x, order: [...order], fixed: snap(), message: `Place ${x} at position ${pos}: it keeps ${(x & U).toString(2).padStart(15, '0')} of the unbroken bits.` })
    const broken = []
    for (let b = 0; b < 15; b++) {
      if (((U >> b) & 1) && !((x >> b) & 1)) { fixed[b] = pos; broken.push(b) }
    }
    U &= x
    frames.push({ pythonLine: P('fixed[b] = pos'), phase: 'break', activeLine: L('set fixed[b]'), U, picked: x, order: [...order], fixed: snap(), broken, message: broken.length ? `Bits ${broken.join(', ')} end their run at position ${pos}.` : `${x} breaks no bit.` })
  }
  for (let b = 0; b < 15; b++) if (fixed[b] === null) fixed[b] = n
  const result = []
  for (let b = 14; b >= 0; b--) result.push(fixed[b])
  frames.push({ pythonLine: P('return [fixed[b]'), phase: 'done', activeLine: L('return fixed from bit 14'), U, picked: null, order: [...order], fixed: snap(), message: `Vector: [${result.join(', ')}].` })
  return { input: { nums }, result, frames }
}
