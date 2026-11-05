export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 16 || !nums.every(v => Number.isInteger(v) && v >= -20 && v <= 20)) throw new Error('nums has 3 to 16 integers from -20 to 20.')
  return { nums }
}

// The subtracted element c can be any index. For each c, the two other elements that add
// the most are the two largest of the remaining values.
export function buildTrace({ nums }) {
  const frames = []
  const n = nums.length
  let best = null
  frames.push({ pythonLine: P('best = None'), phase: 'start', activeLine: L('let best'), at: -1, a: -1, b: -1, best, message: 'No triple has been scored yet.' })
  for (let c = 0; c < n; c++) {
    const others = nums.map((_, i) => i).filter(i => i !== c).sort((x, y) => nums[y] - nums[x])
    const a = others[0]
    const b = others[1]
    const value = nums[a] + nums[b] - nums[c]
    frames.push({ pythonLine: P('others = sorted'), phase: 'pick', activeLine: L('const others'), at: c, a, b, value, best,
      message: `Subtract index ${c} (${nums[c]}); the two largest others are ${nums[a]} and ${nums[b]}, giving ${value}.` })
    if (best === null || value > best) {
      best = value
      frames.push({ pythonLine: P('best = value'), phase: 'update', activeLine: L('best = value'), at: c, a, b, value, best, message: `Best expression is now ${best}.` })
    }
  }
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: L('return best'), at: -1, a: -1, b: -1, best, message: `The maximum expression is ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `function maximizeExpression(nums) {
  let best = null
  for (let c = 0; c < nums.length; c++) {
    const others = nums.map((_, i) => i).filter(i => i !== c).sort((x, y) => nums[y] - nums[x])
    const value = nums[others[0]] + nums[others[1]] - nums[c]
    if (best === null || value > best) best = value
  }
  return best
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

export const python = `def maximize_expression(nums):
    best = None
    for c in range(len(nums)):
        others = sorted((x for i, x in enumerate(nums) if i != c), reverse=True)
        value = others[0] + others[1] - nums[c]
        if best is None or value > best:
            best = value
    return best
`
