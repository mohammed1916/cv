// LeetCode 1913: the two largest values give the best first product; the two smallest give the best second product.
const SOURCE = [
  "function maxProductDifference(nums) {",
  "  const sorted = [...nums].sort((a, b) => a - b)",
  "  const n = sorted.length",
  "  const big = sorted[n - 1] * sorted[n - 2]",
  "  const small = sorted[0] * sorted[1]",
  "  return big - small",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def max_product_difference(nums):
    ordered = sorted(nums)
    n = len(ordered)
    big = ordered[n - 1] * ordered[n - 2]
    small = ordered[0] * ordered[1]
    return big - small
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'sort', label: 'Sort', description: 'Put the values in order so the extremes are at the ends.' },
  { id: 'largest', label: 'Largest pair', description: 'The last two values form the largest product.' },
  { id: 'smallest', label: 'Smallest pair', description: 'The first two values form the smallest product.' },
  { id: 'done', label: 'Result', description: 'Subtract the smallest product from the largest.' },
]

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Enter a JSON array of integers, for example [2,9,4,1,7].') }
  if (!Array.isArray(nums) || nums.length < 4 || nums.length > 12) throw new Error('Use 4 to 12 values for the visualization.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 10000)) throw new Error('Each value is an integer from 1 to 10000.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  const sorted = [...nums].sort((a, b) => a - b)
  const n = sorted.length
  const roleOf = i => (i >= n - 2 ? 'big' : i <= 1 ? 'small' : '')
  frames.push({ phase: 'sort', activeLine: L('const sorted ='), pythonLine: P('ordered = sorted'), message: 'Sort the values ascending.', sorted, big: null, small: null, result: null })
  const big = sorted[n - 1] * sorted[n - 2]
  frames.push({ phase: 'largest', activeLine: L('const big ='), pythonLine: P('big = ordered'), message: `Largest two: ${sorted[n - 2]} and ${sorted[n - 1]}, product ${big}.`, sorted, big, small: null, result: null, roleOf })
  const small = sorted[0] * sorted[1]
  frames.push({ phase: 'smallest', activeLine: L('const small ='), pythonLine: P('small = ordered'), message: `Smallest two: ${sorted[0]} and ${sorted[1]}, product ${small}.`, sorted, big, small, result: null, roleOf })
  const result = big - small
  frames.push({ phase: 'done', activeLine: L('return big'), pythonLine: P('return big - small'), message: `${big} - ${small} = ${result}.`, sorted, big, small, result, roleOf })
  return { input: { nums }, result, frames }
}
