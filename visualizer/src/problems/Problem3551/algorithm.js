export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input?.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('Use {"nums": [...]} with 1 to 10 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 999)) throw new Error('Numbers are integers from 1 to 999.')
  if (new Set(nums).size !== nums.length) throw new Error('Numbers must be distinct.')
  return { nums }
}

const digitSum = x => String(x).split('').reduce((sum, ch) => sum + Number(ch), 0)

export function buildTrace(input) {
  const nums = input.nums
  const n = nums.length
  const frames = []
  const target = [...nums].sort((a, b) => digitSum(a) - digitSum(b) || a - b)
  frames.push({ phase: 'target', activeLine: L('set target to'), at: -1, cycle: [], swaps: 0, visited: [], target, message: `Target order by digit sum, then value: ${target.join(', ')}.` })
  const where = new Map(target.map((v, i) => [v, i]))
  const perm = nums.map(v => where.get(v))
  const visited = []
  const seen = Array(n).fill(false)
  let swaps = 0
  for (let i = 0; i < n; i++) {
    if (seen[i]) {
      frames.push({ phase: 'skip', activeLine: L('if position i is visited'), at: i, cycle: [], swaps, visited: [...visited], target, message: `Position ${i} is already in a cycle, so skip it.` })
      continue
    }
    const cycle = []
    for (let j = i; !seen[j]; j = perm[j]) {
      seen[j] = true
      cycle.push(j)
      visited.push(j)
    }
    swaps += cycle.length - 1
    frames.push({ phase: 'cycle', activeLine: L('add the cycle length'), at: i, cycle: [...cycle], swaps, visited: [...visited], target, message: `The cycle from position ${i} has ${cycle.length} position(s), so it needs ${cycle.length - 1} swap(s). Total: ${swaps}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return swaps'), at: -1, cycle: [], swaps, visited: [...visited], target, message: `Minimum swaps: ${swaps}.` })
  return { input, target, result: swaps, frames }
}

export const code = `minimum swaps to sort numbers by digit sum, then by value
  set target to the numbers sorted by digit sum and then by value
  map each number to its position in target to get the permutation
  set swaps to zero and mark every position as unvisited
  for each position i in order
    if position i is visited then skip it
    walk the cycle from i, marking each position visited
    add the cycle length minus one to swaps
  return swaps`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_swaps_by_digit_sum(nums):
    def digit_sum(x):
        return sum(int(ch) for ch in str(x))
    target = sorted(nums, key=lambda x: (digit_sum(x), x))
    where = {v: i for i, v in enumerate(target)}
    perm = [where[v] for v in nums]
    seen = [False] * len(nums)
    swaps = 0
    for i in range(len(nums)):
        if seen[i]:
            continue
        length = 0
        j = i
        while not seen[j]:
            seen[j] = True
            j = perm[j]
            length += 1
        swaps += length - 1
    return swaps
`
