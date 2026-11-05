export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 values.')
  if (!nums.every(x => Number.isInteger(x) && x >= -100 && x <= 100)) throw new Error('Each value is an integer from -100 to 100.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  let best = nums[0]
  frames.push({ pythonLine: PL('best = nums[0]'), phase: 'setup', activeLine: CL('let best'), at: 0, best, message: `Start with ${best} as the best value so far.` })
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    const closer = Math.abs(x) < Math.abs(best)
    const tie = Math.abs(x) === Math.abs(best) && x > best
    if (closer || tie) best = x
    frames.push({ pythonLine: PL('if abs(x) < abs(best)'), phase: 'scan', activeLine: CL('if (Math.abs(x)'), at: i, best, message: `${x} is ${closer ? 'closer to zero than ' + best + ' was, so it becomes the best' : tie ? 'as close as the best, but larger, so it becomes the best' : 'not closer, so the best stays'}.` })
  }
  frames.push({ pythonLine: PL('return best'), phase: 'done', activeLine: CL('return best'), at: -1, best, message: `The value closest to zero is ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `function closestToZero(nums) {
  let best = nums[0];
  for (const x of nums) {
    if (Math.abs(x) < Math.abs(best) || (Math.abs(x) === Math.abs(best) && x > best)) {
      best = x;
    }
  }
  return best;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def closest_to_zero(nums):
    best = nums[0]
    for x in nums:
        if abs(x) < abs(best) or (abs(x) == abs(best) and x > best):
            best = x
    return best
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
