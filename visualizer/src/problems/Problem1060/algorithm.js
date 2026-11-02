const CODE_TEXT = `kth missing element in a sorted array
  set lo to 0 and hi to the length of nums
  while lo is less than hi
    set mid to the middle index between lo and hi
    count missing(mid) as nums[mid] minus nums[0] minus mid
    if missing(mid) is at least k then hi = mid
    otherwise lo = mid plus 1
  set prev to lo minus 1
  return nums[prev] plus k minus missing(prev)`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def missing_element(nums, k):
    def missing_upto(i):
        return nums[i] - nums[0] - i

    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if missing_upto(mid) >= k:
            hi = mid
        else:
            lo = mid + 1
    prev = lo - 1
    return nums[prev] + k - missing_upto(prev)


if __name__ == "__main__":
    print(missing_element([4, 7, 9, 10], 1))
`

const PY_LINES = python.split('\n')
const L = text => {
  const index = code.findIndex(item => item.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY_LINES.findIndex(item => item.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

const MAX_LENGTH = 10
const MAX_VALUE = 100
const MAX_K = 50

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH) throw new Error(`Use 1 to ${MAX_LENGTH} numbers.`)
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= MAX_VALUE)) throw new Error(`Each number is an integer from 0 to ${MAX_VALUE}.`)
  if (nums.some((v, i) => i > 0 && v <= nums[i - 1])) throw new Error('nums is strictly increasing.')
  if (!Number.isInteger(k) || k < 1 || k > MAX_K) throw new Error(`k is an integer from 1 to ${MAX_K}.`)
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  const missingUpto = i => nums[i] - nums[0] - i
  const probes = []
  let lo = 0
  let hi = nums.length
  const state = (extra = {}) => ({ nums, k, lo, hi, mid: -1, probes: probes.slice(), prev: -1, result: null, ...extra })
  const add = (phase, line, py, message, extra) => frames.push({ phase, activeLine: L(line), pythonLine: P(py), message, ...state(extra) })
  add('start', 'set lo to 0', 'lo, hi = 0, len(nums)', `Search the first index whose missing count reaches ${k}; ${nums.length} indices to consider.`, {})
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    const missing = missingUpto(mid)
    probes.push({ index: mid, missing })
    add('probe', 'set mid to the middle index', 'mid = (lo + hi) // 2', `Probe index ${mid} (value ${nums[mid]}): ${missing} missing before it.`, { mid, missing })
    if (missing >= k) {
      hi = mid
      add('left', 'if missing(mid) is at least k then hi = mid', 'hi = mid', `${missing} >= ${k}: the answer is at or before index ${mid}.`, { mid, missing })
    } else {
      lo = mid + 1
      add('right', 'otherwise lo = mid plus 1', 'lo = mid + 1', `${missing} < ${k}: the answer is after index ${mid}.`, { mid, missing })
    }
  }
  const prev = lo - 1
  const result = nums[prev] + k - missingUpto(prev)
  add('answer', 'set prev to lo minus 1', 'prev = lo - 1', `Index ${prev} (value ${nums[prev]}) is the last index with fewer than ${k} missing numbers.`, { prev, lo, hi, mid: -1 })
  add('done', 'return nums[prev] plus k minus missing(prev)', 'return nums[prev] + k - missing_upto(prev)', `Value ${nums[prev]} + ${k} - ${missingUpto(prev)} = ${result}.`, { prev, lo, hi, mid: -1, result })
  return { input: { nums, k }, result, frames }
}
