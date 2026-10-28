export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || !Number.isInteger(data.limit) || !Array.isArray(data.queries)) throw new Error('Use {"limit": n, "queries": [[ball, color], ...]}.')
  const { limit, queries } = data
  if (limit < 1 || limit > 20) throw new Error('limit is an integer from 1 to 20.')
  if (queries.length < 1 || queries.length > 30) throw new Error('Use 1 to 30 queries.')
  queries.forEach((q, i) => {
    if (!Array.isArray(q) || q.length !== 2 || !Number.isInteger(q[0]) || !Number.isInteger(q[1])) throw new Error(`Query ${i + 1} must be [ball, color] integers.`)
    if (q[0] < 0 || q[0] > limit) throw new Error(`Query ${i + 1}: balls are numbered 0 to limit.`)
    if (q[1] < 1 || q[1] > 20) throw new Error(`Query ${i + 1}: colors are integers from 1 to 20.`)
  })
  return { limit, queries }
}

export function buildTrace(input) {
  const { queries } = input
  const colorOf = new Map(), countOf = new Map()
  const results = []
  const frames = []
  const maps = () => [
    { name: 'colorOf', keyLabel: 'ball', valueLabel: 'color', isSet: false, entries: [...colorOf] },
    { name: 'countOf', keyLabel: 'color', valueLabel: 'balls', isSet: false, entries: [...countOf] },
  ]
  frames.push({ phase: 'start', activeLine: L('colorOf = empty map'), index: -1, maps: maps(), ops: [], result: [], message: 'Track each ball’s color and how many balls show each color. The number of colors with a nonzero count is the answer.' })
  queries.forEach(([ball, color], i) => {
    const ops = []
    if (colorOf.has(ball)) {
      const old = colorOf.get(ball)
      const left = countOf.get(old) - 1
      if (left === 0) countOf.delete(old)
      else countOf.set(old, left)
      ops.push({ map: 'countOf', type: left === 0 ? 'delete' : 'update', key: old, value: left, before: left + 1, existed: true })
      frames.push({ phase: 'repaint', activeLine: L('subtract one from countOf'), index: i, maps: maps(), ops: [...ops], result: [...results],
        message: `Ball ${ball} leaves color ${old}, which now has ${left} ball(s).` })
    }
    colorOf.set(ball, color)
    const before = countOf.get(color)
    countOf.set(color, (before ?? 0) + 1)
    ops.push({ map: 'colorOf', type: 'update', key: ball, value: color, before: undefined })
    ops.push({ map: 'countOf', type: before === undefined ? 'insert' : 'update', key: color, value: (before ?? 0) + 1, before })
    results.push(countOf.size)
    frames.push({ phase: 'paint', activeLine: L('add one to countOf of color'), index: i, maps: maps(), ops, result: [...results],
      message: `Ball ${ball} is painted ${color}. Distinct colors now: ${countOf.size}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return answers'), index: -1, maps: maps(), ops: [], result: [...results], message: `Distinct colors after each query: [${results.join(', ')}].` })
  return { input, result: results, frames }
}

export const code = `count distinct colors after each query
colorOf = empty map from ball to its color
countOf = empty map from color to how many balls show it
answers = empty list
for each query [ball, color]
  if ball has an old color then
    subtract one from countOf of the old color, removing it at zero
  set colorOf of ball to color
  add one to countOf of color
  append the number of colors in countOf to answers
return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def distinct_colors(limit, queries):
    color_of = {}
    count_of = {}
    answers = []
    for ball, color in queries:
        if ball in color_of:
            old = color_of[ball]
            count_of[old] -= 1
            if count_of[old] == 0:
                del count_of[old]
        color_of[ball] = color
        count_of[color] = count_of.get(color, 0) + 1
        answers.append(len(count_of))
    return answers
`
