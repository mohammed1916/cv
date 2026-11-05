export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('nums has 1 to 20 entries.')
  for (const value of nums) {
    if (value !== 0 && value !== 1 && value !== 2) throw new Error('Each entry of nums is 0, 1 or 2.')
  }
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  let best = null
  let bestPair = null
  const last = { 1: -1, 2: -1 }
  const snap = () => ({ ...last })
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('let best = null'), at: -1, value: null, best, bestPair, last: snap(), message: 'No 1 and 2 pair seen yet.' })
  for (let i = 0; i < nums.length; i++) {
    const value = nums[i]
    frames.push({ pythonLine: 4, phase: 'scan', activeLine: L('for (let i = 0'), at: i, value, best, bestPair, last: snap(), message: `Index ${i} holds ${value}.` })
    if (value === 0) {
      frames.push({ pythonLine: 6, phase: 'skip', activeLine: L('if (value === 0)'), at: i, value, best, bestPair, last: snap(), message: `Index ${i} holds 0, which can never be an endpoint. Skipped.` })
      continue
    }
    const other = value === 1 ? 2 : 1
    frames.push({ pythonLine: 7, phase: 'other', activeLine: L('const partner'), at: i, value, best, bestPair, last: snap(), partner: last[other] >= 0 ? last[other] : undefined, message: last[other] >= 0 ? `The last ${other} is at index ${last[other]}.` : `No ${other} has been seen yet.` })
    if (last[other] >= 0) {
      const partner = last[other]
      const gap = i - partner
      frames.push({ pythonLine: 8, phase: 'pair', activeLine: L('if (partner >= 0)'), at: i, value, best, bestPair, partner, gap, last: snap(), message: `Subtract: ${i} − ${partner} = ${gap}.` })
      if (best === null || gap < best) {
        best = gap
        bestPair = { from: partner, to: i }
        frames.push({ pythonLine: 11, phase: 'best', activeLine: L('if (best === null || gap < best)'), at: i, value, best, bestPair, partner, gap, last: snap(), message: `New smallest gap ${best}; best pair is indices ${partner} and ${i}.` })
      } else {
        frames.push({ pythonLine: 10, phase: 'best', activeLine: L('if (best === null || gap < best)'), at: i, value, best, bestPair, partner, gap, last: snap(), message: `Gap ${gap} is not smaller than the best ${best}; keep ${best}.` })
      }
    }
    last[value] = i
    frames.push({ pythonLine: 12, phase: 'remember', activeLine: L('last[value] = i'), at: i, value, best, bestPair, last: snap(), message: `Remember index ${i} as the last ${value}.` })
  }
  const result = best === null ? -1 : best
  frames.push({ pythonLine: 13, phase: 'done', activeLine: L('return best === null'), at: -1, value: null, best: result, bestPair, last: snap(), message: best === null ? 'A 1 and a 2 are not both present; return -1.' : `Return ${result}, from indices ${bestPair.from} and ${bestPair.to}.` })
  return { input: { nums }, result, frames }
}

export const code = `function minAbsoluteDifference(nums) {
  let best = null
  const last = { 1: -1, 2: -1 }
  for (let i = 0; i < nums.length; i++) {
    const value = nums[i]
    if (value === 0) continue
    const other = value === 1 ? 2 : 1
    const partner = last[other]
    if (partner >= 0) {
      const gap = i - partner
      if (best === null || gap < best) best = gap
    }
    last[value] = i
  }
  return best === null ? -1 : best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def min_absolute_difference(nums):
    best = None
    last = {1: -1, 2: -1}
    for i, value in enumerate(nums):
        if value == 0:
            continue
        other = 2 if value == 1 else 1
        if last[other] >= 0:
            gap = i - last[other]
            if best is None or gap < best:
                best = gap
        last[value] = i
    return -1 if best is None else best
`
