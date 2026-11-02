// LeetCode 2863: Maximum Length of Semi-Decreasing Subarrays.
// A subarray counts when it has length at least 2 and its first value is strictly greater than its last.
// For each left index l, scan right ends from the far end inward; the first r with nums[l] > nums[r]
// is the longest valid subarray starting at l, so the inner scan stops there.
// The draft gives no verified bound on the array length, so the visualization caps it at 20 values.

const MAX_VISUAL_LENGTH = 20

const PYTHON_SOURCE = `def max_semi_decreasing(nums):
    n = len(nums)
    best = 0
    for l in range(n - 1):
        for r in range(n - 1, l, -1):
            if nums[l] > nums[r]:
                best = max(best, r - l + 1)
                break
    return best

if __name__ == "__main__":
    import sys, json
    print(max_semi_decreasing(json.loads(sys.stdin.read())))
`

export const code = `maximum length of a semi-decreasing subarray
  n ← length of nums; best ← 0
  FOR each left index l from 0 to n - 2
    FOR each right index r from n - 1 down to l + 1
      IF nums[l] > nums[r] THEN
        best ← max(best, r - l + 1)
        BREAK out of the r loop
  RETURN best`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}
const PY = PYTHON_SOURCE.split('\n')
const P = s => {
  const index = PY.findIndex(text => text.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export const python = PYTHON_SOURCE

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || !nums.every(Number.isInteger)) throw new Error('Use a JSON array of integers, e.g. [2,4,1,3].')
  return { nums }
}

export function buildTrace({ nums }) {
  if (nums.length > MAX_VISUAL_LENGTH) throw new Error(`The visualization caps the array at ${MAX_VISUAL_LENGTH} values.`)
  const n = nums.length
  const frames = []
  let best = 0
  let bestSpan = null

  frames.push({ phase: 'setup', pythonLine: P('n = len(nums)'), activeLine: L('n ← length of nums'), l: null, r: null, compare: null,
    best, bestSpan, found: null, message: `Read ${n} values. The best length starts at 0.` })

  for (let l = 0; l <= n - 2; l += 1) {
    frames.push({ phase: 'left', pythonLine: P('for l in range(n - 1)'), activeLine: L('FOR each left index'), l, r: null, compare: null,
      best, bestSpan, found: null, message: `Left end ${l} holds ${nums[l]}. Look for the farthest right end that is smaller.` })
    let hit = false
    for (let r = n - 1; r > l; r -= 1) {
      const smaller = nums[l] > nums[r]
      frames.push({ phase: 'scan', pythonLine: P('for r in range(n - 1, l, -1)'), activeLine: L('FOR each right index'), l, r, compare: smaller,
        best, bestSpan, found: null,
        message: `Compare ${nums[l]} with ${nums[r]} at right end ${r}: ${smaller ? 'strictly greater, so a valid subarray' : 'not greater, keep scanning inward'}.` })
      if (smaller) {
        hit = true
        const length = r - l + 1
        if (length > best) {
          best = length
          bestSpan = [l, r]
        }
        frames.push({ phase: 'record', pythonLine: P('best = max(best, r - l + 1)'), activeLine: L('best ← max(best, r - l + 1)'), l, r, compare: true,
          best, bestSpan, found: length, message: `Subarray [${l}..${r}] has length ${length}. Best is now ${best}. Stop scanning this left end.` })
        frames.push({ phase: 'record', pythonLine: P('break'), activeLine: L('BREAK out of the r loop'), l, r, compare: true,
          best, bestSpan, found: length, message: `No farther right end can beat length ${length} from left end ${l}.` })
        break
      }
    }
    if (!hit) {
      frames.push({ phase: 'left', pythonLine: P('for l in range(n - 1)'), activeLine: L('FOR each left index'), l, r: null, compare: false,
        best, bestSpan, found: null, message: `No smaller value to the right of index ${l}.` })
    }
  }
  frames.push({ phase: 'done', pythonLine: P('return best'), activeLine: L('RETURN best'), l: null, r: null, compare: null,
    best, bestSpan, found: null, message: best ? `Longest semi-decreasing subarray has length ${best}.` : 'No subarray of length 2 or more starts above its end, so the answer is 0.' })
  return { input: { nums }, nums, answer: best, frames }
}

export const pythonLineMap = {}
export const phases = [
  { id: 'setup', label: 'Read array', description: 'Measure the array; the best length starts at 0.' },
  { id: 'left', label: 'Pick left', description: 'Choose a left end and look for a smaller value to its right.' },
  { id: 'scan', label: 'Scan right', description: 'Walk right ends from the far end inward.' },
  { id: 'record', label: 'Record best', description: 'The first smaller right end is the longest for this left end.' },
  { id: 'done', label: 'Answer', description: 'Report the longest semi-decreasing subarray length.' },
]
