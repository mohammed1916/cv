export const phases = [
  { id: 'start', label: 'Setup', description: 'Zero survivors give zero fixed points.' },
  { id: 'consider', label: 'Consider', description: 'Read the next value in order.' },
  { id: 'update', label: 'Update', description: 'Extend each reachable survivor count.' },
  { id: 'done', label: 'Result', description: 'Report the best total.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use a JSON array of 1 to 12 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 12)) throw new Error('Each value is an integer from 0 to 12.')
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  let best = Array(n + 1).fill(-1)
  best[0] = 0
  const frames = [{ phase: 'start', activeLine: L('let best[k]'), pythonLine: P('best[0] = 0'), message: 'With no survivors, zero fixed points are secured. Other counts are not reachable yet.', position: -1, value: null, dp: best.slice(), hits: [] }]
  nums.forEach((value, position) => {
    frames.push({ phase: 'consider', activeLine: L('for each value in order'), pythonLine: P('for value in nums'), message: `Consider ${value} at original position ${position}.`, position, value, dp: best.slice(), hits: [] })
    const nxt = best.slice()
    const hits = []
    for (let k = 0; k < n; k++) {
      if (best[k] < 0) continue
      const gain = value === k ? 1 : 0
      if (gain) hits.push(k)
      nxt[k + 1] = Math.max(nxt[k + 1], best[k] + gain)
    }
    best = nxt
    const message = hits.length
      ? `Keeping ${value} as survivor number ${hits.join(' or ')} gives it a matching index.`
      : `${value} matches no reachable survivor count, so only deletion or plain keeping applies.`
    frames.push({ phase: 'update', activeLine: L('set nxt[k plus 1]'), pythonLine: P('nxt[k + 1] = max'), message, position, value, dp: best.slice(), hits })
  })
  const result = Math.max(...best)
  frames.push({ phase: 'done', activeLine: L('return the largest value'), pythonLine: P('return max(best)'), message: `The best number of fixed points is ${result}.`, position: -1, value: null, dp: best.slice(), hits: [] })
  return { input: { nums }, result, frames }
}

export const code = `maximum fixed points after deletions
  let best[k] be negative one for every k, except best[0] equal to zero
  for each value in order
    let nxt be a copy of best
    for each k with a reachable best[k]
      if value equals k then the gain is one, else zero
      set nxt[k plus 1] to the larger of itself and best[k] plus the gain
    set best to nxt
  return the largest value in best`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(line => line.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def max_fixed_points(nums):
    n = len(nums)
    best = [-1] * (n + 1)
    best[0] = 0
    for value in nums:
        nxt = best[:]
        for k in range(n):
            if best[k] < 0:
                continue
            gain = 1 if value == k else 0
            nxt[k + 1] = max(nxt[k + 1], best[k] + gain)
        best = nxt
    return max(best)`

const pyLines = python.split('\n')
const P = s => {
  const index = pyLines.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
