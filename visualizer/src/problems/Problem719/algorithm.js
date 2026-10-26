export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 200 || nums.some(v => !Number.isInteger(v) || v < 0 || v > 1000)) throw new Error('nums must be 2–200 integers from 0 to 1,000.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length * (nums.length - 1) / 2) throw new Error('k must be from 1 to the number of pairs.')
  return { nums, k }
}

// Binary search on the distance d: count pairs with |a − b| ≤ d using two pointers over the sorted array.
export function buildTrace({ nums, k }) {
  const a = [...nums].sort((x, y) => x - y)
  const countUpTo = d => {
    let count = 0, lo = 0
    for (let hi = 0; hi < a.length; hi++) {
      while (a[hi] - a[lo] > d) lo++
      count += hi - lo
    }
    return count
  }
  let lo = 0, hi = a[a.length - 1] - a[0]
  const frames = [{ phase: 'start', lo, hi, mid: null, count: null, activeLine: 2, message: `Search distances in [0, ${hi}] for the ${k}th smallest pair distance.` }]
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    const count = countUpTo(mid)
    frames.push({ phase: 'count', lo, hi, mid, count, activeLine: 7, message: `mid ${mid}: ${count} pair${count === 1 ? '' : 's'} within distance ${mid}; ${count >= k ? 'enough, search lower' : 'too few, search higher'}.` })
    if (count >= k) hi = mid
    else lo = mid + 1
  }
  frames.push({ phase: 'done', lo, hi, mid: null, count: null, result: lo, activeLine: 9, message: `The ${k}th smallest distance is ${lo}.` })
  return { input: { nums, k }, result: lo, frames }
}

export const code = `def smallestDistancePair(nums, k):
    a = sorted(nums)
    lo, hi = 0, a[-1] - a[0]
    while lo < hi:
        mid = (lo + hi) // 2
        count, left = 0, 0
        for right in range(len(a)):
            while a[right] - a[left] > mid: left += 1
            count += right - left
        if count >= k: hi = mid
        else: lo = mid + 1
    return lo`.split('\n').map((text, index) => ({ line: index + 1, text }))
