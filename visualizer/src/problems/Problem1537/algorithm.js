const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  const { nums1, nums2 } = input ?? {}
  for (const [name, nums] of [['nums1', nums1], ['nums2', nums2]]) {
    if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error(`${name} needs 1 to 8 values.`)
    if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error(`${name} holds integers from 1 to 100.`)
    if (nums.some((v, i) => i > 0 && v <= nums[i - 1])) throw new Error(`${name} must be strictly increasing.`)
  }
  return { nums1, nums2 }
}

export function buildTrace({ nums1, nums2 }) {
  const n1 = nums1.length
  const n2 = nums2.length
  let i = 0
  let j = 0
  let first = 0
  let second = 0
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('maximum score over two increasing lists'), i, j, first, second, total, message: 'Walk both lists from the start, keeping one running sum for each list.' }]

  while (i < n1 || j < n2) {
    if (i < n1 && (j === n2 || nums1[i] < nums2[j])) {
      first += nums1[i]
      frames.push({ phase: 'first', activeLine: L('add that value to the first running sum'), i, j, first, second, total, message: `Add ${nums1[i]} from the first list to its running sum.` })
      i++
    } else if (j < n2 && (i === n1 || nums2[j] < nums1[i])) {
      second += nums2[j]
      frames.push({ phase: 'second', activeLine: L('add that value to the second running sum'), i, j, first, second, total, message: `Add ${nums2[j]} from the second list to its running sum.` })
      j++
    } else {
      const shared = nums1[i]
      total += Math.max(first, second) + shared
      frames.push({ phase: 'shared', activeLine: L('add the larger running sum plus the shared value'), i, j, first, second, total, message: `Shared value ${shared}: keep the larger running sum (${Math.max(first, second)}) and add ${shared}.` })
      first = 0
      second = 0
      i++
      j++
    }
  }
  total += Math.max(first, second)
  frames.push({ phase: 'done', activeLine: L('return the total modulo'), i, j, first, second, total, message: `Best score: ${total % MOD}.` })
  return { input: { nums1, nums2 }, result: total % MOD, frames }
}

export const code = `maximum score over two increasing lists
  set both running sums to zero and the total to zero
  while either list has values left
    if the first list has the smaller value or the second list is used up
      add that value to the first running sum
    else if the second list has the smaller value or the first list is used up
      add that value to the second running sum
    otherwise the values are shared
      add the larger running sum plus the shared value to the total
      reset both running sums to zero and move both lists on
  add the larger running sum to the total
  return the total modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_score(nums1, nums2):
    MOD = 10 ** 9 + 7
    n1 = len(nums1)
    n2 = len(nums2)
    i = 0
    j = 0
    first = 0
    second = 0
    total = 0
    while i < n1 or j < n2:
        if i < n1 and (j == n2 or nums1[i] < nums2[j]):
            first += nums1[i]
            i += 1
        elif j < n2 and (i == n1 or nums2[j] < nums1[i]):
            second += nums2[j]
            j += 1
        else:
            total += max(first, second) + nums1[i]
            first = 0
            second = 0
            i += 1
            j += 1
    total += max(first, second)
    return total % MOD
`
