export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 20) throw new Error('Use a JSON array of 2 to 20 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Values are integers from 1 to 10.')
  return nums
}

export function buildTrace(nums) {
  const counts = new Map()
  for (const v of nums) counts.set(v, (counts.get(v) ?? 0) + 1)
  const snapshot = () => Object.fromEntries(counts)
  const frames = [{ phase: 'count', activeLine: L('count how often'), value: null, counts: snapshot(), total: 0, message: 'Count how often each value appears.' }]
  let total = 0
  let result = null
  for (const [value, count] of counts) {
    if (count === 1) {
      result = -1
      frames.push({ phase: 'stuck', activeLine: L('return -1'), value, counts: snapshot(), total, message: `${value} appears once, and no operation removes a lone element. Answer: -1.` })
      break
    }
    const ops = Math.ceil(count / 3)
    total += ops
    frames.push({ phase: 'group', activeLine: L('total = total + ceil'), value, counts: snapshot(), total, message: `${value} appears ${count} times: ${ops} operation${ops === 1 ? '' : 's'} (triples first, then a pair or a triple).` })
  }
  if (result === null) result = total
  frames.push({ phase: 'done', activeLine: L('return total'), value: null, counts: snapshot(), total: result, message: `Minimum operations: ${result}.` })
  return { input: nums, result, frames }
}

export const code = `minimum operations to empty the array
  count how often each value appears
  total = 0
  for each value with count c
    if c is 1 then
      return -1
    total = total + ceil(c / 3)
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def min_operations_to_empty(nums):
    total = 0
    for count in Counter(nums).values():
        if count == 1:
            return -1
        total += (count + 2) // 3
    return total
`
