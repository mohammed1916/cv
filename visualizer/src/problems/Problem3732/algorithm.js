// Replacing one value with x changes every triple that uses that position linearly in x,
// so the best replacement is one of the two bounds of the allowed range.
const LIMIT = 100000

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || !Array.isArray(input.nums)) throw new Error('Use an object with a nums list.')
  const { nums } = input
  if (nums.length < 3 || nums.length > 8) throw new Error('nums has 3 to 8 integers.')
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= 100)) throw new Error('Values are integers from -100 to 100.')
  return { nums }
}

// Largest product of three entries at distinct positions.
function bestTriple(values) {
  const s = [...values].sort((x, y) => x - y)
  const n = s.length
  // "|| 0" turns a negative zero (from multiplying by 0) into a plain zero.
  return Math.max(s[0] * s[1] * s[n - 1], s[n - 3] * s[n - 2] * s[n - 1]) || 0
}

export function buildTrace({ nums }) {
  const frames = []
  let best = -Infinity
  let bestAt = null
  frames.push({ pythonLine: P('best = float'), phase: 'start', activeLine: L('let best'), at: -1, value: null, best: null, message: `Replace exactly one of ${nums.length} values; try only the two bounds.` })
  for (let i = 0; i < nums.length; i++) {
    for (const x of [-LIMIT, LIMIT]) {
      const modified = nums.map((v, j) => (j === i ? x : v))
      const product = bestTriple(modified)
      if (product > best) { best = product; bestAt = { i, x } }
      frames.push({ pythonLine: P('copy = nums'), phase: 'try', activeLine: L('const modified'), at: i, value: x, product, best, message: `Replace position ${i} with ${x}: best triple product ${product}.` })
    }
  }
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: L('return best'), at: bestAt ? bestAt.i : -1, value: bestAt ? bestAt.x : null, product: best, best, message: `Maximum product: ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `function maxProductAfterOneReplacement(nums) {
  const LIMIT = 100000
  let best = -Infinity
  for (let i = 0; i < nums.length; i++) {
    for (const x of [-LIMIT, LIMIT]) {
      const modified = nums.map((v, j) => (j === i ? x : v))
      best = Math.max(best, bestTriple(modified))
    }
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const hit = code.find(c => c.text.includes(s))
  if (!hit) throw new Error(`No JavaScript line contains "${s}".`)
  return hit.line
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}".`)
  return index + 1
}

export const python = `def max_product_after_one_replacement(nums):
    LIMIT = 100000
    best = float("-inf")
    for i in range(len(nums)):
        for x in (-LIMIT, LIMIT):
            copy = nums[:i] + [x] + nums[i + 1:]
            s = sorted(copy)
            best = max(best, s[0] * s[1] * s[-1], s[-3] * s[-2] * s[-1])
    return best
`
