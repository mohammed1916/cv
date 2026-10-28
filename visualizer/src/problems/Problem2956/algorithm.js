const valid = list => Array.isArray(list) && list.length >= 1 && list.length <= 20 && list.every(v => Number.isInteger(v) && v >= 1 && v <= 50)

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !valid(data.nums1) || !valid(data.nums2)) throw new Error('Use {"nums1": [...], "nums2": [...]} with 1 to 20 integers from 1 to 50 each.')
  return { nums1: data.nums1, nums2: data.nums2 }
}

export function buildTrace(input) {
  const { nums1, nums2 } = input
  const set1 = new Set(nums1), set2 = new Set(nums2)
  const frames = [{ phase: 'start', activeLine: L('set1 = set of nums1'), index: -1, side: null, maps: [], ops: [], result: null, message: 'Each array becomes a set. Then each entry of one array is checked against the other set.' }]
  let first = 0
  nums1.forEach((v, i) => {
    const hit = set2.has(v)
    if (hit) first++
    frames.push({ phase: 'first', activeLine: L('if v is in set2'), index: i, side: 'nums1', maps: [], ops: [{ map: 'nums2', type: 'lookup', via: 'has', key: v, hit, hitNote: `${v} appears in nums2`, missNote: `${v} does not appear in nums2` }], result: [first, null], message: `nums1[${i}] = ${v} ${hit ? 'is in nums2, so the first count goes up.' : 'is not in nums2.'}` })
  })
  let second = 0
  nums2.forEach((v, i) => {
    const hit = set1.has(v)
    if (hit) second++
    frames.push({ phase: 'second', activeLine: L('if v is in set1'), index: i, side: 'nums2', maps: [], ops: [{ map: 'nums1', type: 'lookup', via: 'has', key: v, hit, hitNote: `${v} appears in nums1`, missNote: `${v} does not appear in nums1` }], result: [first, second], message: `nums2[${i}] = ${v} ${hit ? 'is in nums1, so the second count goes up.' : 'is not in nums1.'}` })
  })
  frames.push({ phase: 'done', activeLine: L('return [first, second]'), index: -1, side: null, maps: [], ops: [], result: [first, second], message: `Answer: [${first}, ${second}].` })
  return { input, result: [first, second], frames }
}

export const code = `count how many entries of each list appear in the other list
set1 = set of nums1
set2 = set of nums2
first = 0
for each value v in nums1
  if v is in set2 then add one to first
second = 0
for each value v in nums2
  if v is in set1 then add one to second
return [first, second]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_common_entries(nums1, nums2):
    set1 = set(nums1)
    set2 = set(nums2)
    first = sum(1 for v in nums1 if v in set2)
    second = sum(1 for v in nums2 if v in set1)
    return [first, second]
`
