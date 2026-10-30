const CODE = [
  "FUNCTION minGroups(nums)",
  "    counts ← occurrence count of each distinct value",
  "    m ← smallest count",
  "    best ← infinity",
  "    FOR each group size s from m down to 1",
  "        groups ← 0, possible ← true",
  "        FOR each count c",
  "            t ← ceil(c / (s + 1))",
  "            IF t * s > c, possible ← false",
  "            groups ← groups + t",
  "        IF possible, best ← min(best, groups)",
  "    RETURN best",
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = `from collections import Counter
def minGroups(nums):
    counts = list(Counter(nums).values())
    smallest = min(counts)
    best = float('inf')
    for s in range(smallest, 0, -1):
        groups = 0
        possible = True
        for c in counts:
            t = -(-c // (s + 1))
            if t * s > c:
                possible = False
                break
            groups += t
        if possible:
            best = min(best, groups)
    return best
`

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Input must be a JSON object such as {"nums": [3,2,3,2,3]}') }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object with key nums')
  const { nums } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 50) throw new Error('nums must be an array of 1 to 50 integers for the visualization')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 1000000000)) throw new Error('each nums value must be an integer from 1 to 1000000000')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  const counts = [...nums.reduce((map, v) => map.set(v, (map.get(v) || 0) + 1), new Map()).values()]
  const smallest = Math.min(...counts)
  let best = Infinity
  const emit = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, values: counts, active: -1, marks: {},
    summary: `size s = ${extra.s ?? '-'} · best ${best === Infinity ? '∞' : best}`, ...extra,
  })
  emit('count', 2, 3, `counts per distinct value: [${counts.join(', ')}]`)
  emit('count', 3, 4, `smallest count m = ${smallest}`)
  emit('try', 4, 5, 'best starts at infinity')
  for (let s = smallest; s >= 1; s--) {
    emit('try', 5, 6, `try group size s = ${s}`, { s })
    let groups = 0
    let possible = true
    for (let idx = 0; idx < counts.length; idx++) {
      const c = counts[idx]
      const t = Math.ceil(c / (s + 1))
      emit('split', 7, 9, `count ${c}: t = ceil(${c} / ${s + 1}) = ${t}`, { s, active: idx, marks: { [idx]: 'current' } })
      if (t * s > c) {
        possible = false
        emit('split', 8, 11, `size ${s} impossible for count ${c}`, { s, active: idx, marks: { [idx]: 'blocked' } })
        break
      }
      groups += t
      emit('split', 9, 14, `groups so far ${groups}`, { s, active: idx, marks: { [idx]: 'filled' } })
    }
    if (possible) {
      best = Math.min(best, groups)
      emit('record', 10, 16, `size ${s} works with ${groups} groups; best ${best}`, { s })
    }
  }
  emit('result', 11, 17, `return ${best}`)
  return { input: { nums }, result: best, frames }
}
