export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || !nums.length || nums.length > 64 || nums.some(x => !Number.isInteger(x) || x < -50000 || x > 50000)) throw new Error('Enter a JSON array of 1-64 integers between -50,000 and 50,000 (capped at 64 for visualization).')
  return [...nums]
}
const at = s => code.findIndex(c => c.text.includes(s)) + 1
export function buildTrace(input) {
  const nums = [...input]
  const frames = [{ phase: 'start', pythonLine: 28, activeLine: at('Merge sort the whole array'), nums: [...nums], lo: 0, hi: nums.length, depth: 0, message: 'Merge sort splits the array until single elements, then merges sorted halves.' }]
  function sort(lo, hi, depth) {
    if (hi - lo <= 1) return
    const mid = (lo + hi) >> 1
    frames.push({ phase: 'split', pythonLine: 6, activeLine: at('let mid be'), nums: [...nums], lo, hi, mid, depth, message: `Split [${lo}, ${hi}) at ${mid}: sort [${lo}, ${mid}) and [${mid}, ${hi}) first.` })
    sort(lo, mid, depth + 1)
    sort(mid, hi, depth + 1)
    const left = nums.slice(lo, mid), right = nums.slice(mid, hi)
    let i = 0, j = 0, k = lo
    const place = (from, v, line, msg, py) => {
      nums[k] = v
      frames.push({ phase: 'place', pythonLine: py, activeLine: line, nums: [...nums], lo, hi, mid, k, left, right, i, j, depth, message: msg })
      k++
    }
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) { place('l', left[i], at('write left[i] into nums[k] and move i forward'), `${left[i]} (left) is not larger than ${right[j]} (right): write ${left[i]} at index ${k}.`, 14); i++ }
      else { place('r', right[j], at('write right[j] into nums[k] and move j forward'), `${right[j]} (right) is smaller than ${left[i]} (left): write ${right[j]} at index ${k}.`, 17); j++ }
    }
    while (i < left.length) { place('l', left[i], at('copy leftover left items'), `Right half is exhausted: copy leftover ${left[i]} to index ${k}.`, 21); i++ }
    while (j < right.length) { place('r', right[j], at('copy leftover right items'), `Left half is exhausted: copy leftover ${right[j]} to index ${k}.`, 25); j++ }
  }
  sort(0, nums.length, 0)
  frames.push({ phase: 'done', pythonLine: 29, activeLine: at('return nums'), nums: [...nums], lo: 0, hi: nums.length, depth: 0, message: `Sorted: [${nums.join(', ')}].` })
  return { input: [...input], result: nums, frames }
}
export const code = `Merge sort the whole array by calling sort(0, length of nums)
sort(lo, hi): if hi - lo is at most 1, return, since one element is already sorted
  let mid be (lo + hi) divided by 2
  call sort(lo, mid), then call sort(mid, hi)
  copy nums[lo..mid) into left and nums[mid..hi) into right
  set i and j to 0 and k to lo
  while i < length of left and j < length of right
    if left[i] <= right[j]
      write left[i] into nums[k] and move i forward
    otherwise
      write right[j] into nums[k] and move j forward
    move k forward
  copy leftover left items: write left[i] into nums[k] and move i and k forward
  copy leftover right items: write right[j] into nums[k] and move j and k forward
return nums`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def sort_array(nums):
    nums = list(nums)
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
    return nums`
