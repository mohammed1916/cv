export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 16 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 9)) throw new Error('nums has 1 to 16 integers from 1 to 9.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  const positions = new Map()
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('positions'), at: -1, best: -1, message: 'Group the indices of each value.' })
  nums.forEach((value, idx) => {
    if (!positions.has(value)) positions.set(value, [])
    positions.get(value).push(idx)
  })
  let best = -1
  for (const [value, idxs] of positions) {
    frames.push({ pythonLine: 6, phase: 'group', activeLine: L('for each group'), at: idxs[0], best, message: `Value ${value} sits at indices ${idxs.join(', ')}.` })
    for (let t = 0; t + 2 < idxs.length; t++) {
      const dist = 2 * (idxs[t + 2] - idxs[t])
      frames.push({ pythonLine: 8, phase: 'triple', activeLine: L('consecutive'), at: idxs[t + 2], best, ok: true, message: `Indices ${idxs[t]}, ${idxs[t + 1]}, ${idxs[t + 2]} give distance ${dist}.` })
      if (best === -1 || dist < best) {
        best = dist
        frames.push({ pythonLine: 10, phase: 'update', activeLine: L('best = dist'), at: idxs[t + 2], best, ok: true, message: `Best distance is now ${best}.` })
      }
    }
  }
  frames.push({ pythonLine: 11, phase: 'done', activeLine: L('return best'), at: -1, best, ok: best !== -1, message: best === -1 ? 'No value appears three times.' : `The minimum distance is ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `minimum index distance over three equal values
  positions = map from each value to its indices in order
  best = -1
  for each value's index list
    for each three consecutive indices p, q, r in the list
      dist = 2 * (r - p)
      if best is -1 or dist is less than best then best = dist
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_distance(nums):
    positions = {}
    for idx, value in enumerate(nums):
        positions.setdefault(value, []).append(idx)
    best = -1
    for idxs in positions.values():
        for t in range(len(idxs) - 2):
            dist = 2 * (idxs[t + 2] - idxs[t])
            if best == -1 or dist < best:
                best = dist
    return best
`
