// Original teaching model. The bit strings are invented for this visualization.
// A grouped block is as wide as the number of ones. Every zero inside the best block must be swapped with a one from outside,
// so the answer is the number of ones minus the most ones any window of that width already contains.

export const phases = [
  { id: 'count', label: 'Count ones', description: 'The grouped block must be as wide as the total number of ones.' },
  { id: 'window', label: 'First window', description: 'Count the ones already inside the first block-width window.' },
  { id: 'slide', label: 'Slide', description: 'Move the window one cell right, adding one entering cell and removing one leaving cell.' },
  { id: 'done', label: 'Result', description: 'Ones outside the best window must cross in.' },
]

export const code = `function minSwaps(bits) {
  const n = bits.length
  const ones = bits.reduce((sum, v) => sum + v, 0)
  if (ones === 0) return 0
  let inside = 0
  for (let k = 0; k < ones; k++) inside += bits[k]
  let best = inside
  for (let start = 1; start <= n - ones; start++) {
    inside += bits[start + ones - 1] - bits[start - 1]
    best = Math.max(best, inside)
  }
  return ones - best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

const at = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing code line: ${key}`)
  return index + 1
}
const pyAt = key => python.split('\n').findIndex(l => l.includes(key)) + 1

export const python = `def min_swaps(bits):
    n = len(bits)
    ones = sum(bits)
    if ones == 0: return 0
    inside = sum(bits[:ones])
    best = inside
    for start in range(1, n - ones + 1):
        inside += bits[start + ones - 1] - bits[start - 1]
        best = max(best, inside)
    return ones - best`

export const inputLabel = 'Binary array (JSON array of 0s and 1s)'
export const complexity = 'O(n) time: each window slides once. The space is O(1) beyond the input.'
export const examples = [
  { label: 'Sample', input: '[1,0,1,0,0,1,1,0,1]' },
  { label: 'Already grouped', input: '[0,1,1,1,0]' },
  { label: 'No ones', input: '[0,0,0]' },
  { label: 'Single one', input: '[1]' },
  { label: 'Ones at both ends', input: '[1,0,0,0,1]' },
  { label: 'Alternating, 16 positions', input: '[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]' },
  { label: 'Long run: 16 positions', input: '[0,1,1,1,0,0,0,1,1,1,1,1,1,0,0,1]' },
]

export function parseInput(text) {
  const bits = JSON.parse(text)
  if (!Array.isArray(bits) || bits.length < 1 || bits.length > 16) throw new Error('Enter a JSON array of 1 to 16 values.')
  bits.forEach((value, i) => { if (value !== 0 && value !== 1) throw new Error(`Position ${i} must be 0 or 1.`) })
  return bits
}

export function buildTrace(bits) {
  const n = bits.length
  const ones = bits.reduce((sum, value) => sum + value, 0)
  const frames = []
  const snap = extra => ({ bits, ones, start: null, inside: null, best: null, ...extra })

  frames.push({
    phase: 'count', activeLine: at('const ones = bits'), pythonLine: pyAt('ones = sum(bits)'),
    message: `There are ${ones} ones. The grouped block will be ${ones} cells wide.`,
    snapshot: snap(),
  })
  if (ones === 0) {
    frames.push({
      phase: 'done', activeLine: at('if (ones === 0)'), pythonLine: pyAt('if ones == 0'),
      message: 'There are no ones, so nothing needs grouping and no swaps are needed.',
      snapshot: snap({ inside: 0, best: 0 }),
    })
    return { input: bits, result: 0, frames }
  }

  let inside = 0
  for (let k = 0; k < ones; k++) inside += bits[k]
  let best = inside
  frames.push({
    phase: 'window', activeLine: at('for (let k = 0; k < ones'), pythonLine: pyAt('inside = sum(bits[:ones])'),
    message: `The first window covers positions 0 to ${ones - 1} and already holds ${inside} ones.`,
    snapshot: snap({ start: 0, inside, best }),
  })
  frames.push({
    phase: 'window', activeLine: at('let best = inside'), pythonLine: pyAt('best = inside'),
    message: `Record ${inside} as the best count so far.`,
    snapshot: snap({ start: 0, inside, best }),
  })

  for (let start = 1; start <= n - ones; start++) {
    inside += bits[start + ones - 1] - bits[start - 1]
    best = Math.max(best, inside)
    frames.push({
      phase: 'slide', activeLine: at('inside += bits'), pythonLine: pyAt('inside += bits'),
      message: `Slide to start ${start}: position ${start + ones - 1} enters (${bits[start + ones - 1]}) and position ${start - 1} leaves (${bits[start - 1]}). The window holds ${inside} ones.`,
      snapshot: snap({ start, inside, best }),
    })
  }

  const result = ones - best
  frames.push({
    phase: 'done', activeLine: at('return ones - best'), pythonLine: pyAt('return ones - best'),
    message: `The best window keeps ${best} ones, so ${ones} - ${best} = ${result} swaps are needed.`,
    snapshot: snap({ inside, best }),
  })
  return { input: bits, result, frames }
}
