// Teaching model (knowledge-derived): removed stretches are unions of disjoint blocks whose sums
// are divisible by k. Prefix sums with equal residues mark where such a block can start and end.
const lineOf = (lines, text) => lines.findIndex(line => line.includes(text)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.nums)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (nums.length < 1 || nums.length > 20) throw new Error('nums has 1 to 20 values for the visualization.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each value is an integer from 1 to 100.')
  if (!Number.isInteger(k) || k < 1 || k > 20) throw new Error('k is an integer from 1 to 20.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const n = nums.length
  const total = nums.reduce((sum, v) => sum + v, 0)
  const prefix = [0]
  const removedBest = new Array(k).fill(null) // best (removed sum up to j) - prefix[j], per residue
  const bestStart = new Array(k).fill(-1)
  const dp = [0]
  const choice = [null]
  removedBest[0] = 0
  bestStart[0] = 0
  const frames = []
  frames.push({ pythonLine: lineOf(PY_LINES, 'best = [None]'), phase: 'start', activeLine: L('keep the prefix sums'), index: 0, removed: new Array(n).fill(false), residue: 0, removedSum: 0, message: 'The empty prefix has residue 0. Nothing is removed yet.' })
  for (let i = 1; i <= n; i++) {
    const p = prefix[i - 1] + nums[i - 1]
    prefix.push(p)
    const r = p % k
    const skip = dp[i - 1]
    const take = removedBest[r] === null ? -Infinity : removedBest[r] + p
    const useTake = take > skip
    dp.push(useTake ? take : skip)
    choice.push(useTake ? bestStart[r] : null)
    const candidate = dp[i] - p
    if (removedBest[r] === null || candidate > removedBest[r]) { removedBest[r] = candidate; bestStart[r] = i }
    frames.push({ pythonLine: lineOf(PY_LINES, 'if best[r] is None'), phase: 'prefix', activeLine: L('for each element'), index: i - 1, residue: r, removed: null,
      removedSum: dp[i], useTake, startIndex: useTake ? bestStart[r] : null,
      message: `Prefix ${i} has residue ${r}. ${useTake ? `Deleting nums[${bestStart[r]}..${i - 1}] (sum ${p - prefix[bestStart[r]]}, divisible by ${k}) is better.` : 'Keeping this element is better.'}` })
  }
  // Recover the removed positions by walking the recorded choices backwards.
  const removedFlags = new Array(n).fill(false)
  let at = n
  while (at > 0) {
    if (choice[at] !== null) {
      for (let t = choice[at]; t < at; t++) removedFlags[t] = true
      at = choice[at]
    } else {
      at -= 1
    }
  }
  const removedSum = dp[n]
  const result = total - removedSum
  frames.push({ pythonLine: lineOf(PY_LINES, 'return total'), phase: 'done', activeLine: L('return the minimum'), index: -1, residue: null, removed: removedFlags, removedSum, result,
    message: `Remove a total of ${removedSum}; the remaining sum is ${result}.` })
  return { input: { nums, k }, result, frames }
}

export const code = `minimum sum after deleting divisible blocks
  keep the prefix sums and the best removed total for each residue
  for each element extend the prefix sum
    either keep this element or delete a block that ends here
    a block from start j to here is allowed when the two prefix sums share a residue
  trace the chosen blocks back and return the minimum remaining sum`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_sum_after_deletions(nums, k):
    total = sum(nums)
    best = [None] * k
    best[0] = 0
    removed = 0
    prefix = 0
    for x in nums:
        prefix += x
        r = prefix % k
        keep = removed
        take = best[r] + prefix if best[r] is not None else None
        removed = max(keep, take) if take is not None else keep
        if best[r] is None or removed - prefix > best[r]:
            best[r] = removed - prefix
    return total - removed`
const PY_LINES = python.split('\n')
