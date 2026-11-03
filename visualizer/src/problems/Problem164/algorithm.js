export const phases = [
  { id: 'range', label: 'Find range', description: 'Find the smallest and largest value. The gap sizes come from their spread.' },
  { id: 'buckets', label: 'Make buckets', description: 'Split the range into equal-width buckets. Each bucket keeps only its smallest and largest value.' },
  { id: 'fill', label: 'Place values', description: 'Put each value into its bucket. The largest gap can never lie inside one bucket.' },
  { id: 'scan', label: 'Scan gaps', description: 'Compare each non-empty bucket minimum with the previous non-empty bucket maximum.' },
  { id: 'done', label: 'Widest gap', description: 'The answer is the widest gap between buckets.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 16) throw new Error('Enter a JSON array of 2–16 non-negative integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 1000)) throw new Error('Each value must be an integer from 0 to 1000.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const n = nums.length
  const lo = Math.min(...nums), hi = Math.max(...nums)
  const size = Math.max(1, Math.ceil((hi - lo) / (n - 1)))
  const count = Math.floor((hi - lo) / size) + 1
  const buckets = Array.from({ length: count }, () => null)
  const snap = extra => ({ nums: [...nums], lo, hi, size, buckets: buckets.map(b => (b ? { min: b.min, max: b.max } : null)), ...extra })

  frames.push({ phase: 'range', activeLine: 3, message: `Smallest ${lo}, largest ${hi}. ${n} values share this range.`, snapshot: snap({ current: null, best: 0 }) })
  frames.push({ phase: 'buckets', activeLine: 4, message: `Bucket width ${size}, giving ${count} buckets. Any two values in one bucket differ by less than ${size}, so at most ${count - 1} gaps can be the largest.`, snapshot: snap({ current: null, best: 0 }) })

  for (const v of nums) {
    const idx = Math.floor((v - lo) / size)
    const b = buckets[idx] ?? (buckets[idx] = { min: v, max: v })
    b.min = Math.min(b.min, v)
    b.max = Math.max(b.max, v)
    frames.push({ phase: 'fill', activeLine: 7, message: `${v} goes to bucket ${idx}. The bucket now spans ${b.min} to ${b.max}.`, snapshot: snap({ current: idx, best: 0 }) })
  }

  let best = 0, prevMax = null
  buckets.forEach((b, idx) => {
    if (!b) return
    if (prevMax !== null) {
      const gap = b.min - prevMax
      best = Math.max(best, gap)
      frames.push({ phase: 'scan', activeLine: 11, message: `Bucket ${idx} starts at ${b.min}, which is ${gap} above the previous bucket's top ${prevMax}. Widest gap so far: ${best}.`, snapshot: snap({ current: idx, best }) })
    }
    prevMax = b.max
  })
  frames.push({ phase: 'done', activeLine: 13, message: `Return ${best}: the widest gap between neighbouring values in sorted order.`, snapshot: snap({ current: null, best }) })
  return { input: nums, result: best, frames }
}

const LINES = [
  'def maximum_gap(nums):',
  '    if len(nums) < 2: return 0',
  '    lo, hi = min(nums), max(nums)',
  '    size = max(1, ceil((hi - lo) / (len(nums) - 1)))',
  '    buckets = [None] * ((hi - lo) // size + 1)',
  '    for v in nums:',
  '        idx = (v - lo) // size',
  '        buckets[idx] = widen(buckets[idx], v)   # keep min and max',
  '    best, prev_max = 0, None',
  '    for b in buckets:',
  '        if b is None: continue',
  '        if prev_max is not None: best = max(best, b.min - prev_max)',
  '        prev_max = b.max',
  '    return best',
]
export const code = LINES.map((text, index) => ({ line: index + 1, text }))
export const python = LINES.join('\n')
export const pythonLineMap = Object.fromEntries(LINES.map((_, i) => [i + 1, i + 1]))
