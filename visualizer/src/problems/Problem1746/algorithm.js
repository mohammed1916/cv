// Maximum subarray sum after one operation: track the best subarray ending here with and without the squared element.
const JS_LINES = [
  { text: 'let noSquare = nums[0], withSquare = nums[0] * nums[0]', py: 'no_sq = nums[0]' },
  { text: 'let best = withSquare', py: 'best = with_sq' },
  { text: 'for (let i = 1; i < nums.length; i++) {', py: 'for x in nums[1:]' },
  { text: 'const sq = nums[i] * nums[i]', py: 'sq = x * x' },
  { text: 'withSquare = Math.max(sq, withSquare + nums[i], noSquare + sq)', py: 'with_sq = max(' },
  { text: 'noSquare = Math.max(nums[i], noSquare + nums[i])', py: 'no_sq = max(' },
  { text: 'best = Math.max(best, withSquare)', py: 'best = max(best' },
  { text: '}', py: null },
  { text: 'return best', py: 'return best' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def maxSumAfterOperation(nums):
    no_sq = nums[0]
    with_sq = nums[0] * nums[0]
    best = with_sq
    for x in nums[1:]:
        sq = x * x
        with_sq = max(sq, with_sq + x, no_sq + sq)
        no_sq = max(x, no_sq + x)
        best = max(best, with_sq)
    return best
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return best')]))

export const phases = [
  { id: 'start', label: 'Start', description: 'The first element is the only subarray so far.' },
  { id: 'extend', label: 'Extend', description: 'Each value either extends a subarray or starts a new one; the square can be used here or earlier.' },
  { id: 'record', label: 'Record', description: 'Keep the best sum that used the square.' },
  { id: 'done', label: 'Result', description: 'The best subarray sum after exactly one squaring.' },
]

export const examples = [
  { label: 'Negative to positive', input: '[3,-5,2,-1]' },
  { label: 'Small negatives', input: '[-2,4,-3,0,1]' },
]

export const complexity = 'O(n) time and O(1) extra space for n numbers.'

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('Use a JSON array of 1 to 20 integers (visual cap).')
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= 100)) throw new Error('Values are integers from -100 to 100.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  let noSq = nums[0]
  let withSq = nums[0] * nums[0]
  let best = withSq
  const rows = [{ x: nums[0], noSq, withSq }]
  const snap = extra => ({ noSq, withSq, best, ...extra })
  frames.push({ phase: 'start', activeLine: 1, index: 0, message: `Start: without the square ${noSq}, with the square ${withSq}.`, snapshot: snap({}) })
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i]
    const sq = x * x
    withSq = Math.max(sq, withSq + x, noSq + sq)
    noSq = Math.max(x, noSq + x)
    best = Math.max(best, withSq)
    rows.push({ x, noSq, withSq })
    frames.push({ phase: 'extend', activeLine: 5, index: i, message: `Value ${x}: without square ${noSq}, with square ${withSq}.`, snapshot: snap({}) })
    frames.push({ phase: 'record', activeLine: 7, index: i, message: `Best sum using the square so far: ${best}.`, snapshot: snap({}) })
  }
  frames.push({ phase: 'done', activeLine: 9, index: -1, result: best, message: `Maximum subarray sum ${best}.`, snapshot: snap({ result: best }) })
  return { input: nums, result: best, rows, frames }
}
