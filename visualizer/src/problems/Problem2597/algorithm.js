export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with a "nums" array and a "k".')
  const { nums, k } = input
  if (nums.length < 1 || nums.length > 12) throw new Error('nums holds 1 to 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 30)) throw new Error('Each number is an integer from 1 to 30.')
  if (!Number.isInteger(k) || k < 1 || k > 10) throw new Error('k is an integer from 1 to 10.')
  return { nums, k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const n = nums.length
  const present = new Map()
  const picked = []
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set the count to zero'), index: -1, picked: [], blocked: false, count: 0, message: 'Walk the numbers in order, deciding whether each one joins the subset.' }]
  const decide = index => {
    if (index === n) {
      if (picked.length > 0) total++
      frames.push({ phase: 'leaf', activeLine: L('add one if the subset is not empty'), index: n, picked: [...picked], blocked: false, count: total, message: `A complete choice holds ${picked.length} number(s). Count so far: ${total}.` })
      return
    }
    decide(index + 1)
    const value = nums[index]
    if (present.has(value - k) || present.has(value + k)) {
      frames.push({ phase: 'blocked', activeLine: L('if neither value is already chosen'), index, picked: [...picked], blocked: true, count: total, message: `${value} is exactly ${k} away from a chosen number, so it cannot join.` })
      return
    }
    present.set(value, (present.get(value) || 0) + 1)
    picked.push(index)
    frames.push({ phase: 'include', activeLine: L('include this number'), index, picked: [...picked], blocked: false, count: total, message: `Include ${value}.` })
    decide(index + 1)
    picked.pop()
    present.set(value, present.get(value) - 1)
    if (present.get(value) === 0) present.delete(value)
  }
  decide(0)
  frames.push({ phase: 'done', activeLine: L('return the count'), index: -1, picked: [], blocked: false, count: total, message: `There are ${total} non-empty beautiful subsets.` })
  return { input, result: total, frames }
}

export const code = `count the non-empty beautiful subsets
  set the count to zero
  call decide with index zero
  return the count
decide(index)
  if every number has been considered then
    add one if the subset is not empty
    stop
  skip this number and call decide with index plus one
  if neither value is already chosen at this number minus k or plus k then
    include this number and call decide with index plus one
    remove this number from the chosen set`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_beautiful_subsets(nums, k):
    present = {}
    total = 0

    def decide(index, size):
        nonlocal total
        if index == len(nums):
            if size > 0:
                total += 1
            return
        decide(index + 1, size)
        value = nums[index]
        if present.get(value - k, 0) == 0 and present.get(value + k, 0) == 0:
            present[value] = present.get(value, 0) + 1
            decide(index + 1, size + 1)
            present[value] -= 1
            if present[value] == 0:
                del present[value]

    decide(0, 0)
    return total
`
