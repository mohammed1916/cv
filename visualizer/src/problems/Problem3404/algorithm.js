export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 14) throw new Error('Use an array of 1 to 14 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 9)) throw new Error('Numbers are integers from 1 to 9.')
  return nums
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))
const ratio = (a, b) => {
  const g = gcd(a, b)
  return `${a / g}/${b / g}`
}

export function buildTrace(nums) {
  const n = nums.length
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set total to 0'), q: null, r: null, matches: 0, total, message: 'Start with no special subsequences counted.' }]
  for (let q = 0; q < n; q++) {
    for (let r = q + 2; r < n; r++) {
      // left: ratios nums[p] / nums[q] for p at least two before q.
      const left = new Map()
      for (let p = 0; p <= q - 2; p++) {
        const k = ratio(nums[p], nums[q])
        left.set(k, (left.get(k) ?? 0) + 1)
      }
      // right: ratios nums[s] / nums[r] for s at least two after r.
      const right = new Map()
      for (let s = r + 2; s < n; s++) {
        const k = ratio(nums[s], nums[r])
        right.set(k, (right.get(k) ?? 0) + 1)
      }
      let matches = 0
      for (const [k, count] of left) matches += count * (right.get(k) ?? 0)
      total += matches
      frames.push({ phase: 'pair', activeLine: L('for each middle pair'), q, r, matches, total, message: `Middle pair q=${q}, r=${r}: ${matches} matching (p, s) choices. Running total ${total}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), q: null, r: null, matches: 0, total, message: `Special subsequences: ${total}.` })
  return { input: nums, result: total, frames }
}

export const code = `count special subsequences p < q < r < s with gaps of at least one:
  set total to 0
  for each middle pair q < r with at least one index between them:
    count left ratios nums[p] / nums[q] for p at least two before q
    count right ratios nums[s] / nums[r] for s at least two after r
    add the matching products of counts to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import gcd


def count_special(nums):
    n = len(nums)
    total = 0
    for q in range(n):
        for r in range(q + 2, n):
            left = {}
            for p in range(0, q - 1):
                g = gcd(nums[p], nums[q])
                key = (nums[p] // g, nums[q] // g)
                left[key] = left.get(key, 0) + 1
            right = {}
            for s in range(r + 2, n):
                g = gcd(nums[s], nums[r])
                key = (nums[s] // g, nums[r] // g)
                right[key] = right.get(key, 0) + 1
            for key, count in left.items():
                total += count * right.get(key, 0)
    return total
`
