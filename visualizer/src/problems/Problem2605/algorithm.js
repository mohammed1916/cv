const isDigitList = list => Array.isArray(list) && list.length >= 1 && list.length <= 9 && list.every(d => Number.isInteger(d) && d >= 1 && d <= 9) && new Set(list).size === list.length

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !isDigitList(data.nums1) || !isDigitList(data.nums2)) throw new Error('Use {"nums1": [...], "nums2": [...]} with distinct digits from 1 to 9 in each list (1 to 9 digits).')
  return { nums1: data.nums1, nums2: data.nums2 }
}

export function buildTrace(input) {
  const { nums1, nums2 } = input
  const inA = new Set(nums1), inB = new Set(nums2)
  const setMap = () => [
    { name: 'nums1', keyLabel: 'digit', valueLabel: '', isSet: true, entries: [...inA].sort((x, y) => x - y).map(d => [d]) },
    { name: 'nums2', keyLabel: 'digit', valueLabel: '', isSet: true, entries: [...inB].sort((x, y) => x - y).map(d => [d]) },
  ]
  const frames = [{ phase: 'start', activeLine: L('inA = set'), maps: setMap(), ops: [], result: null, message: 'Each list becomes a set of digits. The answer uses at least one digit from each list.' }]
  for (let d = 1; d <= 9; d++) {
    const both = inA.has(d) && inB.has(d)
    frames.push({ phase: both ? 'shared' : 'scan', activeLine: both ? L('return d') : L('if d is in both'), maps: setMap(),
      ops: [{ map: 'nums1', type: 'lookup', via: 'has', key: d, hit: inA.has(d), hitNote: `${d} is in nums1`, missNote: `${d} is not in nums1` },
        { map: 'nums2', type: 'lookup', via: 'has', key: d, hit: inB.has(d), hitNote: `${d} is in nums2`, missNote: `${d} is not in nums2` }],
      result: both ? d : null, message: `${d}: ${both ? 'it is in both lists, so the answer is this single digit.' : 'not in both lists. Try the next digit.'}` })
    if (both) return { input, result: d, frames }
  }
  const a = Math.min(...nums1), b = Math.min(...nums2)
  const result = Math.min(a * 10 + b, b * 10 + a)
  frames.push({ phase: 'pair', activeLine: L('return the smaller of'), maps: setMap(), ops: [], result,
    message: `No shared digit. The smallest digits are ${a} and ${b}, so the answer is ${result}.` })
  return { input, result, frames }
}

export const code = `smallest number using at least one digit from each list
inA = set of digits in nums1
inB = set of digits in nums2
for d from 1 to 9
  if d is in both inA and inB then
    return d
a = smallest digit of nums1
b = smallest digit of nums2
return the smaller of a times 10 plus b and b times 10 plus a`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_number(nums1, nums2):
    common = set(nums1) & set(nums2)
    if common:
        return min(common)
    a = min(nums1)
    b = min(nums2)
    return min(a * 10 + b, b * 10 + a)
`
