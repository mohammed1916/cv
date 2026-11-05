export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length < 3 || arr.length > 1000 || arr.some(v => !Number.isInteger(v) || v < 0 || v > 1000000)) throw new Error('Enter 3–1,000 integers from 0 to 1,000,000.')
  let k = 1
  while (k < arr.length && arr[k] > arr[k - 1]) k++
  if (k === 1 || k === arr.length) throw new Error('The array must rise to a peak and then fall.')
  for (let i = k; i < arr.length; i++) if (arr[i] >= arr[i - 1]) throw new Error('The array must rise to a peak and then fall.')
  return arr
}

const JS_LINES = [
  'function peakIndexInMountainArray(arr) {',
  '  let lo = 0, hi = arr.length - 1 // the peak lies in [lo, hi]',
  '  while (lo < hi) {',
  '    const mid = Math.floor((lo + hi) / 2)',
  '    if (arr[mid] < arr[mid + 1]) lo = mid + 1 // still rising: the peak is to the right of mid',
  '    else hi = mid // falling or at the peak: the peak is mid or to its left',
  '  }',
  '  return lo // lo equals hi at the peak',
  '}',
]
const PY_LINES = [
  'def peak_index_in_mountain_array(arr):',
  '    lo, hi = 0, len(arr) - 1',
  '    while lo < hi:',
  '        mid = (lo + hi) // 2',
  '        if arr[mid] < arr[mid + 1]:',
  '            lo = mid + 1',
  '        else:',
  '            hi = mid',
  '    return lo',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Binary search on the slope: while the array is still rising at mid, the peak lies strictly to the right.
export function buildTrace(arr) {
  let lo = 0, hi = arr.length - 1
  const frames = [{ phase: 'start', lo, hi, mid: null, activeLine: L('let lo = 0'), pythonLine: P('lo, hi = 0'), message: `The peak lies between indices ${lo} and ${hi}.` }]
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const rising = arr[mid] < arr[mid + 1]
    if (rising) lo = mid + 1
    else hi = mid
    frames.push({ phase: rising ? 'rise' : 'fall', lo, hi, mid, activeLine: L(rising ? 'still rising' : 'falling or at the peak'), pythonLine: P(rising ? 'lo = mid + 1' : 'hi = mid'),
      message: rising ? `arr[${mid}] = ${arr[mid]} < arr[${mid + 1}] = ${arr[mid + 1]}: still climbing, so lo moves to ${lo}.` : `arr[${mid}] = ${arr[mid]} ≥ arr[${mid + 1}] = ${arr[mid + 1]}: at or past the peak, so hi moves to ${hi}.` })
  }
  frames.push({ phase: 'done', lo, hi, mid: null, result: lo, activeLine: L('return lo'), pythonLine: P('return lo'), message: `lo = hi = ${lo}: the peak value is ${arr[lo]}.` })
  return { input: arr, result: lo, frames }
}
