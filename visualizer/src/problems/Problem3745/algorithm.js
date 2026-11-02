export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 16 || !nums.every(v => Number.isInteger(v) && v >= -20 && v <= 20)) throw new Error('nums has 3 to 16 integers from -20 to 20.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  const n = nums.length
  let best = null
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('best = none'), at: -1, best, message: 'No triple has been scored yet.' })
  for (let j = 1; j < n - 1; j++) {
    frames.push({ pythonLine: 3, phase: 'pivot', activeLine: L('for each middle'), at: j, best, message: `Use index ${j} as the middle element j.` })
    const left = Math.max(...nums.slice(0, j))
    frames.push({ pythonLine: 4, phase: 'left', activeLine: L('left ='), at: j, left, best, message: `Best prefix value before j is ${left}.` })
    const right = Math.min(...nums.slice(j + 1))
    frames.push({ pythonLine: 5, phase: 'right', activeLine: L('right ='), at: j, right, best, message: `Smallest value after j is ${right}.` })
    const value = left + nums[j] - right
    frames.push({ pythonLine: 6, phase: 'value', activeLine: L('value ='), at: j, value, best, message: `${left} + ${nums[j]} - ${right} = ${value}.` })
    if (best === null || value > best) {
      best = value
      frames.push({ pythonLine: 8, phase: 'update', activeLine: L('best = value'), at: j, value, best, ok: true, message: `Best expression is now ${best}.` })
    }
  }
  frames.push({ pythonLine: 9, phase: 'done', activeLine: L('return best'), at: -1, best, ok: true, message: `The maximum expression is ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `maximum of nums[i] + nums[j] - nums[k] for i < j < k
  best = none
  for each middle index j from 1 to n - 2
    left = largest value among nums before j
    right = smallest value among nums after j
    value = left + nums[j] - right
    if best is none or value is greater than best then best = value
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximize_expression(nums):
    best = None
    for j in range(1, len(nums) - 1):
        left = max(nums[:j])
        right = min(nums[j + 1:])
        value = left + nums[j] - right
        if best is None or value > best:
            best = value
    return best
`
