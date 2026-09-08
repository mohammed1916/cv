export function parseInput(text, maxLength = 100000) {
  const data = JSON.parse(text), nums = data?.nums, k = data?.k
  if (!Array.isArray(nums) || !nums.length || nums.length > maxLength || nums.some(v => !Number.isInteger(v) || v < 0 || v > 1000000000)
    || !Number.isInteger(k) || k < 0 || k > 1000000000) {
    throw new Error(`Enter {"nums":[...],"k":0}: 1–${maxLength} integers; each value and k must be between 0 and 1,000,000,000.`)
  }
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const n = nums.length, suffix = new Array(n), minimumIndex = new Array(n)
  const prefix = new Array(n).fill(null), scores = new Array(n).fill(null)
  const frames = [{ phase: 'start', index: -1, checked: -1, activeLine: 2, message: 'Both ranges include the current index. Build suffix minima, then test indices from left to right.' }]
  let minimum = Infinity, minIndex = -1
  for (let i = n - 1; i >= 0; i--) {
    if (nums[i] <= minimum) { minimum = nums[i]; minIndex = i }
    suffix[i] = minimum
    minimumIndex[i] = minIndex
    frames.push({ phase: 'suffix', index: i, checked: -1, minIndex, activeLine: 5,
      message: `Suffix [${i}..${n - 1}] has minimum ${minimum} at index ${minIndex}.` })
  }
  let maximum = -Infinity, maxIndex = -1, result = -1, checked = -1
  for (let i = 0; i < n; i++) {
    if (nums[i] > maximum) { maximum = nums[i]; maxIndex = i }
    prefix[i] = maximum
    scores[i] = maximum - suffix[i]
    checked = i
    frames.push({ phase: 'check', index: i, checked, minIndex: minimumIndex[i], maxIndex, score: scores[i], activeLine: 9,
      message: `Index ${i}: prefix maximum ${maximum} − suffix minimum ${suffix[i]} = ${scores[i]} ${scores[i] <= k ? '≤' : '>'} k=${k}.` })
    if (scores[i] <= k) { result = i; break }
  }
  frames.push({ phase: 'done', index: result, checked, activeLine: result < 0 ? 11 : 10,
    message: result < 0 ? 'Every index failed the threshold. Return −1.' : `Return ${result}: all earlier indices failed. Later indices need not be tested.` })
  return { input: [...nums], k, suffix, minimumIndex, prefix, scores, result, frames }
}

export const code = `def smallestStableIndex(nums, k):
    suffix = [0] * len(nums)
    minimum = float('inf')
    for i in range(len(nums) - 1, -1, -1):
        minimum = suffix[i] = min(minimum, nums[i])
    maximum = float('-inf')
    for i, value in enumerate(nums):
        maximum = max(maximum, value)
        if maximum - suffix[i] <= k:
            return i
    return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))

export function valueAtStep(run, step, index, field) {
  if (field === 'suffix') return step.phase === 'start' || step.phase === 'suffix' && index < step.index ? '?' : run.suffix[index]
  return index <= step.checked ? run[field][index] : '?'
}
