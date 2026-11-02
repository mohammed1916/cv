export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('nums has 1 to 20 entries.')
  for (const value of nums) {
    if (value !== 1 && value !== 2) throw new Error('Each entry of nums is 1 or 2.')
  }
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  let best = null
  const last = { 1: -1, 2: -1 }
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('set best'), at: -1, value: null, best, message: 'No 1 and 2 pair seen yet.' })
  for (let i = 0; i < nums.length; i++) {
    const value = nums[i]
    const other = value === 1 ? 2 : 1
    frames.push({ pythonLine: 5, phase: 'scan', activeLine: L('for each index'), at: i, value, best, message: `Index ${i} holds ${value}.` })
    if (last[other] >= 0) {
      const gap = i - last[other]
      frames.push({ pythonLine: 7, phase: 'pair', activeLine: L('if the other value'), at: i, value, best, partner: last[other], message: `The opposite value at ${last[other]} gives a gap of ${gap}.` })
      if (best === null || gap < best) {
        best = gap
        frames.push({ pythonLine: 9, phase: 'best', activeLine: L('keep the smallest'), at: i, value, best, partner: last[other], message: `New smallest gap ${best}.` })
      }
    }
    last[value] = i
    frames.push({ pythonLine: 10, phase: 'remember', activeLine: L('remember i'), at: i, value, best, message: `Remember index ${i} as the last ${value}.` })
  }
  const result = best === null ? -1 : best
  frames.push({ pythonLine: 11, phase: 'done', activeLine: L('return -1'), at: -1, value: null, best: result, message: best === null ? 'A 1 and a 2 are not both present; return -1.' : `Return ${result}.` })
  return { input: { nums }, result, frames }
}

export const code = `smallest index distance between a 1 and a 2
  set best to nothing
  remember the last index of 1 and of 2 as none
  for each index i with value v
    look at the last index of the other value
    if it exists then gap is i minus that index, keep the smallest gap
    remember i as the last index of v
  if no gap was found return -1, else return the smallest gap`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_absolute_difference(nums):
    best = None
    last = {1: -1, 2: -1}
    for i, value in enumerate(nums):
        other = 2 if value == 1 else 1
        if last[other] >= 0:
            gap = i - last[other]
            if best is None or gap < best:
                best = gap
        last[value] = i
    return -1 if best is None else best
`
