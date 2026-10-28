const MAX_LENGTH = 10
const MAX_VALUE = 40

const inRange = v => Number.isInteger(v) && Math.abs(v) <= MAX_VALUE

export function parseInput(text) {
  const data = JSON.parse(text)
  const { original, bounds } = data ?? {}
  if (!Array.isArray(original) || original.length < 1 || original.length > MAX_LENGTH || !original.every(inRange)) throw new Error(`original must be 1 to ${MAX_LENGTH} integers from -${MAX_VALUE} to ${MAX_VALUE}.`)
  if (!Array.isArray(bounds) || bounds.length !== original.length) throw new Error('bounds must have one [low, high] pair for each element of original.')
  for (const pair of bounds) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(inRange)) throw new Error(`Each bound is a pair of integers from -${MAX_VALUE} to ${MAX_VALUE}.`)
    if (pair[0] > pair[1]) throw new Error('Each bound must have its low value at most its high value.')
  }
  return { original, bounds }
}

export const code = `number of copy arrays(original, bounds)
  set low to the lower bound of the first element
  set high to the upper bound of the first element
  for each later position i
    set shift to original at i minus original at the first position
    raise low to the larger of low and the lower bound at i minus shift
    lower high to the smaller of high and the upper bound at i minus shift
  if low is above high
    return 0
  return high minus low plus 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ original, bounds }) {
  let low = bounds[0][0]
  let high = bounds[0][1]
  const frames = [{ phase: 'start', index: 0, shift: 0, low, high, activeLine: L('set low to the lower bound'), message: `The first copy value can be from ${low} to ${high}.` }]
  for (let i = 1; i < original.length; i++) {
    const shift = original[i] - original[0]
    low = Math.max(low, bounds[i][0] - shift)
    high = Math.min(high, bounds[i][1] - shift)
    frames.push({ phase: 'narrow', index: i, shift, low, high, activeLine: L('raise low'), message: `Position ${i} is shifted by ${shift}, so the first copy value must stay between ${low} and ${high}.` })
  }
  const result = high < low ? 0 : high - low + 1
  frames.push({ phase: 'done', index: original.length, shift: 0, low, high, activeLine: high < low ? L('return 0') : L('return high minus low'), message: `Number of copy arrays: ${result}.` })
  return { input: { original, bounds }, result, frames }
}

export const python = `def number_of_copy_arrays(original, bounds):
    low = bounds[0][0]
    high = bounds[0][1]
    for i in range(1, len(original)):
        shift = original[i] - original[0]
        low = max(low, bounds[i][0] - shift)
        high = min(high, bounds[i][1] - shift)
    if low > high:
        return 0
    return high - low + 1
`
