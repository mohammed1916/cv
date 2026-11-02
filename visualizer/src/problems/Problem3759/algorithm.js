export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 14 || !nums.every(v => Number.isInteger(v) && v >= 0 && v <= 99)) throw new Error('nums has 1 to 14 integers from 0 to 99.')
  if (!Number.isInteger(k) || k < 0 || k > 14) throw new Error('k is an integer from 0 to 14.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  let total = 0
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('total = 0'), at: -1, total, message: `Count elements with at least ${k} strictly greater values.` })
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    let greater = 0
    frames.push({ pythonLine: 3, phase: 'pick', activeLine: L('for each element'), at: i, greater: 0, total, message: `Consider ${x} at index ${i}.` })
    for (let j = 0; j < nums.length; j++) {
      if (nums[j] > x) {
        greater += 1
        frames.push({ pythonLine: 7, phase: 'compare', activeLine: L('if the other'), at: j, greater, total, ok: true, message: `${nums[j]} is greater than ${x}; greater count ${greater}.` })
      } else {
        frames.push({ pythonLine: 6, phase: 'compare', activeLine: L('if the other'), at: j, greater, total, ok: false, message: `${nums[j]} is not greater than ${x}.` })
      }
    }
    const qualifies = greater >= k
    frames.push({ pythonLine: 8, phase: 'check', activeLine: L('if greater'), at: i, greater, total, ok: qualifies, message: `${greater} greater values, need ${k}.` })
    if (qualifies) {
      total += 1
      frames.push({ pythonLine: 9, phase: 'count', activeLine: L('total = total + 1'), at: i, greater, total, ok: true, message: `${x} counts; total is ${total}.` })
    }
  }
  frames.push({ pythonLine: 10, phase: 'done', activeLine: L('return total'), at: -1, total, ok: true, message: `${total} elements qualify.` })
  return { input: { nums, k }, result: total, frames }
}

export const code = `count elements with at least k strictly greater values
  total = 0
  for each element x of nums
    greater = 0
    for each element y of nums
      if y is greater than x then greater = greater + 1
    if greater is at least k then total = total + 1
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_at_least_k_greater(nums, k):
    total = 0
    for x in nums:
        greater = 0
        for y in nums:
            if y > x:
                greater += 1
        if greater >= k:
            total += 1
    return total
`
