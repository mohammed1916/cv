// LeetCode 2604: Minimum Time to Eat All Grains.
// Hens and grains sit on a line. Each hen moves at unit speed and eats any grain it reaches.
// Binary search the time t. For a fixed t, hens in sorted order each take the longest
// run of the remaining sorted grains they can finish within t. t works when every grain is taken.
// Visualization caps: 1 to 6 hens, 0 to 8 grains, positions 0 to 30. The draft gives no official bound.

const MAX_HENS = 6
const MAX_GRAINS = 8
const MAX_POSITION = 30

const CODE_LINES = [
  'function minTimeToEatAll(hens, grains) {',
  '  const H = [...hens].sort((x, y) => x - y), G = [...grains].sort((x, y) => x - y)',
  '  if (G.length === 0) return 0',
  '  let low = 0, high = 2 * Math.max(...H, ...G)',
  '  while (low < high) {',
  '    const mid = Math.floor((low + high) / 2)',
  '    if (canFinish(mid)) high = mid; else low = mid + 1',
  '  }',
  '  return low',
  '}',
  'function canFinish(t) {',
  '  let next = 0',
  '  for (const hen of H) {',
  '    let end = next; while (end < G.length && cost(hen, G[next], G[end]) <= t) end++; next = end',
  '  }',
  '  return next === G.length',
  '}',
  'function cost(hen, a, b) {',
  '  if (hen <= a) return b - hen',
  '  if (hen >= b) return hen - a',
  '  return Math.min(2 * (hen - a) + (b - hen), 2 * (b - hen) + (hen - a))',
  '}',
]

const PYTHON_LINES = [
  'class Solution:',
  '    def minTimeToEatAll(self, hens, grains):',
  '        hens = sorted(hens)',
  '        grains = sorted(grains)',
  '        if not grains:',
  '            return 0',
  '        def cost(hen, a, b):',
  '            if hen <= a:',
  '                return b - hen',
  '            if hen >= b:',
  '                return hen - a',
  '            return min(2 * (hen - a) + (b - hen), 2 * (b - hen) + (hen - a))',
  '        def can_finish(t):',
  '            nxt = 0',
  '            for hen in hens:',
  '                end = nxt',
  '                while end < len(grains) and cost(hen, grains[nxt], grains[end]) <= t:',
  '                    end += 1',
  '                nxt = end',
  '            return nxt == len(grains)',
  '        low, high = 0, 2 * max(hens + grains)',
  '        while low < high:',
  '            mid = (low + high) // 2',
  '            if can_finish(mid):',
  '                high = mid',
  '            else:',
  '                low = mid + 1',
  '        return low',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    data = json.loads(sys.stdin.read())',
  '    print(Solution().minTimeToEatAll(data["hens"], data["grains"]))',
]

const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
const python = PYTHON_LINES.join('\n') + '\n'

function L(text) {
  const index = CODE_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}

