const lookup = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 values.')
  if (!nums.every(value => Number.isInteger(value) && value >= 0 && value <= 9)) throw new Error('nums values are digits from 0 to 9.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k is an integer from 1 to the length of nums.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const n = nums.length
  const L = text => lookup(code.map(line => line.text), text)
  const PY = text => lookup(python.split('\n'), text)
  const frames = []
  let best = null
  let bestStart = -1
  let bestTarget = null
  frames.push({ pythonLine: PY('best = None'), phase: 'start', activeLine: L('let best = Infinity'), start: -1, window: [], sorted: [],
    target: null, targetIndex: -1, cost: 0, index: -1, best, bestStart, bestTarget,
    message: `Look at every window of ${k} consecutive value${k === 1 ? '' : 's'}.` })
  for (let start = 0; start <= n - k; start++) {
    const window = nums.slice(start, start + k)
    frames.push({ pythonLine: PY('for start in range'), phase: 'window', activeLine: L('for (let start'), start, window, sorted: [],
      target: null, targetIndex: -1, cost: 0, index: -1, best, bestStart, bestTarget,
      message: `Window starts at ${start}: values [${window.join(', ')}].` })
    const sorted = [...window].sort((a, b) => a - b)
    const targetIndex = Math.floor(k / 2)
    const target = sorted[targetIndex]
    frames.push({ pythonLine: PY('target = sorted'), phase: 'median', activeLine: L('const target = sorted'), start, window, sorted,
      target, targetIndex, cost: 0, index: -1, best, bestStart, bestTarget,
      message: `Sorted window is [${sorted.join(', ')}]; the middle value ${target} is the target.` })
    let cost = 0
    window.forEach((x, index) => {
      cost += Math.abs(x - target)
      frames.push({ pythonLine: PY('cost += abs(x - target)'), phase: 'cost', activeLine: L('for (const x of window)'), start, window, sorted,
        target, targetIndex, cost, index, best, bestStart, bestTarget,
        message: `|${x} - ${target}| = ${Math.abs(x - target)}; cost for this window is now ${cost}.` })
    })
    if (best === null || cost < best) {
      best = cost
      bestStart = start
      bestTarget = target
      frames.push({ pythonLine: PY('if best is None or cost < best'), phase: 'record', activeLine: L('if (cost < best)'), start, window, sorted,
        target, targetIndex, cost, index: -1, best, bestStart, bestTarget,
        message: `Cost ${cost} beats the best so far; keep window ${start}.` })
    } else {
      frames.push({ pythonLine: PY('if best is None or cost < best'), phase: 'skip', activeLine: L('if (cost < best)'), start, window, sorted,
        target, targetIndex, cost, index: -1, best, bestStart, bestTarget,
        message: `Cost ${cost} does not beat the best ${best}.` })
    }
  }
  frames.push({ pythonLine: PY('return best'), phase: 'done', activeLine: L('return best;'), start: -1, window: [], sorted: [],
    target: bestTarget, targetIndex: -1, cost: best, index: -1, best, bestStart, bestTarget,
    message: `Minimum is ${best}, from the window starting at ${bestStart}.` })
  return { input: { nums, k }, result: best, frames }
}

// Code panel: real JavaScript for the window scan. Each window of k values is costed around its median.
export const code = [
  "function minOperations(nums, k) {",
  "  let best = Infinity;",
  "  for (let start = 0; start <= nums.length - k; start++) {",
  "    const window = nums.slice(start, start + k);",
  "    const sorted = [...window].sort((a, b) => a - b);",
  "    const target = sorted[Math.floor(k / 2)];",
  "    let cost = 0;",
  "    for (const x of window) cost += Math.abs(x - target);",
  "    if (cost < best) best = cost;",
  "  }",
  "  return best;",
  "}",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def min_operations(nums, k):
    best = None
    for start in range(len(nums) - k + 1):
        window = nums[start:start + k]
        target = sorted(window)[k // 2]
        cost = 0
        for x in window:
            cost += abs(x - target)
        if best is None or cost < best:
            best = cost
    return best
`
