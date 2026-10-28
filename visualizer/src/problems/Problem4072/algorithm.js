export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use an object with a nums array.')
  const { nums } = obj
  if (nums.length < 1 || nums.length > 12) throw new Error('Use 1 to 12 numbers for the visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < -1000 || v > 1000)) throw new Error('Each number must be an integer from -1000 to 1000 for the visualization.')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const n = nums.length
  const NEG = -Infinity
  // plus[i][g]: best alternating sum of a subarray ending at i with nums[i] added as a + term.
  // minus[i][g]: the same with nums[i] as a - term. g = 1 means one element has been deleted inside the subarray.
  const plus = []
  const minus = []
  const frames = []
  let best = NEG
  for (let i = 0; i < n; i++) {
    const x = nums[i]
    const p = [x, NEG]
    const m = [NEG, NEG]
    for (let g = 0; g < 2; g++) {
      if (i >= 1 && minus[i - 1][g] > NEG) p[g] = Math.max(p[g], minus[i - 1][g] + x)
      if (i >= 1 && plus[i - 1][g] > NEG) m[g] = Math.max(m[g], plus[i - 1][g] - x)
    }
    if (i >= 2 && minus[i - 2][0] > NEG) p[1] = Math.max(p[1], minus[i - 2][0] + x)
    if (i >= 2 && plus[i - 2][0] > NEG) m[1] = Math.max(m[1], plus[i - 2][0] - x)
    plus.push(p)
    minus.push(m)
    best = Math.max(best, p[0], p[1], m[0], m[1])
    frames.push({ phase: 'index', activeLine: L('set p to x'), index: i, best, plus: p.slice(), minus: m.slice(), message: `Ending at index ${i} (${x}): plus ${p[0]} / ${p[1]}, minus ${m[0]} / ${m[1]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, best, plus: null, minus: null, message: `Largest alternating sum: ${best}.` })
  return { input, result: best, frames }
}

export const code = `maximum alternating subarray sum with one deletion(nums)
  set best to nothing
  for each index i in nums do
    set p to x as a plus term with nothing deleted yet
    extend p and minus from the previous index, with and without a deletion
    if two indices back has a skipped element then extend p and minus from two indices back
    record p and minus in best
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_alternating_sum_one_deletion(nums):
    NEG = float('-inf')
    plus = []
    minus = []
    best = NEG
    for i, x in enumerate(nums):
        p = [x, NEG]
        m = [NEG, NEG]
        for g in (0, 1):
            if i >= 1 and minus[i - 1][g] > NEG:
                p[g] = max(p[g], minus[i - 1][g] + x)
            if i >= 1 and plus[i - 1][g] > NEG:
                m[g] = max(m[g], plus[i - 1][g] - x)
        if i >= 2 and minus[i - 2][0] > NEG:
            p[1] = max(p[1], minus[i - 2][0] + x)
        if i >= 2 and plus[i - 2][0] > NEG:
            m[1] = max(m[1], plus[i - 2][0] - x)
        plus.append(p)
        minus.append(m)
        best = max(best, p[0], p[1], m[0], m[1])
    return best
`
