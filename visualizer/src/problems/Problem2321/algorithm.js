export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums1 and nums2.')
  const { nums1, nums2 } = input
  if (!Array.isArray(nums1) || !Array.isArray(nums2) || nums1.length < 1 || nums1.length > 16 || nums1.length !== nums2.length) throw new Error('nums1 and nums2 have the same length, from 1 to 16.')
  if (![...nums1, ...nums2].every(x => Number.isInteger(x) && x >= 1 && x <= 100)) throw new Error('Each value is an integer from 1 to 100.')
  return { nums1, nums2 }
}

// Best swap gain for one direction: the largest sum of a subarray of (into - from), or 0 for no swap.
function bestGain(from, into, frames, label, pyFirst, pyLoop) {
  let cur = 0
  let best = 0
  let start = 0
  let bestL = -1
  let bestR = -1
  for (let i = 0; i < from.length; i++) {
    const delta = into[i] - from[i]
    if (cur + delta <= 0) {
      cur = 0
      start = i + 1
    } else {
      cur += delta
    }
    if (cur > best) { best = cur; bestL = start; bestR = i }
    frames.push({ phase: label, activeLine: CL('let cur ='), pythonLine: pyLoop, at: i, l: cur > 0 ? start : -1, r: i, gain: best, bestL, bestR, cur, message: `Swap in ${into[i]} for ${from[i]} at ${i}: the running gain is ${cur}; best gain so far ${best}.`, direction: label })
  }
  return { best, bestL, bestR }
}

export function buildTrace({ nums1, nums2 }) {
  const frames = []
  const total1 = nums1.reduce((a, b) => a + b, 0)
  const total2 = nums2.reduce((a, b) => a + b, 0)
  frames.push({ phase: 'totals', activeLine: CL('const total1'), pythonLine: PL('total1 = sum'), at: -1, l: -1, r: -1, gain: 0, bestL: -1, bestR: -1, cur: 0, direction: 'totals', message: `Totals: nums1 ${total1}, nums2 ${total2}.`, total1, total2 })
  const first = bestGain(nums1, nums2, frames, 'first', PL('total1 = sum'), PL('best1 = cur'))
  const second = bestGain(nums2, nums1, frames, 'second', PL('total2 = sum'), PL('best2 = cur'))
  const result = Math.max(total1 + first.best, total2 + second.best)
  frames.push({ phase: 'done', activeLine: CL('return Math.max'), pythonLine: PL('return max'), at: -1, l: -1, r: -1, gain: 0, bestL: -1, bestR: -1, cur: 0, direction: 'done', message: `Best score ${result}: ${result === total1 + first.best ? 'swap a subarray into nums1' : 'swap a subarray into nums2'}${result === total1 + first.best ? ` (gain ${first.best})` : ` (gain ${second.best})`}, or no swap when the gain is 0.`, total1, total2 })
  return { input: { nums1, nums2 }, result, frames }
}

export const code = `function maximumsSplicedArray(nums1, nums2) {
  const total1 = nums1.reduce((a, b) => a + b, 0);
  const total2 = nums2.reduce((a, b) => a + b, 0);
  let best1 = 0;
  let cur = 0;
  for (let i = 0; i < nums1.length; i++) {
    cur = Math.max(0, cur + nums2[i] - nums1[i]);
    best1 = Math.max(best1, cur);
  }
  let best2 = 0;
  cur = 0;
  for (let i = 0; i < nums1.length; i++) {
    cur = Math.max(0, cur + nums1[i] - nums2[i]);
    best2 = Math.max(best2, cur);
  }
  return Math.max(total1 + best1, total2 + best2);
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def maximums_spliced_array(nums1, nums2):
    total1 = sum(nums1)
    total2 = sum(nums2)
    best1 = cur = 0
    for a, b in zip(nums1, nums2):
        cur = max(0, cur + b - a)
        best1 = max(best1, cur)
    best2 = cur = 0
    for a, b in zip(nums1, nums2):
        cur = max(0, cur + a - b)
        best2 = max(best2, cur)
    return max(total1 + best1, total2 + best2)
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
