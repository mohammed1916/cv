// Tuple with same product: pairs with equal products give 8 ordered tuples per pair of such pairs.
const JS_LINES = [
  { text: 'const counts = new Map()', py: 'counts = Counter' },
  { text: 'for (let i = 0; i < nums.length; i++) {', py: 'for i in range' },
  { text: 'for (let j = i + 1; j < nums.length; j++) {', py: 'for j in range' },
  { text: 'const product = nums[i] * nums[j]', py: 'product = nums[i]' },
  { text: 'counts.set(product, (counts.get(product) ?? 0) + 1)', py: 'counts[product] += 1' },
  { text: '}', py: null },
  { text: '}', py: null },
  { text: 'let answer = 0', py: 'answer = 0' },
  { text: 'for (const c of counts.values()) answer += 8 * (c * (c - 1) / 2)', py: 'answer += 8' },
  { text: 'return answer', py: 'return answer' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `from collections import Counter

def tupleSameProduct(nums):
    counts = Counter()
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            product = nums[i] * nums[j]
            counts[product] += 1
    answer = 0
    for c in counts.values():
        answer += 8 * (c * (c - 1) // 2)
    return answer
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return answer')]))

export const phases = [
  { id: 'pair', label: 'Pair', description: 'Multiply each pair of distinct numbers and record the product.' },
  { id: 'group', label: 'Group', description: 'Products seen c times give c choose 2 pairs of pairs.' },
  { id: 'done', label: 'Result', description: 'Each pair of pairs gives 8 ordered tuples.' },
]

export const examples = [
  { label: 'One matching product', input: '[2,3,4,6]' },
  { label: 'Two products repeat', input: '[1,2,3,4,6,8]' },
]

export const complexity = 'O(n^2) time and O(n^2) space for n distinct positive numbers.'

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use a JSON array of 1 to 12 distinct positive integers (visual cap).')
  if (new Set(nums).size !== nums.length || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Values are distinct integers from 1 to 1000.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const counts = new Map()
  const snap = extra => ({ counts: Object.fromEntries(counts), ...extra })
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const product = nums[i] * nums[j]
      counts.set(product, (counts.get(product) ?? 0) + 1)
      frames.push({ phase: 'pair', activeLine: 4, pair: [nums[i], nums[j]], product, message: `${nums[i]} × ${nums[j]} = ${product}; seen ${counts.get(product)} time${counts.get(product) === 1 ? '' : 's'}.`, snapshot: snap({}) })
    }
  }
  let answer = 0
  for (const [product, c] of counts) {
    const add = 8 * (c * (c - 1) / 2)
    answer += add
    if (c > 1) frames.push({ phase: 'group', activeLine: 9, product, c, message: `Product ${product} has ${c} pairs: ${c * (c - 1) / 2} pair${c * (c - 1) / 2 === 1 ? '' : 's'} of pairs, +${add}.`, snapshot: snap({ answer }) })
  }
  frames.push({ phase: 'done', activeLine: 10, result: answer, message: `Ordered tuples: ${answer}.`, snapshot: snap({ answer, result: answer }) })
  return { input: nums, result: answer, frames }
}
