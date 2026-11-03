export const phases = [
  { id: 'group', label: 'Group positions', description: 'Collect the sorted positions of each color.' },
  { id: 'search', label: 'Binary search', description: 'For each query, find the first position at or after the index, then check its neighbor on the left.' },
  { id: 'done', label: 'Complete', description: 'Return one distance per query.' },
]

const CODE = [
  'function nearestColorDistances(colors, queries):',
  '  positions = indices grouped by color',
  '  answers = []',
  '  for [index, color] in queries:',
  '    arr = positions[color], or empty',
  '    lo = 0, hi = len(arr)',
  '    while lo < hi:',
  '      mid = (lo + hi) / 2',
  '      if arr[mid] < index: lo = mid + 1',
  '      else: hi = mid',
  '    best = none',
  '    if lo < len(arr): best = arr[lo] - index',
  '    if lo > 0: best = closer(best, index - arr[lo-1])',
  '    answers.append(best, or -1 when none)',
  '  return answers',
]
const PY = [
  'def nearest_color_distances(colors, queries):',
  '    positions = group_indices(colors)',
  '    answers = []',
  '    for index, color in queries:',
  '        arr = positions.get(color, [])',
  '        lo, hi = 0, len(arr)',
  '        while lo < hi:',
  '            mid = (lo + hi) // 2',
  '            if arr[mid] < index:',
  '                lo = mid + 1',
  '            else:',
  '                hi = mid',
  '        best = None',
  '        if lo < len(arr): best = arr[lo] - index',
  '        if lo > 0: best = closer(best, index - arr[lo - 1])',
  '        answers.append(best if best is not None else -1)',
  '    return answers',
]

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n')

const L = { group: 2, query: 4, lookup: 5, bounds: 6, check: 7, mid: 8, right: 9, left: 10, none: 11, cand: 12, candLeft: 13, answer: 14, ret: 15 }
const P = { group: 2, query: 4, lookup: 5, bounds: 6, check: 7, mid: 8, right: 10, left: 12, none: 13, cand: 14, candLeft: 15, answer: 16, ret: 17 }

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"colors": [1, 2, 1], "queries": [[0, 2]]}.') }
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with colors and queries.')
  const { colors, queries } = input
  if (!Array.isArray(colors) || colors.length < 1 || colors.length > 30 || !colors.every(c => Number.isInteger(c) && c >= 1 && c <= 3)) {
    throw new Error('colors is a list of 1 to 30 values, each 1, 2 or 3.')
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 10) throw new Error('queries must hold 1 to 10 items.')
  queries.forEach((query, i) => {
    const [index, color] = Array.isArray(query) ? query : []
    if (!Number.isInteger(index) || index < 0 || index >= colors.length || ![1, 2, 3].includes(color)) {
      throw new Error(`Query ${i + 1} must be [index, color] with index from 0 to ${colors.length - 1} and color 1, 2 or 3.`)
    }
  })
  return { colors, queries }
}

export function buildTrace({ colors, queries }) {
  const frames = []
  const positions = new Map()
  colors.forEach((c, i) => {
    if (!positions.has(c)) positions.set(c, [])
    positions.get(c).push(i)
  })
  const answers = []
  const state = { colors, qIndex: null, index: null, color: null, arr: null, lo: null, hi: null, mid: null, best: null, answers }
  const push = (phase, key, message) => frames.push({
    phase, activeLine: L[key], pythonLine: P[key], message,
    snapshot: { ...state, answers: [...answers], arr: state.arr ? [...state.arr] : null },
  })

  const grouped = [...positions.keys()].sort((a, b) => a - b).map(c => `${c}: [${positions.get(c).join(', ')}]`).join('; ')
  push('group', 'group', `Group the positions by color, each list in increasing order: ${grouped}.`)

  queries.forEach(([index, color], q) => {
    const arr = positions.get(color) ?? []
    Object.assign(state, { qIndex: q, index, color, arr, lo: 0, hi: arr.length, mid: null, best: null })
    push('search', 'query', `Query ${q + 1}: find the color ${color} position nearest to index ${index}. There are ${arr.length} such positions.`)
    let lo = 0
    let hi = arr.length
    Object.assign(state, { lo, hi })
    push('search', 'bounds', `Search range is [${lo}, ${hi}) in the sorted list.`)
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      Object.assign(state, { lo, hi, mid })
      push('search', 'mid', `Middle entry is position ${arr[mid]}, compared with index ${index}.`)
      if (arr[mid] < index) {
        lo = mid + 1
        Object.assign(state, { lo })
        push('search', 'right', `${arr[mid]} is before index ${index}, so the first candidate is further right. lo becomes ${lo}.`)
      } else {
        hi = mid
        Object.assign(state, { hi })
        push('search', 'left', `${arr[mid]} is at or after index ${index}, so keep the left half. hi becomes ${hi}.`)
      }
    }
    Object.assign(state, { lo, hi, mid: null })
    let best = null
    if (lo < arr.length) {
      best = arr[lo] - index
      Object.assign(state, { best })
      push('search', 'cand', `The first position at or after index ${index} is ${arr[lo]}, at distance ${best}.`)
    }
    if (lo > 0) {
      const distance = index - arr[lo - 1]
      best = best === null ? distance : Math.min(best, distance)
      Object.assign(state, { best })
      push('search', 'candLeft', `The position just before it is ${arr[lo - 1]}, at distance ${distance}. The closer distance is ${best}.`)
    }
    if (best === null) push('search', 'none', `No position has color ${color}, so the answer is -1.`)
    answers.push(best ?? -1)
    Object.assign(state, { answers: [...answers] })
    push('search', 'answer', `Answer for query ${q + 1}: ${best ?? -1}.`)
  })

  push('done', 'ret', `All answers in query order: [${answers.join(', ')}].`)
  return { input: { colors, queries }, result: answers, frames }
}