function P(text) {
  const index = PYTHON_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing Python line: ${text}`)
  return index + 1
}

const phases = [
  { id: 'setup', label: 'Read positions', description: 'Sort hens and grains and bound the answer.' },
  { id: 'search', label: 'Pick a time', description: 'Test the middle time of the remaining range.' },
  { id: 'assign', label: 'Hens take runs', description: 'Each hen in order takes the longest run it can finish in time.' },
  { id: 'decide', label: 'Narrow range', description: 'Keep the time if every grain was taken, otherwise raise the floor.' },
  { id: 'done', label: 'Answer', description: 'The smallest feasible time.' },
]

const pythonLineMap = { 1: 1, 2: 3, 3: 5, 4: 22, 5: 22, 6: 23, 7: 24, 8: 28, 9: 13, 10: 14, 11: 15, 12: 17, 13: 20, 14: 7, 15: 8, 16: 10, 17: 12 }

export { code, python, phases, pythonLineMap }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with hens and grains.')
  const { hens, grains } = input
  const isPosition = value => Number.isInteger(value) && value >= 0 && value <= MAX_POSITION
  if (!Array.isArray(hens) || hens.length < 1 || hens.length > MAX_HENS || !hens.every(isPosition)) {
    throw new Error(`hens is a list of 1 to ${MAX_HENS} integer positions from 0 to ${MAX_POSITION}.`)
  }
  if (!Array.isArray(grains) || grains.length > MAX_GRAINS || !grains.every(isPosition)) {
    throw new Error(`grains is a list of 0 to ${MAX_GRAINS} integer positions from 0 to ${MAX_POSITION}.`)
  }
  return { hens: [...hens], grains: [...grains] }
}

// Time for one hen at position hen to eat every grain between a and b (a <= b), walking one unit per second.
export function walkCost(hen, a, b) {
  if (hen <= a) return b - hen
  if (hen >= b) return hen - a
  return Math.min(2 * (hen - a) + (b - hen), 2 * (b - hen) + (hen - a))
}

export function buildTrace({ hens, grains }) {
  const H = [...hens].sort((x, y) => x - y)
  const G = [...grains].sort((x, y) => x - y)
  const frames = []
  const snapshot = (extra) => ({ hens: H, grains: G, lo: null, hi: null, mid: null, segments: [], feasible: null, current: null, ...extra })

  frames.push({ phase: 'setup', activeLine: L('const H = [...hens]'), pythonLine: P('hens = sorted(hens)'), message: `Sorted ${H.length} hen${H.length === 1 ? '' : 's'} and ${G.length} grain${G.length === 1 ? '' : 's'}.`, view: snapshot({}) })
  if (G.length === 0) {
    frames.push({ phase: 'done', activeLine: L('if (G.length === 0) return 0'), pythonLine: P('return 0'), message: 'No grains, so the answer is 0.', view: snapshot({ answer: 0 }) })
    return { input: { hens, grains }, result: 0, frames }
  }

  let lo = 0
  let hi = 2 * Math.max(...H, ...G)
  frames.push({ phase: 'setup', activeLine: L('let low = 0, high'), pythonLine: P('low, high = 0, 2 * max'), message: `Any answer lies between 0 and ${hi}: one hen can walk to one end and then the other.`, view: snapshot({ lo, hi }) })

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    frames.push({ phase: 'search', activeLine: L('while (low < high)'), pythonLine: P('while low < high'), message: `Range ${lo} to ${hi}. Try time ${mid}.`, view: snapshot({ lo, hi, mid }) })
    frames.push({ phase: 'search', activeLine: L('const mid = Math.floor'), pythonLine: P('mid = (low + high)'), message: `Test whether every grain can be eaten by time ${mid}.`, view: snapshot({ lo, hi, mid }) })

    const segments = []
    let next = 0
    for (let k = 0; k < H.length; k++) {
      const hen = H[k]
      let end = next
      while (end < G.length && walkCost(hen, G[next], G[end]) <= mid) end++
      const cost = end > next ? walkCost(hen, G[next], G[end - 1]) : null
      segments.push({ hen: k, position: hen, start: next, end, cost })
      const took = end - next
      const blocker = end < G.length ? G[end] : null
      const why = took === 0
        ? `Hen ${k + 1} at ${hen} cannot reach grain ${G[next] ?? '-'} within ${mid}.`
        : `Hen ${k + 1} at ${hen} takes grains ${G.slice(next, end).join(', ')} in ${cost} unit${cost === 1 ? '' : 's'}.`
      frames.push({ phase: 'assign', activeLine: L('let end = next'), pythonLine: P('while end < len(grains)'), message: why + (blocker !== null ? ` Grain ${blocker} is too far.` : ''), view: snapshot({ lo, hi, mid, segments: segments.slice(), current: k, feasible: null }) })
      next = end
    }
    const feasible = next === G.length
    frames.push({ phase: 'assign', activeLine: L('return next === G.length'), pythonLine: P('return nxt == len(grains)'), message: feasible ? `All ${G.length} grains are taken: time ${mid} works.` : `${G.length - next} grain${G.length - next === 1 ? '' : 's'} left uneaten: time ${mid} fails.`, view: snapshot({ lo, hi, mid, segments: segments.slice(), current: null, feasible }) })

    if (feasible) hi = mid
    else lo = mid + 1
    frames.push({ phase: 'decide', activeLine: L('if (canFinish(mid))'), pythonLine: P(feasible ? 'high = mid' : 'low = mid + 1'), message: feasible ? `Time ${mid} works, so the answer is at most ${mid}.` : `Time ${mid} fails, so the answer is above ${mid}.`, view: snapshot({ lo, hi, mid: null, segments: segments.slice(), feasible }) })
  }

  frames.push({ phase: 'done', activeLine: L('return low'), pythonLine: P('return low'), message: `The smallest working time is ${lo}.`, view: snapshot({ lo, hi, answer: lo }) })
  return { input: { hens, grains }, result: lo, frames }
}
