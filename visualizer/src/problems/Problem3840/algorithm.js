export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || !Array.isArray(input.colors)) throw new Error('Use an object with nums and colors.')
  const { nums, colors } = input
  if (nums.length < 1 || nums.length > 10 || nums.length !== colors.length) throw new Error('nums and colors have the same length, 1 to 10.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 30)) throw new Error('Each amount is an integer from 0 to 30.')
  if (!colors.every(v => Number.isInteger(v) && v >= 1 && v <= 4)) throw new Error('Each colour is an integer from 1 to 4.')
  return { nums, colors }
}

// skip[i]: best total over houses 0..i with house i not robbed.
// take[i]: best total over houses 0..i with house i robbed.
export function buildTrace({ nums, colors }) {
  const n = nums.length
  const frames = []
  const skip = Array(n).fill(0)
  const take = Array(n).fill(-Infinity)
  for (let i = 0; i < n; i++) {
    const prevSkip = i > 0 ? skip[i - 1] : 0
    const prevTake = i > 0 ? take[i - 1] : -Infinity
    let bestBefore = prevSkip
    if (i > 0 && colors[i] !== colors[i - 1]) bestBefore = Math.max(bestBefore, prevTake)
    take[i] = nums[i] + bestBefore
    skip[i] = Math.max(prevSkip, prevTake)
    frames.push({ pythonLine: P('take[i] = nums[i]'), phase: 'house', activeLine: C('take[i] = nums[i]'), at: i,
      skip: [...skip], take: take.map(v => (v === -Infinity ? null : v)),
      message: `House ${i} (amount ${nums[i]}, colour ${colors[i]}): robbing it gives ${take[i]}, skipping it gives ${skip[i]}.` })
  }
  const result = n ? Math.max(skip[n - 1], take[n - 1]) : 0
  frames.push({ pythonLine: P('return max'), phase: 'done', activeLine: C('return the larger'), at: -1,
    skip: [...skip], take: take.map(v => (v === -Infinity ? null : v)), message: `Maximum amount ${result}.` })
  return { input: { nums, colors }, result, frames }
}

export function solve(input) {
  return buildTrace(input).result
}

export const code = `maximum amount robbed when same-coloured neighbours cannot both be robbed
  skip[i] is the best total up to house i without robbing house i
  take[i] is the best total up to house i with house i robbed
  for each house i
    take[i] = nums[i] plus the best earlier total that allows house i
    skip[i] = the best total up to house i - 1
  return the larger of skip and take at the last house`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))

export const python = `def house_robber_v(nums, colors):
    n = len(nums)
    NEG = float("-inf")
    skip = [0] * n
    take = [NEG] * n
    for i in range(n):
        prev_skip = skip[i - 1] if i > 0 else 0
        prev_take = take[i - 1] if i > 0 else NEG
        best_before = prev_skip
        if i > 0 and colors[i] != colors[i - 1]:
            best_before = max(best_before, prev_take)
        take[i] = nums[i] + best_before
        skip[i] = max(prev_skip, prev_take)
    return max(skip[n - 1], take[n - 1])
`

const PY = python.split('\n')
const CODE = code.map(c => c.text)
function P(text) { return PY.findIndex(line => line.includes(text)) + 1 }
function C(text) { return CODE.findIndex(line => line.includes(text)) + 1 }
