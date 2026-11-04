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
  const frames = [{ phase: 'start', activeLine: L('function maxSum'), pythonLine: 10, i, j, first, second, total, message: 'Walk both lists from the start, keeping one running sum for each list.' }]

  while (i < n1 || j < n2) {
    if (i < n1 && (j === n2 || nums1[i] < nums2[j])) {
      first += nums1[i]
      frames.push({ phase: 'first', activeLine: L('first += nums1[i++]'), pythonLine: 12, i, j, first, second, total, message: `Add ${nums1[i]} from the first list to its running sum.` })
      i++
    } else if (j < n2 && (i === n1 || nums2[j] < nums1[i])) {
      second += nums2[j]
      frames.push({ phase: 'second', activeLine: L('second += nums2[j++]'), pythonLine: 15, i, j, first, second, total, message: `Add ${nums2[j]} from the second list to its running sum.` })
      j++
    } else {
      const shared = nums1[i]
      total += Math.max(first, second) + shared
      frames.push({ phase: 'shared', activeLine: L('total += Math.max(first, second) + nums1[i]'), pythonLine: 18, i, j, first, second, total, message: `Shared value ${shared}: keep the larger running sum (${Math.max(first, second)}) and add ${shared}.` })
      first = 0
      second = 0
      i++
      j++
    }
  }
  total += Math.max(first, second)
  frames.push({ phase: 'done', activeLine: L('return total % 1000000007'), pythonLine: 24, i, j, first, second, total, message: `Best score: ${total % MOD}.` })
  return { input: { nums1, nums2 }, result: total % MOD, frames }
}

const CODE = [
  'function maxSum(nums1, nums2) {',
  '  let i = 0, j = 0',
  '  let first = 0, second = 0, total = 0',
  '  while (i < nums1.length || j < nums2.length) {',
  '    if (i < nums1.length && (j === nums2.length || nums1[i] < nums2[j])) {',
  '      first += nums1[i++]',
  '    } else if (j < nums2.length && (i === nums1.length || nums2[j] < nums1[i])) {',
  '      second += nums2[j++]',
  '    } else {',
  '      total += Math.max(first, second) + nums1[i]',
  '      first = 0; second = 0',
  '      i++; j++',
  '    }',
  '  }',
  '  total += Math.max(first, second)',
  '  return total % 1000000007',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = s => CODE.findIndex(c => c.includes(s)) + 1

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
