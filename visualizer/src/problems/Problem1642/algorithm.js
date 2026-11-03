export const phases = [
  { id: 'start', label: 'Start at building 1', description: 'Begin on the first building with all bricks and ladders available.' },
  { id: 'step', label: 'Look ahead', description: 'Moving down or staying level costs nothing, so only an upward step needs a tool.' },
  { id: 'climb', label: 'Assign a ladder', description: 'Each upward climb first takes a ladder. Keep the climbs sorted by size.' },
  { id: 'spend', label: 'Pay bricks', description: 'When climbs outnumber ladders, the smallest climb so far is paid with bricks.' },
  { id: 'stop', label: 'Out of bricks', description: 'If the bricks go negative, the last step cannot be made. Stay on the current building.' },
  { id: 'done', label: 'Furthest reached', description: 'Return the furthest building index reached.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.heights)) throw new Error('Enter a JSON object with "heights", "bricks" and "ladders".')
  const { heights, bricks, ladders } = data
  if (heights.length < 1 || heights.length > 30 || !heights.every(h => Number.isInteger(h) && h >= 0 && h <= 1000)) {
    throw new Error('heights must hold 1–30 integers from 0 to 1000.')
  }
  if (!Number.isInteger(bricks) || bricks < 0 || bricks > 1000) throw new Error('bricks must be an integer from 0 to 1000.')
  if (!Number.isInteger(ladders) || ladders < 0 || ladders > 30) throw new Error('ladders must be an integer from 0 to 30.')
  return { heights, bricks, ladders }
}

export function buildTrace({ heights, bricks, ladders }) {
  const frames = []
  let remaining = bricks
  let reached = 0
  let climbs = []
  const snap = (current, extra = {}) => ({ heights: [...heights], current, bricks: remaining, ladders, climbs: [...climbs], reached, ...extra })
  frames.push({ phase: 'start', activeLine: 2, message: `Start on building 1 with ${bricks} bricks and ${ladders} ladders.`, snapshot: snap(0) })

  for (let i = 0; i < heights.length - 1; i++) {
    const d = heights[i + 1] - heights[i]
    if (d <= 0) {
      reached = i + 1
      frames.push({ phase: 'step', activeLine: 5, message: `Building ${i + 2} is not higher, so the move is free.`, snapshot: snap(i + 1) })
      continue
    }
    climbs.push(d)
    climbs.sort((a, b) => a - b)
    frames.push({ phase: 'climb', activeLine: 6, message: `Climb of ${d} from building ${i + 1} to building ${i + 2}. It joins the climbs that need a tool.`, snapshot: snap(i, { pending: d }) })
    if (climbs.length > ladders) {
      const cost = climbs.shift()
      remaining -= cost
      frames.push({
        phase: 'spend', activeLine: 8,
        message: `${climbs.length + 1} climbs for ${ladders} ladder${ladders === 1 ? '' : 's'}. The smallest one, ${cost}, is paid with bricks. ${remaining} bricks left.`,
        snapshot: snap(i, { paid: cost }),
      })
      if (remaining < 0) {
        frames.push({ phase: 'stop', activeLine: 9, message: `Bricks are negative, so the move to building ${i + 2} is impossible. Stay on building ${i + 1}.`, snapshot: snap(i, { stopped: true }) })
        return finish(i)
      }
    }
    reached = i + 1
  }
  return finish(reached)

  function finish(result) {
    frames.push({ phase: 'done', activeLine: 10, message: `Return ${result}: the furthest building index reached.`, snapshot: snap(result, { reached: result }) })
    return { input: { heights, bricks, ladders }, result, frames }
  }
}

const LINES = [
  'def furthest_building(heights, bricks, ladders):',
  '    climbs = []                          # min-heap of climbs paid with bricks',
  '    for i in range(len(heights) - 1):',
  '        d = heights[i + 1] - heights[i]',
  '        if d <= 0: continue              # free move',
  '        heappush(climbs, d)',
  '        if len(climbs) > ladders:',
  '            bricks -= heappop(climbs)',
  '            if bricks < 0: return i',
  '    return len(heights) - 1',
]
export const code = LINES.map((text, index) => ({ line: index + 1, text }))
export const python = LINES.join('\n')
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10 }
