const CODE = [
  "FUNCTION sumCounts(nums)",
  "    n ← length of nums, total ← 0",
  "    FOR each start index i from 0 to n - 1",
  "        seen ← empty set",
  "        FOR each end index j from i to n - 1",
  "            add nums[j] to seen",
  "            total ← total + (size of seen)²",
  "    RETURN total",
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = `def sumCounts(nums):
    n = len(nums)
    total = 0
    for i in range(n):
        seen = set()
        for j in range(i, n):
            seen.add(nums[j])
            total += len(seen) ** 2
    return total
`

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Input must be a JSON object such as {"nums": [1,2,1]}') }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object with key nums')
  const { nums } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 50) throw new Error('nums must be an array of 1 to 50 integers for the visualization')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('each nums value must be an integer from 1 to 100')
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const frames = []
  let total = 0
  const emit = (phase, activeLine, pythonLine, message, active = -1, marks = {}) => frames.push({
    phase, activeLine, pythonLine, message, values: nums, active, marks, summary: `total ${total}`,
  })
  emit('setup', 2, 2, `n = ${n}, total = 0`)
  for (let i = 0; i < n; i++) {
    emit('start', 3, 4, `start index ${i}`, i, { [i]: 'start' })
    const seen = new Set()
    emit('start', 4, 5, 'seen is empty')
    for (let j = i; j < n; j++) {
      seen.add(nums[j])
      const marks = {}
      for (let k = i; k <= j; k++) marks[k] = 'window'
      marks[i] = 'start'
      marks[j] = 'end'
      emit('extend', 6, 7, `add nums[${j}] = ${nums[j]}; distinct = ${seen.size}`, j, marks)
      total += seen.size ** 2
      emit('extend', 7, 8, `add ${seen.size}² to total, now ${total}`, j, marks)
    }
  }
  emit('result', 8, 9, `return ${total}`)
  return { input: { nums }, result: total, frames }
}
