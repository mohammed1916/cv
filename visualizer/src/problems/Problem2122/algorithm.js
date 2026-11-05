// LeetCode 2122: Recover the Original Array.
// The smallest number must be a lower value, and its partner is the higher value 2k above it.
// Try each candidate partner from the sorted list (difference must be an even positive number, k = diff / 2),
// then pair values greedily from the bottom with a count map; the first complete pairing is the answer.

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array of 2n integers, e.g. [2,10,6,4,8,12].') }
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 20 || nums.length % 2 !== 0 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) {
    throw new Error('Use an even number of integers (2 to 20) from 1 to 1000.')
  }
  return { nums }
}

export const code = `function recoverArray(nums) {
  const sorted = [...nums].sort((a, b) => a - b)
  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i] - sorted[0]
    if (diff <= 0 || diff % 2 !== 0) continue
    const result = pairWith(sorted, diff / 2)
    if (result) return result
  }
  return []
}

function pairWith(sorted, k) {
  const count = new Map()
  for (const value of sorted) count.set(value, (count.get(value) ?? 0) + 1)
  const result = []
  for (const low of sorted) {
    if (count.get(low) === 0) continue
    count.set(low, count.get(low) - 1)
    const high = low + 2 * k
    if ((count.get(high) ?? 0) === 0) return null
    count.set(high, count.get(high) - 1)
    result.push(low + k)
  }
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: recover_array
from collections import Counter

def recover_array(nums):
    ordered = sorted(nums)
    for i in range(1, len(ordered)):
        diff = ordered[i] - ordered[0]
        if diff <= 0 or diff % 2 != 0:
            continue
        result = pair_with(ordered, diff // 2)
        if result is not None:
            return result
    return []

def pair_with(ordered, k):
    count = Counter(ordered)
    result = []
    for low in ordered:
        if count[low] == 0:
            continue
        count[low] -= 1
        high = low + 2 * k
        if count[high] == 0:
            return None
        count[high] -= 1
        result.append(low + k)
    return result
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'sort', label: 'Sort', description: 'Sorting puts each lower value before its partner.' },
  { id: 'candidate', label: 'Try partner', description: 'The smallest value pairs with a candidate; the gap gives k.' },
  { id: 'pair', label: 'Pair up', description: 'Take the lowest unused value and its partner 2k higher.' },
  { id: 'fail', label: 'Dead end', description: 'The partner is missing, so this k is rejected.' },
  { id: 'done', label: 'Result', description: 'The recovered array.' },
]

export function buildTrace({ nums }) {
  const frames = []
  const sorted = [...nums].sort((a, b) => a - b)
  frames.push({ phase: 'sort', activeLine: L('const sorted'), pythonLine: P('ordered = sorted'), message: `Sorted: ${sorted.join(', ')}.`, sorted, l: 0, candidate: null, tries: [], result: null })
  const tries = []
  let answer = null
  for (let i = 1; i < sorted.length && answer === null; i++) {
    const diff = sorted[i] - sorted[0]
    if (diff <= 0 || diff % 2 !== 0) continue
    const k = diff / 2
    frames.push({ phase: 'candidate', activeLine: L('const diff'), pythonLine: P('diff = ordered[i]'), message: `Partner ${sorted[i]} gives k = ${k}.`, sorted, l: 0, candidate: i, tries: [...tries], result: null })
    const count = new Map()
    for (const value of sorted) count.set(value, (count.get(value) ?? 0) + 1)
    const result = []
    let ok = true
    for (const low of sorted) {
      if (count.get(low) === 0) continue
      count.set(low, count.get(low) - 1)
      const high = low + 2 * k
      if ((count.get(high) ?? 0) === 0) {
        ok = false
        frames.push({ phase: 'fail', activeLine: L('if ((count.get(high)'), pythonLine: P('if count[high] == 0'), message: `${high} is missing for k = ${k}, so this partner fails.`, sorted, l: sorted.indexOf(low), candidate: i, tries: [...tries], result: null })
        break
      }
      count.set(high, count.get(high) - 1)
      result.push(low + k)
      frames.push({ phase: 'pair', activeLine: L('result.push(low + k)'), pythonLine: P('result.append(low + k)'), message: `${low} pairs with ${high}; original value ${low + k}.`, sorted, l: sorted.indexOf(low), candidate: i, tries: [...tries], result: null })
    }
    tries.push({ k, outcome: ok ? 'complete' : 'dead end' })
    if (ok) answer = result
  }
  frames.push({ phase: 'done', activeLine: L('return []'), pythonLine: P('return []'), message: answer ? `Recovered array: ${answer.join(', ')}.` : 'No array works.', sorted, l: -1, candidate: null, tries: [...tries], result: answer })
  return { input: { nums }, result: answer ?? [], frames }
}
