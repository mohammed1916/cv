export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.nums) || !Number.isInteger(data.maxVal)) throw new Error('Use {"nums": [...], "maxVal": m} with integers.')
  const { nums, maxVal } = data
  if (nums.length < 1 || nums.length > 4) throw new Error('nums must have 1 to 4 entries for the visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 12)) throw new Error('nums entries are integers from 1 to 12.')
  if (maxVal < 1 || maxVal > 12) throw new Error('maxVal is an integer from 1 to 12.')
  return { nums, maxVal }
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function buildTrace(input) {
  const { nums, maxVal } = input
  const n = nums.length
  let best = -Infinity
  let bestAt = null
  const frames = [{ phase: 'start', activeLine: L('let best be'), index: -1, value: null, cost: null, best: null, message: `Choose an index and a final value up to ${maxVal}. Every other element must end co-prime with it.` }]
  for (let i = 0; i < n; i++) {
    for (const v of [...new Set([nums[i], ...Array.from({ length: maxVal }, (_, k) => k + 1)])]) {
      let cost = v !== nums[i] ? 1 : 0
      for (let j = 0; j < n; j++) {
        if (j !== i && gcd(nums[j], v) !== 1) cost++
      }
      if (v - cost > best) {
        best = v - cost
        bestAt = [i, v]
      }
    }
    frames.push({ phase: 'index', activeLine: L('for each index i'), index: i, value: null, cost: null, best, message: `Index ${i} checked. Best score so far: ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: bestAt ? bestAt[0] : -1, value: bestAt ? bestAt[1] : null, cost: null, best, message: `Maximum score: ${best}.` })
  return { input, result: best, frames }
}

export const code = `maximum score with a co-prime chosen element
  let best be negative infinity
  for each index i
    for each value v that is nums[i] or from 1 to maxVal
      let cost be 1 if v differs from nums[i], otherwise 0
      for each other index j
        if gcd of nums[j] and v is not 1 then add 1 to cost
      if v minus cost is larger than best then set best to v minus cost
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_score_with_coprime_element(nums, maxVal):
    from math import gcd
    n = len(nums)
    best = float('-inf')
    for i in range(n):
        for v in sorted({nums[i]} | set(range(1, maxVal + 1))):
            cost = 1 if v != nums[i] else 0
            for j in range(n):
                if j != i and gcd(nums[j], v) != 1:
                    cost += 1
            if v - cost > best:
                best = v - cost
    return best
`
