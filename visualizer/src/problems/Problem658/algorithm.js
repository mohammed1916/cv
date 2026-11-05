export function parseInput(text) {
  const data = JSON.parse(text)
  const { arr, k, x } = data ?? {}
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 200 || arr.some(v => !Number.isInteger(v) || Math.abs(v) > 10000)) throw new Error('arr must be 1–200 integers from −10,000 to 10,000.')
  if (arr.some((v, i) => i > 0 && v < arr[i - 1])) throw new Error('arr must be sorted in ascending order.')
  if (!Number.isInteger(k) || k < 1 || k > arr.length) throw new Error('k must be an integer from 1 to the length of arr.')
  if (!Number.isInteger(x) || Math.abs(x) > 10000) throw new Error('x must be an integer from −10,000 to 10,000.')
  return { arr, k, x }
}

// The answer is a window of k consecutive values. Binary search for its left end: if the leftmost value
// of a candidate window is farther from x than the value just past its right end, move the window right.
export function buildTrace({ arr, k, x }) {
  let lo = 0
  let hi = arr.length - k
  const frames = [{ phase: 'start', lo, hi, mid: null, arr, k, x, activeLine: L('let lo = 0'), pythonLine: P('lo, hi = 0, len(arr) - k'), message: `The window's left end lies between ${lo} and ${hi}.` }]
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const moveRight = x - arr[mid] > arr[mid + k] - x
    frames.push({ phase: 'probe', lo, hi, mid, moveRight, arr, k, x, activeLine: L('const mid = '), pythonLine: P('mid = (lo + hi)'), message: `Test left end ${mid}: ${x - arr[mid]} from x on the left, ${arr[mid + k] - x} on the right. ${moveRight ? 'Move the left end right.' : 'Keep the left end here or further left.'}` })
    if (moveRight) lo = mid + 1
    else hi = mid
  }
  const result = arr.slice(lo, lo + k)
  frames.push({ phase: 'done', lo, hi: lo + k - 1, mid: null, arr, k, x, result, activeLine: L('return arr.slice'), pythonLine: P('return arr[lo:lo + k]'), message: `Window ${lo} to ${lo + k - 1}: [${result.join(', ')}].` })
  return { input: { arr, k, x }, result, frames }
}

const SOURCE = `function findClosestElements(arr, k, x) {
  let lo = 0
  let hi = arr.length - k
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (x - arr[mid] > arr[mid + k] - x) lo = mid + 1
    else hi = mid
  }
  return arr.slice(lo, lo + k)
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_closest_elements(arr, k, x):
    lo, hi = 0, len(arr) - k
    while lo < hi:
        mid = (lo + hi) // 2
        if x - arr[mid] > arr[mid + k] - x:
            lo = mid + 1
        else:
            hi = mid
    return arr[lo:lo + k]`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
