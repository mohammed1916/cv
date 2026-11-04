const MOD = 1000000007

export const phases = [
  { id: 'setup', label: 'Set up', description: 'Start with an empty list of subarray sums.' },
  { id: 'generate', label: 'Generate sums', description: 'Fix a start index and extend the end index one value at a time, keeping a running sum.' },
  { id: 'sort', label: 'Sort sums', description: 'Arrange every subarray sum in ascending order.' },
  { id: 'pick', label: 'Add the range', description: 'Add the sums whose ranks fall between left and right, inclusive.' },
  { id: 'done', label: 'Complete', description: 'Return the total modulo 1000000007.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"nums": [1, 2, 3], "left": 1, "right": 3}.')
  const { nums, left, right } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('nums is a list of 1 to 10 integers from 1 to 100.')
  const total = nums.length * (nums.length + 1) / 2
  if (!Number.isInteger(left) || !Number.isInteger(right) || left < 1 || right < left || right > total) throw new Error(`left and right must be integers with 1 <= left <= right <= ${total}.`)
  return { nums, left, right }
}

export const code = [
  "function rangeSumSortedSubarraySums(nums, left, right) {",
  "  const sums = []",
  "  for (let s = 0; s < nums.length; s++) {",
  "    let running = 0",
  "    for (let e = s; e < nums.length; e++) {",
  "      running += nums[e]",
  "      sums.push(running) }",
  "  }",
  "  sums.sort((a, b) => a - b)",
  "  let total = 0",
  "  for (let position = left; position <= right; position++) {",
  "    total = (total + sums[position - 1]) % 1000000007 }",
  "  return total }",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def range_sum_of_sorted_subarray_sums(nums, left, right):
    MOD = 1_000_000_007
    sums = []
    for start in range(len(nums)):
        running = 0
        for end in range(start, len(nums)):
            running += nums[end]
            sums.append(running)
    sums.sort()
    total = 0
    for rank in range(left - 1, right):
        total += sums[rank]
    return total % MOD
`

const SPOT = {
  setup: ['const sums = []', 'sums = []'],
  gen: ['running += nums[e]', 'running += nums[end]'],
  sort: ['sums.sort((a, b) => a - b)', 'sums.sort()'],
  pick: ['total = (total + sums[position - 1])', 'total += sums[rank]'],
  done: ['return total }', 'return total % MOD'],
}
function where(key) {
  const [pseudo, py] = SPOT[key]
  return {
    activeLine: code.findIndex(c => c.text.includes(pseudo)) + 1,
    pythonLine: python.split('\n').findIndex(l => l.includes(py)) + 1,
  }
}

export function buildTrace({ nums, left, right }) {
  const n = nums.length
  const sums = []
  const frames = []
  const emit = (phase, key, message, snapshot) => frames.push({ phase, ...where(key), message, snapshot })

  emit('setup', 'setup', `There are ${n} values. Every contiguous subarray has a sum; we need the ones ranked ${left} to ${right}.`, { sums: [], start: null, end: null })
  for (let start = 0; start < n; start++) {
    let running = 0
    for (let end = start; end < n; end++) {
      running += nums[end]
      sums.push(running)
      emit('generate', 'gen', `Subarray from position ${start + 1} to ${end + 1} sums to ${running}. ${sums.length} sums so far.`, { sums: [...sums], start, end, running })
    }
  }
  const sorted = [...sums].sort((a, b) => a - b)
  emit('sort', 'sort', `All ${sorted.length} sums are sorted. Ranks are 1-based, so rank ${left} is the first one we keep.`, { sums: sorted, start: null, end: null })
  let total = 0
  for (let position = left; position <= right; position++) {
    total += sorted[position - 1]
    emit('pick', 'pick', `Rank ${position} is ${sorted[position - 1]}. Running total ${total}.`, { sums: sorted, rank: position, total })
  }
  const result = total % MOD
  emit('done', 'done', `Sum of ranks ${left} to ${right} is ${total}${total >= MOD ? `, which is ${result} modulo 1000000007` : ''}.`, { sums: sorted, total, result })
  return { input: { nums, left, right }, result, frames }
}
