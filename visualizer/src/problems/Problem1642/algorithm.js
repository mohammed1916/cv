// Furthest building: climbs are covered by bricks, except the largest climbs seen so far, which use the ladders.
const JS_LINES = [
  { text: 'const heap = []', py: 'heap = []' },
  { text: 'for (let i = 0; i < heights.length - 1; i++) {', py: 'for i in range' },
  { text: 'const diff = heights[i + 1] - heights[i]', py: 'diff = heights' },
  { text: 'if (diff <= 0) continue', py: 'if diff <= 0' },
  { text: 'heap.push(diff); heap.sort((a, b) => a - b)', py: 'heapq.heappush' },
  { text: 'if (heap.length > ladders) bricks -= heap.shift()', py: 'bricks -= heapq.heappop' },
  { text: 'if (bricks < 0) return i', py: 'if bricks < 0' },
  { text: '}', py: null },
  { text: 'return heights.length - 1', py: 'return len(heights)' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `import heapq

def furthestBuilding(heights, bricks, ladders):
    heap = []
    for i in range(len(heights) - 1):
        diff = heights[i + 1] - heights[i]
        if diff <= 0:
            continue
        heapq.heappush(heap, diff)
        if len(heap) > ladders:
            bricks -= heapq.heappop(heap)
        if bricks < 0:
            return i
    return len(heights) - 1
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return len(heights)')]))

export const phases = [
  { id: 'start', label: 'Start', description: 'Stand on building 0 with all bricks and ladders available.' },
  { id: 'climb', label: 'Climb', description: 'A climb is the rise to the next building. Downhill moves cost nothing.' },
  { id: 'ladder', label: 'Ladder', description: 'The ladders go to the largest climbs so far; a climb that loses its ladder pays bricks.' },
  { id: 'stop', label: 'Stop', description: 'Bricks went negative: the current building is as far as we can reach.' },
  { id: 'done', label: 'Result', description: 'All the climbs were covered: the last building is reached.' },
]

export const examples = [
  { label: 'Ladder on the big climb', input: '{"heights":[4,6,3,9,5],"bricks":3,"ladders":1}' },
  { label: 'No ladders', input: '{"heights":[1,3,6,6,9],"bricks":4,"ladders":0}' },
  { label: 'Flat ground', input: '{"heights":[2,2,2],"bricks":0,"ladders":0}' },
]

export const complexity = 'O(n log n) time for n buildings (the heap is kept sorted in this visual). Space is O(n).'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.heights) || !Number.isInteger(input.bricks) || !Number.isInteger(input.ladders)) throw new Error('Use an object with heights, bricks and ladders.')
  const { heights, bricks, ladders } = input
  if (heights.length < 1 || heights.length > 12) throw new Error('heights has 1 to 12 buildings (visual cap).')
  if (!heights.every(h => Number.isInteger(h) && h >= 1 && h <= 20)) throw new Error('Heights are integers from 1 to 20.')
  if (bricks < 0 || bricks > 30) throw new Error('bricks is from 0 to 30.')
  if (ladders < 0 || ladders > 10) throw new Error('ladders is from 0 to 10.')
  return { heights, bricks, ladders }
}

export function buildTrace({ heights, bricks, ladders }) {
  const frames = []
  const heap = []
  let left = bricks
  const snap = extra => ({ heap: [...heap], bricks: left, ladders, ...extra })
  frames.push({ phase: 'start', activeLine: 1, index: 0, message: `On building 0 with ${bricks} bricks and ${ladders} ladders.`, snapshot: snap({}) })
  let result = heights.length - 1
  for (let i = 0; i < heights.length - 1; i++) {
    const diff = heights[i + 1] - heights[i]
    if (diff <= 0) {
      frames.push({ phase: 'climb', activeLine: 4, index: i + 1, diff, message: `Step from ${heights[i]} down to ${heights[i + 1]}: no climb.`, snapshot: snap({}) })
      continue
    }
    heap.push(diff)
    heap.sort((a, b) => a - b)
    frames.push({ phase: 'climb', activeLine: 5, index: i + 1, diff, message: `Climb of ${diff} to building ${i + 1}; it joins the set of climbs.`, snapshot: snap({ current: diff }) })
    if (heap.length > ladders) {
      const bricksUsed = heap.shift()
      left -= bricksUsed
      frames.push({ phase: 'ladder', activeLine: 6, index: i + 1, diff: bricksUsed, message: `No ladder left for the smallest climb: pay ${bricksUsed} bricks, ${left} left.`, snapshot: snap({ paid: bricksUsed }) })
    } else {
      frames.push({ phase: 'ladder', activeLine: 6, index: i + 1, diff, message: `A ladder covers this climb; bricks stay at ${left}.`, snapshot: snap({}) })
    }
    if (left < 0) {
      result = i
      frames.push({ phase: 'stop', activeLine: 7, index: i, message: `Bricks are negative: the furthest building is ${i}.`, snapshot: snap({}) })
      break
    }
  }
  frames.push({ phase: 'done', activeLine: 9, index: result, result, message: `Furthest building is ${result}.`, snapshot: snap({ result }) })
  return { input: { heights, bricks, ladders }, result, frames }
}
