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
  frames.push({ pythonLine: P('total = 0'), phase: 'start', activeLine: L('let total = 0'), at: -1, total, message: `Count elements with at least ${k} strictly greater values.` })
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    let greater = 0
    frames.push({ pythonLine: P('for x in nums'), phase: 'pick', activeLine: L('for (const x of nums)'), at: i, greater: 0, total, message: `Consider ${x} at index ${i}.` })
    for (let j = 0; j < nums.length; j++) {
      if (nums[j] > x) {
        greater += 1
        frames.push({ pythonLine: P('greater += 1'), phase: 'compare', activeLine: L('if (y > x)'), at: j, greater, total, ok: true, message: `${nums[j]} is greater than ${x}; greater count ${greater}.` })
      } else {
        frames.push({ pythonLine: P('if y > x'), phase: 'compare', activeLine: L('if (y > x)'), at: j, greater, total, ok: false, message: `${nums[j]} is not greater than ${x}.` })
      }
    }
    const qualifies = greater >= k
    frames.push({ pythonLine: P('if greater >= k'), phase: 'check', activeLine: L('if (greater >= k)'), at: i, greater, total, ok: qualifies, message: `${greater} greater values, need ${k}.` })
    if (qualifies) {
      total += 1
      frames.push({ pythonLine: P('total += 1'), phase: 'count', activeLine: L('total += 1'), at: i, greater, total, ok: true, message: `${x} counts; total is ${total}.` })
    }
  }
  frames.push({ pythonLine: P('return total'), phase: 'done', activeLine: L('return total'), at: -1, total, ok: true, message: `${total} elements qualify.` })
  return { input: { nums, k }, result: total, frames }
}

export const code = `function countAtLeastKGreater(nums, k) {
  let total = 0
  for (const x of nums) {
    let greater = 0
    for (const y of nums) {
      if (y > x) greater += 1
    }
    if (greater >= k) total += 1
  }
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const hit = code.find(c => c.text.includes(s))
  if (!hit) throw new Error(`No JavaScript line contains "${s}".`)
  return hit.line
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}".`)
  return index + 1
}

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
