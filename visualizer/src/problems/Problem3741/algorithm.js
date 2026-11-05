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
  frames.push({ pythonLine: P('positions = {}'), phase: 'start', activeLine: L('const positions'), left: -1, right: -1, best: -1, message: 'Group the indices of each value.' })
  nums.forEach((value, idx) => {
    if (!positions.has(value)) positions.set(value, [])
    positions.get(value).push(idx)
  })
  let best = -1
  for (const [value, idxs] of positions) {
    frames.push({ pythonLine: P('for idxs in'), phase: 'group', activeLine: L('for (const idxs'), left: idxs[0], right: idxs[0], group: idxs, best, message: `Value ${value} sits at indices ${idxs.join(', ')}.` })
    for (let t = 0; t + 2 < idxs.length; t++) {
      const dist = 2 * (idxs[t + 2] - idxs[t])
      frames.push({ pythonLine: P('dist = 2'), phase: 'triple', activeLine: L('const dist'), left: idxs[t], right: idxs[t + 2], group: idxs, best, ok: true, message: `Indices ${idxs[t]}, ${idxs[t + 1]}, ${idxs[t + 2]} give distance ${dist}.` })
      if (best === -1 || dist < best) {
        best = dist
        frames.push({ pythonLine: P('best = dist'), phase: 'update', activeLine: L('best = dist'), left: idxs[t], right: idxs[t + 2], group: idxs, best, ok: true, message: `Best distance is now ${best}.` })
      }
    }
  }
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: L('return best'), left: -1, right: -1, best, ok: best !== -1, message: best === -1 ? 'No value appears three times.' : `The minimum distance is ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `function minimumDistance(nums) {
  const positions = new Map()
  nums.forEach((value, idx) => {
    if (!positions.has(value)) positions.set(value, [])
    positions.get(value).push(idx)
  })
  let best = -1
  for (const idxs of positions.values()) {
    for (let t = 0; t + 2 < idxs.length; t++) {
      const dist = 2 * (idxs[t + 2] - idxs[t])
      if (best === -1 || dist < best) best = dist
    }
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
