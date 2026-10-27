export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 1000 || nums.some(n => !Number.isInteger(n) || n < 0 || n > 1000)) throw new Error('Enter a JSON array of 1–1,000 integers from 0 to 1,000.')
  return nums
}

export function buildTrace(nums) {
  const a = [...nums].sort((x, y) => x - y)
  let count = 0
  const frames = [{ phase: 'start', sorted: a, i: -1, j: -1, k: -1, count, activeLine: 2, message: 'Sort so the largest side is the one we fix.' }]
  for (let k = a.length - 1; k >= 2; k--) {
    let i = 0, j = k - 1
    frames.push({ phase: 'fix', sorted: a, i, j, k, count, activeLine: 4, message: `Fix the longest side a[${k}] = ${a[k]}; start i at 0 and j at ${j}.` })
    while (i < j) {
      if (a[i] + a[j] > a[k]) {
        count += j - i
        frames.push({ phase: 'hit', sorted: a, i, j, k, count, activeLine: 7, message: `${a[i]} + ${a[j]} > ${a[k]}: every index from i to j−1 also works, adding ${j - i}.` })
        j--
      } else {
        frames.push({ phase: 'miss', sorted: a, i, j, k, count, activeLine: 9, message: `${a[i]} + ${a[j]} ≤ ${a[k]}: this i is too small; advance it.` })
        i++
      }
    }
  }
  frames.push({ phase: 'done', sorted: a, i: -1, j: -1, k: -1, count, result: count, activeLine: 11, message: `Valid triangles: ${count}.` })
  return { input: nums, result: count, frames }
}

export const code = `sort the side lengths and start the count at zero
for each largest side k from the last index down to two
  start left at zero and right just below k
  while left is less than right
    if the sides at left and right sum to more than the side at k
      add right minus left to the count, then move right down
    otherwise move left up
return the count`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The family visualizer reports its own step numbers (1 setup, 4 update, 5 return).
export const LINE_MAP = { 1: 1, 4: 5, 5: 8 }

export const python = `def triangle_number(nums):
    a = sorted(nums)
    count = 0
    for k in range(len(a) - 1, 1, -1):
        left, right = 0, k - 1
        while left < right:
            if a[left] + a[right] > a[k]:
                count += right - left
                right -= 1
            else:
                left += 1
    return count`
