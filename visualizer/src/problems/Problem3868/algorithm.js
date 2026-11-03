export const code = [
  'count each value in nums1 and in nums2',
  'if a value has an odd total count then return -1',
  'the surplus of a value is half of its nums1 count minus nums2 count, when positive',
  'each paid cross swap moves one surplus value across',
  'return the sum of the surpluses',
].map((text, index) => ({ line: index + 1, text }))
const L = key => code.findIndex(c => c.text.includes(key)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums1 and nums2.')
  const { nums1, nums2 } = input
  const ok = a => Array.isArray(a) && a.length >= 1 && a.length <= 10 && a.every(v => Number.isInteger(v) && v >= 1 && v <= 9)
  if (!ok(nums1) || !ok(nums2) || nums1.length !== nums2.length) throw new Error('nums1 and nums2 have the same length, 1 to 10, with integers from 1 to 9.')
  return { nums1, nums2 }
}

export function buildTrace({ nums1, nums2 }) {
  const values = [...new Set([...nums1, ...nums2])].sort((a, b) => a - b)
  const frames = []
  let cost = 0
  let possible = true
  frames.push({ rows: [], cost, phase: 'setup', activeLine: L('count each value'), message: 'Count how often each value appears in each array.' })
  const rows = []
  for (const v of values) {
    const a = nums1.filter(x => x === v).length
    const b = nums2.filter(x => x === v).length
    const odd = (a + b) % 2 === 1
    const surplus = odd ? 0 : Math.max(0, (a - b) / 2)
    if (odd) possible = false
    cost += surplus
    rows.push({ value: v, a, b, odd, surplus })
    frames.push({ rows: [...rows], cost, phase: 'value', activeLine: odd ? L('odd total') : L('the surplus of a value'),
      message: odd ? `Value ${v} has an odd total: equalizing is impossible.` : `Value ${v}: nums1 has ${a}, nums2 has ${b}, surplus ${surplus}.` })
    if (odd) break
  }
  const result = possible ? cost : -1
  frames.push({ rows: [...rows], cost: result, phase: 'done', activeLine: L('return the sum'), message: result === -1 ? 'Return -1.' : `Minimum cost is ${result}.` })
  return { input: { nums1, nums2 }, result, frames }
}

export const python = `from collections import Counter

def min_cost_to_equalize(nums1, nums2):
    c1, c2 = Counter(nums1), Counter(nums2)
    total = 0
    for v in set(nums1) | set(nums2):
        a, b = c1[v], c2[v]
        if (a + b) % 2 == 1:
            return -1
        total += max(0, (a - b) // 2)
    return total`
