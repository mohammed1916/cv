export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || !nums.length || nums.length > 64 || nums.some(x => !Number.isInteger(x) || x < -50000 || x > 50000)) throw new Error('Enter a JSON array of 1-64 integers between -50,000 and 50,000 (capped at 64 for visualization).')
  return [...nums]
}
const at = s => code.findIndex(c => c.text.includes(s)) + 1
export function buildTrace(input) {
  const nums = [...input]
  const frames = [{ phase: 'start', activeLine: at('merge_sort(0, len'), nums: [...nums], lo: 0, hi: nums.length, depth: 0, message: 'Merge sort splits the array until single elements, then merges sorted halves.' }]
  function sort(lo, hi, depth) {
    if (hi - lo <= 1) return
    const mid = (lo + hi) >> 1
    frames.push({ phase: 'split', activeLine: at('mid = '), nums: [...nums], lo, hi, mid, depth, message: `Split [${lo}, ${hi}) at ${mid}: sort [${lo}, ${mid}) and [${mid}, ${hi}) first.` })
    sort(lo, mid, depth + 1)
    sort(mid, hi, depth + 1)
    const left = nums.slice(lo, mid), right = nums.slice(mid, hi)
    let i = 0, j = 0, k = lo
    const place = (from, v, line, msg) => {
      nums[k] = v
      frames.push({ phase: 'place', activeLine: line, nums: [...nums], lo, hi, mid, k, left, right, i, j, depth, message: msg })
      k++
    }
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) { place('l', left[i], at('nums[k] = left[i]'), `${left[i]} (left) is not larger than ${right[j]} (right): write ${left[i]} at index ${k}.`); i++ }
      else { place('r', right[j], at('nums[k] = right[j]'), `${right[j]} (right) is smaller than ${left[i]} (left): write ${right[j]} at index ${k}.`); j++ }
    }
    while (i < left.length) { place('l', left[i], code.findIndex((c, idx) => c.text.includes('nums[k] = left[i]') && idx > at('while i < len')) + 1, `Right half is exhausted: copy leftover ${left[i]} to index ${k}.`); i++ }
    while (j < right.length) { place('r', right[j], code.findIndex((c, idx) => c.text.includes('nums[k] = right[j]') && idx > at('while j < len')) + 1, `Left half is exhausted: copy leftover ${right[j]} to index ${k}.`); j++ }
  }
  sort(0, nums.length, 0)
  frames.push({ phase: 'done', activeLine: at('return nums'), nums: [...nums], lo: 0, hi: nums.length, depth: 0, message: `Sorted: [${nums.join(', ')}].` })
  return { input: [...input], result: nums, frames }
}
export const code = `def sortArray(nums):
    def merge_sort(lo, hi):
        if hi - lo <= 1:
            return
        mid = (lo + hi) // 2
        merge_sort(lo, mid)
        merge_sort(mid, hi)
        left, right = nums[lo:mid], nums[mid:hi]
        i = j = 0
        k = lo
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                nums[k] = left[i]
                i += 1
            else:
                nums[k] = right[j]
                j += 1
            k += 1
        while i < len(left):
            nums[k] = left[i]
            i += 1
            k += 1
        while j < len(right):
            nums[k] = right[j]
            j += 1
            k += 1
    merge_sort(0, len(nums))
    return nums`.split('\n').map((text, index) => ({ line: index + 1, text }))
