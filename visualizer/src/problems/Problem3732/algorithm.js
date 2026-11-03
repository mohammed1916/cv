// Knowledge-derived model: for a fixed position and triple, the product is linear in the new value,
// so the best replacement is always the lower or upper bound of the allowed range.
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
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('for each position'), at: -1, value: null, best: null, message: `Replace exactly one of ${nums.length} values; try only the two bounds.` })
  for (let i = 0; i < nums.length; i++) {
    for (const x of [-LIMIT, LIMIT]) {
      const modified = nums.map((v, j) => (j === i ? x : v))
      const product = bestTriple(modified)
      if (product > best) { best = product; bestAt = { i, x } }
      frames.push({ pythonLine: 5, phase: 'try', activeLine: L('for x in the two bounds'), at: i, value: x, product, best, message: `Replace position ${i} with ${x}: best triple product ${product}.` })
    }
  }
  frames.push({ pythonLine: 7, phase: 'done', activeLine: L('return best'), at: bestAt ? bestAt.i : -1, value: bestAt ? bestAt.x : null, product: best, best, message: `Maximum product: ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `maximum triple product after replacing exactly one value
  best = negative infinity
  for each position i
    for x in the two bounds, minus 100000 and plus 100000
      copy the list and set position i to x
      best = max(best, largest triple product of the copy)
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

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
