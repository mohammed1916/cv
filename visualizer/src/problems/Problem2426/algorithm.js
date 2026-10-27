export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums1) || !Array.isArray(obj.nums2) || !Number.isInteger(obj.diff)) {
    throw new Error('Use {"nums1": [...], "nums2": [...], "diff": integer}.')
  }
  const n = obj.nums1.length
  if (n < 2 || n > 14) throw new Error('Use 2 to 14 entries in each array.')
  if (obj.nums2.length !== n) throw new Error('nums1 and nums2 must have the same length.')
  const all = [...obj.nums1, ...obj.nums2]
  if (all.some(v => !Number.isInteger(v) || v < 0 || v > 9)) throw new Error('Array values are integers from 0 to 9.')
  if (obj.diff < 0 || obj.diff > 9) throw new Error('diff is an integer from 0 to 9.')
  return { nums1: obj.nums1, nums2: obj.nums2, diff: obj.diff }
}

export function buildTrace(input) {
  const { nums1, nums2, diff } = input
  const n = nums1.length
  const d = nums1.map((v, i) => v - nums2[i])
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set d[i]'), j: null, counted: null, total: 0, d: d.slice(), message: 'Each pair i < j satisfies the inequality when d[i] - d[j] is at most diff, where d[i] = nums1[i] - nums2[i].' }]
  for (let j = 1; j < n; j++) {
    let counted = 0
    for (let i = 0; i < j; i++) if (d[i] <= d[j] + diff) counted++
    total += counted
    frames.push({ phase: 'pairs', activeLine: L('count i below j'), j, counted, total, d: d.slice(), message: `For j = ${j}: ${counted} earlier values satisfy d[i] <= ${d[j] + diff}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), j: null, counted: null, total, d: d.slice(), message: `Total pairs: ${total}.` })
  return { input, result: total, frames }
}

export const code = `count pairs i < j that satisfy the inequality:
  set d[i] to nums1[i] - nums2[i] for each i
  set total to 0
  for j from 1 to n - 1:
    count i below j with d[i] <= d[j] + diff
    add that count to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_of_pairs(nums1, nums2, diff):
    d = [a - b for a, b in zip(nums1, nums2)]
    total = 0
    for j in range(1, len(d)):
        for i in range(j):
            if d[i] <= d[j] + diff:
                total += 1
    return total
`
