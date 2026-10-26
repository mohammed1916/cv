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

export const code = `def findClosestElements(arr, k, x):
    lo, hi = 0, len(arr) - k
    while lo < hi:
        mid = (lo + hi) // 2
        if x - arr[mid] > arr[mid + k] - x: lo = mid + 1
        else: hi = mid
    return arr[lo:lo + k]`.split('\n').map((text, index) => ({ line: index + 1, text }))
