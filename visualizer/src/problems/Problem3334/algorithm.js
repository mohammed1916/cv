const MAX_LENGTH = 8
const MAX_VALUE = 30

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object like {"nums":[2,4,8,16]}.')
  if (data.nums.length < 1 || data.nums.length > MAX_LENGTH) throw new Error(`Use 1 to ${MAX_LENGTH} values.`)
  if (data.nums.some(v => !Number.isInteger(v) || v < 1 || v > MAX_VALUE)) throw new Error(`Values are integers from 1 to ${MAX_VALUE}.`)
  return { nums: data.nums }
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

function factorScore(values) {
  if (values.length === 0) return 0
  let g = 0
  let l = 1
  for (const v of values) {
    g = gcd(g, v)
    l = (l * v) / gcd(l, v)
  }
  return g * l
}

export function buildTrace({ nums }) {
  let best = factorScore(nums)
  const frames = [{ phase: 'base', activeLine: L('set best to the factor score'), index: -1, score: best, best, message: `Keeping every value gives a factor score of ${best}.` }]
  for (let i = 0; i < nums.length; i++) {
    const rest = nums.filter((_, k) => k !== i)
    const score = factorScore(rest)
    if (score > best) best = score
    frames.push({ phase: 'remove', activeLine: L('if score is more than best'), index: i, score, best, message: `Without ${nums[i]} the factor score is ${score}. Best: ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, score: best, best, message: `Maximum factor score: ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `maximum factor score after removing at most one element
  set best to the factor score of nums with nothing removed
  for each index i
    build the list without nums[i]
    set score to the factor score of that list
    if score is more than best then set best to score
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_factor_score(nums):
    from math import gcd, lcm
    def factor_score(values):
        if not values:
            return 0
        g = 0
        l = 1
        for v in values:
            g = gcd(g, v)
            l = lcm(l, v)
        return g * l
    best = factor_score(nums)
    for i in range(len(nums)):
        best = max(best, factor_score(nums[:i] + nums[i + 1:]))
    return best
`
