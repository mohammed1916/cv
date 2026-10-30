const CODE = [
  "FUNCTION minimumSum(nums)",
  "    n ← length of nums",
  "    suffixMin ← smallest value at or after each index",
  "    leftMin ← infinity",
  "    best ← infinity",
  "    FOR each index j from 0 to n - 1",
  "        IF leftMin < nums[j] AND suffixMin[j + 1] < nums[j]",
  "            best ← min(best, leftMin + nums[j] + suffixMin[j + 1])",
  "        leftMin ← min(leftMin, nums[j])",
  "    RETURN best, or -1 if no triplet exists",
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = `def minimumSum(nums):
    n = len(nums)
    suffix = [float('inf')] * (n + 1)
    for k in range(n - 1, -1, -1):
        suffix[k] = min(nums[k], suffix[k + 1])
    left = float('inf')
    best = float('inf')
    for j in range(n):
        if left < nums[j] and suffix[j + 1] < nums[j]:
            best = min(best, left + nums[j] + suffix[j + 1])
        left = min(left, nums[j])
    return -1 if best == float('inf') else best
`

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Input must be a JSON object such as {"nums": [8,6,1,5,3]}') }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object with key nums')
  const { nums } = data
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 50) throw new Error('nums must be an array of 3 to 50 integers for the visualization')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100000000)) throw new Error('each nums value must be an integer from 1 to 100000000')
  return { nums }
}

const show = v => (v === Infinity ? '∞' : String(v))

export function buildTrace({ nums }) {
  const n = nums.length
  const frames = []
  const suffix = Array(n + 1).fill(Infinity)
  let left = Infinity
  let best = Infinity
  const emit = (phase, activeLine, pythonLine, message, active = -1, marks = {}) => frames.push({
    phase, activeLine, pythonLine, message, values: nums, active, marks,
    summary: `leftMin ${show(left)} · best ${show(best)}`,
    suffixMin: suffix.map(v => (v === Infinity ? null : v)),
  })
  emit('setup', 2, 2, `n = ${n}`)
  for (let k = n - 1; k >= 0; k--) {
    suffix[k] = Math.min(nums[k], suffix[k + 1])
    emit('suffix', 3, 5, `suffixMin[${k}] = ${suffix[k]}`, k, { [k]: 'suffix' })
  }
  emit('scan', 4, 6, 'leftMin starts at infinity')
  emit('scan', 5, 7, 'best starts at infinity')
  for (let j = 0; j < n; j++) {
    emit('scan', 6, 8, `index ${j} is the candidate peak (value ${nums[j]})`, j, { [j]: 'peak' })
    const ok = left < nums[j] && suffix[j + 1] < nums[j]
    emit('scan', 7, 9, ok ? `left ${left} and right ${suffix[j + 1]} are both smaller than the peak` : `no valid triplet with peak ${nums[j]}`, j, { [j]: 'peak' })
    if (ok) {
      best = Math.min(best, left + nums[j] + suffix[j + 1])
      emit('record', 8, 10, `best becomes ${best}`, j, { [j]: 'peak' })
    }
    left = Math.min(left, nums[j])
    emit('scan', 9, 11, `leftMin becomes ${show(left)}`, j, { [j]: 'peak' })
  }
  const result = best === Infinity ? -1 : best
  emit('result', 10, 12, `return ${result}`)
  return { input: { nums }, result, frames }
}
