export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.heights) || input.heights.length < 1 || input.heights.length > 10) throw new Error('heights holds 1 to 10 buildings.')
  if (!input.heights.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('Each height is an integer from 1 to 20.')
  if (!Array.isArray(input.queries) || input.queries.length < 1 || input.queries.length > 6) throw new Error('queries holds 1 to 6 pairs.')
  const n = input.heights.length
  if (!input.queries.every(q => Array.isArray(q) && q.length === 2 && q.every(v => Number.isInteger(v) && v >= 0 && v < n))) throw new Error('Each query is [a, b] with building indices in range.')
  return { heights: input.heights, queries: input.queries }
}

export const code = `function leftmostBuildingQueries(heights, queries) {
  return queries.map(([a, b]) => {
    if (a > b) [a, b] = [b, a]
    if (a === b || heights[a] < heights[b]) return b
    const need = heights[a]
    for (let j = b + 1; j < heights.length; j++) {
      if (heights[j] > need) return j
    }
    return -1
  })
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def leftmost_building_queries(heights, queries):
    answers = []
    for a, b in queries:
        if a > b:
            a, b = b, a
        if a == b or heights[a] < heights[b]:
            answers.append(b)
            continue
        need = heights[a]
        found = -1
        for j in range(b + 1, len(heights)):
            if heights[j] > need:
                found = j
                break
        answers.append(found)
    return answers
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

// Alice starts at a and Bob at b (a <= b after sorting). Frames track both pointers and the scan from b rightward.
export function buildTrace({ heights, queries }) {
  const n = heights.length
  const frames = []
  const answers = []
  frames.push({ phase: 'start', activeLine: CL('return queries.map'), pythonLine: PL('answers = []'), heights, l: -1, r: -1, need: null, scan: -1, answers: [], query: -1, message: 'Each query asks for the leftmost building both can reach.' })
  queries.forEach(([x, y], q) => {
    let a = x, b = y
    if (a > b) [a, b] = [b, a]
    frames.push({ phase: 'query', activeLine: CL('if (a > b)'), pythonLine: PL('if a > b:'), heights, l: a, r: b, need: null, scan: -1, answers: [...answers], query: q, message: `Query ${q}: Alice at ${a} (height ${heights[a]}), Bob at ${b} (height ${heights[b]}).` })
    if (a === b || heights[a] < heights[b]) {
      answers.push(b)
      frames.push({ phase: 'direct', activeLine: CL('if (a === b'), pythonLine: PL('answers.append(b)'), heights, l: a, r: b, need: null, scan: -1, answers: [...answers], query: q, message: `${a === b ? 'Both start at the same building' : `Bob's building ${b} is taller, so Alice jumps there`}; answer ${b}.` })
      return
    }
    const need = heights[a]
    let found = -1
    for (let j = b + 1; j < n; j++) {
      frames.push({ phase: 'scan', activeLine: CL('for (let j = b + 1'), pythonLine: PL('for j in range(b + 1'), heights, l: a, r: b, need, scan: j, answers: [...answers], query: q, message: `Check building ${j} (height ${heights[j]}) against the threshold ${need}.` })
      if (heights[j] > need) { found = j; break }
    }
    answers.push(found)
    frames.push({ phase: 'found', activeLine: CL('return -1'), pythonLine: PL('answers.append(found)'), heights, l: a, r: b, need, scan: found, answers: [...answers], query: q, message: found >= 0 ? `Building ${found} is the first taller than ${need}; answer ${found}.` : `No building after ${b} is taller than ${need}; answer -1.` })
  })
  frames.push({ phase: 'done', activeLine: CL('return queries.map'), pythonLine: PL('return answers'), heights, l: -1, r: -1, need: null, scan: -1, answers: [...answers], query: -1, result: [...answers], message: 'Every query is answered.' })
  return { input: { heights, queries }, result: [...answers], frames }
}
