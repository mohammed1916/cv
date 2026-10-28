export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with "nums1", "nums2" and "k".')
  const { nums1, nums2, k } = data
  if (!Array.isArray(nums1) || nums1.length < 1 || nums1.length > 10) throw new Error('"nums1" is an array of 1 to 10 integers.')
  if (!Array.isArray(nums2) || nums2.length < 1 || nums2.length > 8) throw new Error('"nums2" is an array of 1 to 8 integers.')
  if (nums1.some(v => !Number.isInteger(v) || v < 1 || v > 30)) throw new Error('Values in "nums1" are integers from 1 to 30.')
  if (nums2.some(v => !Number.isInteger(v) || v < 1 || v > 8)) throw new Error('Values in "nums2" are integers from 1 to 8.')
  if (!Number.isInteger(k) || k < 1 || k > 4) throw new Error('"k" is an integer from 1 to 4.')
  return { nums1, nums2, k }
}

export function buildTrace({ nums1, nums2, k }) {
  const freq = new Map()
  for (const x of nums1) freq.set(x, (freq.get(x) ?? 0) + 1)
  const frames = [{ phase: 'start', activeLine: L('freq = count'), j: -1, step: null, added: 0, total: 0, message: `Count the values of nums1: ${[...freq].map(([x, c]) => `${x} x${c}`).join(', ')}.` }]
  let total = 0
  for (let j = 0; j < nums2.length; j++) {
    const step = nums2[j] * k
    let added = 0
    for (const [x, c] of freq) {
      if (x % step === 0) added += c
    }
    total += added
    frames.push({ phase: 'pair', activeLine: L('total = total + freq'), j, step, added, total, message: `nums2[${j}] = ${nums2[j]} gives divisor ${step}: ${added} values of nums1 are divisible, so ${added} good pairs.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), j: -1, step: null, added: 0, total, message: `Total good pairs: ${total}.` })
  return { input: { nums1, nums2, k }, result: total, frames }
}

export const code = `count good pairs
  freq = count of each value in nums1
  total = 0
  for each value y in nums2
    step = y * k
    for each distinct value x in freq
      if x is divisible by step then
        total = total + freq[x]
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def count_good_pairs(nums1, nums2, k):
    freq = Counter(nums1)
    total = 0
    for y in nums2:
        step = y * k
        for x, c in freq.items():
            if x % step == 0:
                total += c
    return total
`
