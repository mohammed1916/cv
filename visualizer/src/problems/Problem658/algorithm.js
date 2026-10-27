export function parseInput(text) {
  const data = JSON.parse(text)
  const { arr, k, x } = data ?? {}
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 10000 || arr.some((v, i) => !Number.isInteger(v) || Math.abs(v) > 10000 || (i && v < arr[i - 1]))) throw new Error('arr must be a sorted array of 1–10,000 integers with |v| ≤ 10,000.')
  if (!Number.isInteger(k) || k < 1 || k > arr.length) throw new Error('k must be an integer from 1 to the length of arr.')
  if (!Number.isInteger(x) || Math.abs(x) > 10000) throw new Error('x must be an integer with |x| ≤ 10,000.')
  return { arr, k, x }
}

// Binary search for the left end of the window of size k: compare arr[mid] with arr[mid + k] against x.
export function buildTrace({ arr, k, x }) {
  let lo = 0, hi = arr.length - k
  const frames = [{ phase: 'start', lo, hi, left: null, mid: null, activeLine: 2, message: `Search the left end of a window of ${k} in [0, ${hi}].` }]
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    // Signed comparison: a window whose right end is closer to x (or equally close) on the right side moves right.
    const farther = x - arr[mid] > arr[mid + k] - x
    frames.push({ phase: 'compare', lo, hi, mid, farther, left: null, activeLine: 6, message: `mid ${mid}: x − ${arr[mid]} = ${x - arr[mid]} ${farther ? '>' : '≤'} ${arr[mid + k]} − x = ${arr[mid + k] - x}, so the window ${farther ? 'starts after' : 'can start at or before'} mid.` })
    if (farther) lo = mid + 1
    else hi = mid
  }
  const result = arr.slice(lo, lo + k)
  frames.push({ phase: 'done', lo, hi, left: lo, mid: null, result, activeLine: 9, message: `Window starts at ${lo}: [${result.join(', ')}].` })
  return { input: { arr, k, x }, result, frames }
}

export const code = `set left to 0 and right to the last index
while right - left + 1 is greater than k:
  compare the distance of arr[left] from x with that of arr[right]
  if the left value is farther, move left up by one
  otherwise move right down by one, so ties discard the larger value
return arr[left] through arr[right]`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Scan trace: activeLine 1 (setup), 3 (compare per discard), 4 (update, final window), 5 (return).
// The compare frame names the discarded side, so the discard branch selects line 4 or 5.
export const LINE_MAP = { 1: 1, 4: 6, 5: 6 }

export function familyLine(frame) {
  if (frame.phase === 'inspect' && frame.activeLine === 3) return /Discard left\./.test(frame.message) ? 4 : 5
  return LINE_MAP[frame.activeLine] ?? frame.activeLine
}

export const python = `def find_closest_elements(arr, k, x):
    left = 0
    right = len(arr) - 1
    while right - left + 1 > k:
        if abs(arr[left] - x) > abs(arr[right] - x):
            left += 1
        else:
            right -= 1
    return arr[left:right + 1]`
