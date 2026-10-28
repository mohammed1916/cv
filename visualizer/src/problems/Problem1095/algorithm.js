export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.mountain)) throw new Error('Use an object with a "mountain" array and a "target".')
  const { mountain, target } = input
  if (mountain.length < 3 || mountain.length > 40) throw new Error('mountain holds 3 to 40 integers.')
  if (mountain.some(v => !Number.isInteger(v) || v < 0 || v > 100)) throw new Error('Each value is an integer from 0 to 100.')
  if (!Number.isInteger(target) || target < 0 || target > 100) throw new Error('target is an integer from 0 to 100.')
  let peak = 0
  while (peak + 1 < mountain.length && mountain[peak] < mountain[peak + 1]) peak++
  if (peak === 0 || peak === mountain.length - 1) throw new Error('A mountain must rise to a peak strictly inside the array.')
  for (let i = peak; i + 1 < mountain.length; i++) {
    if (mountain[i] <= mountain[i + 1]) throw new Error('A mountain must strictly decrease after its peak.')
  }
  return { mountain, target }
}

export function buildTrace(input) {
  const { mountain: arr, target } = input
  const frames = []
  let lo = 0
  let hi = arr.length - 1
  frames.push({ phase: 'start', activeLine: L('binary search for the peak index'), lo, hi, mid: -1, peak: -1, found: -1, message: `Search the whole array of length ${arr.length} for the peak.` })
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    frames.push({ phase: 'peak', activeLine: L('if the middle value is less'), lo, hi, mid, peak: -1, found: -1, message: `Middle ${mid} has value ${arr[mid]} and its right neighbor ${arr[mid + 1]}.` })
    if (arr[mid] < arr[mid + 1]) lo = mid + 1
    else hi = mid
  }
  const peak = lo
  frames.push({ phase: 'peak', activeLine: L('if the middle value is less'), lo, hi, mid: -1, peak, found: -1, message: `The peak is at index ${peak}.` })
  let found = -1
  lo = 0
  hi = peak
  while (lo <= hi && found === -1) {
    const mid = (lo + hi) >> 1
    frames.push({ phase: 'ascending', activeLine: L('binary search the ascending part'), lo, hi, mid, peak, found: -1, message: `Ascending part: compare index ${mid} (value ${arr[mid]}) with ${target}.` })
    if (arr[mid] === target) found = mid
    else if (arr[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  if (found === -1) {
    lo = peak + 1
    hi = arr.length - 1
    while (lo <= hi && found === -1) {
      const mid = (lo + hi) >> 1
      frames.push({ phase: 'descending', activeLine: L('binary search the descending part'), lo, hi, mid, peak, found: -1, message: `Descending part: compare index ${mid} (value ${arr[mid]}) with ${target}.` })
      if (arr[mid] === target) found = mid
      else if (arr[mid] > target) lo = mid + 1
      else hi = mid - 1
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the index'), lo: -1, hi: -1, mid: -1, peak, found, message: found === -1 ? `${target} is not in the mountain.` : `${target} first appears at index ${found}.` })
  return { input, result: found, frames }
}

export const code = `find the smallest index of the target in a mountain array
  binary search for the peak index
    if the middle value is less than the value after it then move the low end past the middle
    otherwise move the high end down to the middle
  binary search the ascending part for the target
  if the target was not found then binary search the descending part for it
  return the index or minus one`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_in_mountain(mountain, target):
    n = len(mountain)
    lo, hi = 0, n - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if mountain[mid] < mountain[mid + 1]:
            lo = mid + 1
        else:
            hi = mid
    peak = lo
    lo, hi = 0, peak
    while lo <= hi:
        mid = (lo + hi) // 2
        if mountain[mid] == target:
            return mid
        if mountain[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    lo, hi = peak + 1, n - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if mountain[mid] == target:
            return mid
        if mountain[mid] > target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
`
