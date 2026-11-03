export const phases = [
  { id: 'start', label: 'Start', description: 'Search the whole array. Values beyond both ends count as negative infinity.' },
  { id: 'probe', label: 'Probe middle', description: 'Compare the middle value with its right neighbour to see which way is uphill.' },
  { id: 'move', label: 'Move window', description: 'Keep the half that must contain a peak.' },
  { id: 'done', label: 'Peak found', description: 'The window has one index left, and that index is a peak.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30) throw new Error('Enter a JSON array of 1 to 30 integers.')
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= 1000)) throw new Error('Each value is an integer from -1000 to 1000.')
  for (let i = 0; i + 1 < nums.length; i++) {
    if (nums[i] === nums[i + 1]) throw new Error(`Positions ${i} and ${i + 1} hold the same value. Adjacent values must differ for this visualization.`)
  }
  return nums
}

// Lines of the solver the story points at (1-based, matching `code` below).
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export function buildTrace(nums) {
  const frames = []
  const at = (pseudo, py) => ({ activeLine: L(pseudo), pythonLine: P(py) })
  let lo = 0, hi = nums.length - 1
  const snap = (mid = null, extra = {}) => ({ nums, lo, hi, mid, ...extra })

  frames.push({ phase: 'start', ...at('lo, hi = 0, n - 1', 'lo, hi = 0, len(nums) - 1'),
    message: `The window starts as all ${nums.length} positions. A peak is a value larger than its neighbours, with the outside treated as negative infinity.`,
    snapshot: snap() })

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const uphill = nums[mid] < nums[mid + 1]
    frames.push({ phase: 'probe', ...at('while lo < hi', 'while lo < hi'),
      message: `Middle ${mid} holds ${nums[mid]} and its right neighbour holds ${nums[mid + 1]}. ${uphill ? 'The values rise to the right, so a peak lies at mid + 1 or further right.' : 'The values do not rise to the right, so a peak exists at mid or to its left.'}`,
      snapshot: snap(mid) })
    if (uphill) {
      lo = mid + 1
      frames.push({ phase: 'move', ...at('lo = mid + 1', 'lo = mid + 1'), message: `Keep the right side: lo becomes ${lo}.`, snapshot: snap(mid) })
    } else {
      hi = mid
      frames.push({ phase: 'move', ...at('hi = mid', 'hi = mid'), message: `Keep the left side including mid: hi becomes ${hi}.`, snapshot: snap(mid) })
    }
  }

  frames.push({ phase: 'done', ...at('return lo', 'return lo'),
    message: `The window is down to index ${lo}, value ${nums[lo]}. It is a peak.`, snapshot: snap(lo, { peak: lo }) })
  return { input: nums, result: lo, frames }
}

export const code = `find peak (nums):
  lo, hi = 0, n - 1
  while lo < hi:
    mid = (lo + hi) // 2
    if nums[mid] < nums[mid + 1]:
      lo = mid + 1
    else:
      hi = mid
  return lo`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def find_peak(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < nums[mid + 1]:
            lo = mid + 1
        else:
            hi = mid
    return lo
`
