// Knowledge-derived model: keep the largest subset whose max and min satisfy max - min <= k * min.
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('nums has 1 to 20 values.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000)) throw new Error('Each nums value is an integer from 1 to 1000.')
  if (!Number.isInteger(k) || k < 1 || k > 20) throw new Error('k is an integer from 1 to 20.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const n = nums.length
  const sorted = [...nums].sort((a, b) => a - b)
  const frames = []
  let best = 0
  let bestStart = 0
  let bestEnd = 0
  let j = 0
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('sort the values'), i: -1, j: -1, best, message: `Sort ${n} values so every kept set is a contiguous run.` })
  for (let i = 0; i < n; i++) {
    frames.push({ pythonLine: 6, phase: 'window', activeLine: L('for each smallest kept value'), i, j, best, message: `Treat sorted[${i}] = ${sorted[i]} as the minimum.` })
    while (j < n && sorted[j] - sorted[i] <= k * sorted[i]) {
      j++
      frames.push({ pythonLine: 7, phase: 'grow', activeLine: L('while the next value fits'), i, j, best, message: `${sorted[j - 1]} fits: ${sorted[j - 1]} - ${sorted[i]} <= ${k} * ${sorted[i]}.` })
    }
    if (j - i > best) {
      best = j - i
      bestStart = i
      bestEnd = j
      frames.push({ pythonLine: 9, phase: 'record', activeLine: L('keep the longest run'), i, j, best, message: `A run of ${best} values can stay; the best so far.` })
    } else {
      frames.push({ pythonLine: 9, phase: 'record', activeLine: L('keep the longest run'), i, j, best, message: `This run of ${j - i} does not beat ${best}.` })
    }
  }
  const result = n - best
  frames.push({ pythonLine: 10, phase: 'done', activeLine: L('return the removals'), i: bestStart, j: bestEnd, best, result, message: `Remove ${result} value${result === 1 ? '' : 's'}; keep ${best}.` })
  return { input: { nums, k }, sorted, result, keep: [bestStart, bestEnd], frames }
}

export const code = `minimum removals to balance the array
  sort the values
  set j to 0 and best to 0
  for each smallest kept value i
    while j is inside the array and sorted at j minus sorted at i is at most k times sorted at i
      move j forward
    if j minus i is larger than best then record it
  return the length minus best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_removals(nums, k):
    arr = sorted(nums)
    n = len(arr)
    best = 0
    j = 0
    for i in range(n):
        while j < n and arr[j] - arr[i] <= k * arr[i]:
            j += 1
        best = max(best, j - i)
    return n - best
`
