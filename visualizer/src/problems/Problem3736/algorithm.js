export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use an array of 1 to 12 integers.')
  if (!nums.every(x => Number.isInteger(x) && x >= 1 && x <= 100)) throw new Error('Each value is an integer from 1 to 100.')
  return nums
}

// Only increases are allowed, so every value must climb to the largest one.
export function buildTrace(nums) {
  const target = Math.max(...nums)
  const frames = []
  let total = 0
  frames.push({ pythonLine: P('target = max'), phase: 'scan', activeLine: L('const target'), at: -1, target, total, message: `The largest value is ${target}; every other value must climb to it.` })
  nums.forEach((x, i) => {
    const cost = target - x
    total += cost
    frames.push({ pythonLine: P('total += target - x'), phase: 'raise', activeLine: L('total += target - x'), at: i, target, total,
      message: cost === 0 ? `nums[${i}] already equals ${target}.` : `nums[${i}] = ${x} needs ${cost} moves; running total ${total}.` })
  })
  frames.push({ pythonLine: P('return total'), phase: 'done', activeLine: L('return total'), at: -1, target, total, message: `All values reach ${target} after ${total} moves.` })
  return { input: { nums }, result: total, frames }
}

export const code = `function minMovesToEqualElements(nums) {
  const target = Math.max(...nums)
  let total = 0
  for (const x of nums) {
    total += target - x
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

export const python = `def min_moves(nums):
    target = max(nums)
    total = 0
    for x in nums:
        total += target - x
    return total
`
