export const phases = [
  { id: 'start', label: 'Start', description: 'Only the empty subset sum 0 is reachable.' },
  { id: 'stone', label: 'Add a stone', description: 'Each stone extends the reachable subset sums up to half the total.' },
  { id: 'choose', label: 'Best split', description: 'The largest reachable sum up to half the total gives the most even split.' },
  { id: 'done', label: 'Answer', description: 'Report the smallest possible final weight.' },
]

export const code = `function lastStoneWeightII(stones) {
  const total = stones.reduce((sum, v) => sum + v, 0)
  const half = Math.floor(total / 2)
  const reachable = Array(half + 1).fill(false)
  reachable[0] = true
  for (const s of stones) {
    for (let t = half; t >= s; t--) {
      if (reachable[t - s]) reachable[t] = true
    }
  }
  let best = half
  while (!reachable[best]) best--
  return total - 2 * best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const pythonLineMap = {}

export const python = `def last_stone_weight_ii(stones):
    total = sum(stones)
    half = total // 2
    reachable = [True] + [False] * half
    for s in stones:
        for t in range(half, s - 1, -1):
            if reachable[t - s]:
                reachable[t] = True
    best = max(t for t in range(half + 1) if reachable[t])
    return total - 2 * best
`

export function parseInput(text) {
  let arr
  try { arr = JSON.parse(text) } catch { throw new Error('Use a JSON array of stone weights, such as [5,3,9,4].') }
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 12) throw new Error('Give between 1 and 12 stones.')
  if (!arr.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each weight is an integer from 1 to 100.')
  return arr.slice()
}

export function buildTrace(input) {
  const total = input.reduce((sum, v) => sum + v, 0)
  const half = Math.floor(total / 2)
  const reachable = Array(half + 1).fill(false)
  reachable[0] = true
  const sums = () => reachable.flatMap((ok, t) => (ok ? [t] : []))
  const frames = [{ phase: 'start', activeLine: 2, pythonLine: 2, message: `Total weight is ${total}, so each group should aim near ${half}.`, snapshot: { total, half, stone: null, reachable: [...reachable], sums: sums() } }]
  for (const s of input) {
    for (let t = half; t >= s; t--) {
      if (reachable[t - s]) reachable[t] = true
    }
    frames.push({ phase: 'stone', activeLine: 8, pythonLine: 5, message: s > half ? `Stone ${s} is heavier than ${half}, so no new sums up to half appear.` : `Add stone ${s}: sums up to ${half} that use it are now reachable.`, snapshot: { total, half, stone: s, reachable: [...reachable], sums: sums() } })
  }
  const best = Math.max(...sums())
  frames.push({ phase: 'choose', activeLine: 12, pythonLine: 9, message: `The largest reachable sum up to ${half} is ${best}.`, snapshot: { total, half, stone: null, reachable: [...reachable], sums: sums(), best } })
  const result = total - 2 * best
  frames.push({ phase: 'done', activeLine: 13, pythonLine: 10, message: `The two groups differ by ${total} - 2 × ${best} = ${result}, which is the final weight.`, snapshot: { total, half, stone: null, reachable: [...reachable], sums: sums(), best } })
  return { input, result, frames }
}
