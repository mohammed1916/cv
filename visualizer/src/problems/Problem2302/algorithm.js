export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 values.')
  if (!nums.every(x => Number.isInteger(x) && x >= 1 && x <= 20)) throw new Error('Each value is an integer from 1 to 20.')
  if (!Number.isInteger(k) || k < 1 || k > 500) throw new Error('k is an integer from 1 to 500.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  let l = 0
  let total = 0
  let count = 0
  for (let r = 0; r < nums.length; r++) {
    total += nums[r]
    frames.push({ phase: 'grow', activeLine: CL('total += nums[r]'), pythonLine: PL('total += nums[r]'), l, r, total, count, message: `Add ${nums[r]} at r = ${r}. The window ${l}..${r} has sum ${total} and length ${r - l + 1}, score ${total * (r - l + 1)}.`, shrink: false })
    while (l <= r && total * (r - l + 1) >= k) {
      total -= nums[l]
      frames.push({ phase: 'shrink', activeLine: CL('total -= nums[l]'), pythonLine: PL('total -= nums[l]'), l, r, total, count, message: `Score ${total + nums[l]} * ${r - l + 1} is not below ${k}, so drop ${nums[l]} from the left: l moves to ${l + 1}.`, shrink: true })
      l++
    }
    count += r - l + 1
    frames.push({ phase: 'count', activeLine: CL('count += r - l + 1'), pythonLine: PL('count += r - l + 1'), l, r, total, count, message: `${r - l + 1} subarray${r - l + 1 === 1 ? '' : 's'} ending at ${r} score below ${k}. Total so far: ${count}.`, shrink: false })
  }
  frames.push({ phase: 'done', activeLine: CL('return count'), pythonLine: PL('return count'), l: -1, r: -1, total: 0, count, message: `${count} non-empty subarrays score below ${k}.`, shrink: false })
  return { input: { nums, k }, result: count, frames }
}

export const code = `function countLowScoreSubarrays(nums, k) {
  let l = 0;
  let total = 0;
  let count = 0;
  for (let r = 0; r < nums.length; r++) {
    total += nums[r];
    while (l <= r && total * (r - l + 1) >= k) {
      total -= nums[l];
      l++;
    }
    count += r - l + 1;
  }
  return count;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def count_low_score_subarrays(nums, k):
    l = 0
    total = 0
    count = 0
    for r in range(len(nums)):
        total += nums[r]
        while l <= r and total * (r - l + 1) >= k:
            total -= nums[l]
            l += 1
        count += r - l + 1
    return count
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
