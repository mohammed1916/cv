const MOD = 1000000007

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty result and a width of zero bits.' },
  { id: 'grow', label: 'Widen', description: 'A power of two has one more bit than the number before it, so the width grows by one.' },
  { id: 'append', label: 'Append', description: 'Shift the result left by the width, then add the current number in the low bits.' },
  { id: 'done', label: 'Result', description: 'The concatenation of all binary numbers, taken modulo 1000000007.' },
]

export function parseInput(text) {
  const value = Number(String(text).trim())
  if (!Number.isInteger(value) || value < 1 || value > 60) throw new Error('Enter one whole number from 1 to 60 so the frames stay readable.')
  return value
}

// Each phase points at one line of the code and one line of the Python.
const LINE = {
  start: [2, 3], grow: [4, 7], append: [5, 8], done: [6, 9],
}
const at = phase => ({ activeLine: LINE[phase][0], pythonLine: LINE[phase][1] })

export function buildTrace(n) {
  const frames = []
  let result = 0
  let width = 0
  const snap = (i = null) => ({ i, width, result, bits: i === null ? null : i.toString(2) })
  frames.push({ phase: 'start', ...at('start'), snapshot: snap(), message: `Concatenate the binary forms of 1 through ${n}, keeping only the remainder mod ${MOD}.` })
  for (let i = 1; i <= n; i++) {
    if ((i & (i - 1)) === 0) {
      width += 1
      frames.push({ phase: 'grow', ...at('grow'), snapshot: snap(i), message: `${i} is a power of two, so its binary form is longer. The width becomes ${width} bits.` })
    }
    result = ((result * 2 ** width) + i) % MOD
    frames.push({ phase: 'append', ...at('append'), snapshot: snap(i), message: `Append ${i} (binary ${i.toString(2)}), which takes ${width} bits. Result is now ${result}.` })
  }
  frames.push({ phase: 'done', ...at('done'), snapshot: snap(), message: `Concatenating 1 through ${n} gives ${result} modulo ${MOD}.` })
  return { input: n, result, frames }
}

const codeText = `concatenated binary (n):
  result = 0, width = 0
  for i from 1 to n:
    if i is a power of two: width += 1
    result = (result shifted left by width + i) mod M
  return result`
export const code = codeText.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def concatenated_binary(n):
    MOD = 10**9 + 7
    result = 0
    width = 0
    for i in range(1, n + 1):
        if i & (i - 1) == 0:
            width += 1
        result = ((result << width) + i) % MOD
    return result
`
