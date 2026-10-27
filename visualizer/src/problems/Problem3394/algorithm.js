export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n and rectangles.')
  const { n, rectangles } = data
  if (!Number.isInteger(n) || n < 2 || n > 12) throw new Error('n is an integer from 2 to 12.')
  if (!Array.isArray(rectangles) || rectangles.length < 1 || rectangles.length > 12) throw new Error('rectangles must be an array of 1 to 12 entries.')
  for (const r of rectangles) {
    if (!Array.isArray(r) || r.length !== 4 || !r.every(v => Number.isInteger(v))) throw new Error('Each rectangle is [startX, startY, endX, endY] with integers.')
    const [x1, y1, x2, y2] = r
    if (x1 < 0 || x1 >= x2 || x2 > n || y1 < 0 || y1 >= y2 || y2 > n) throw new Error('Each rectangle needs 0 <= start < end <= n on both axes.')
  }
  return { n, rectangles }
}

const AXIS = ['x', 'y']

export function buildTrace(input) {
  const { n, rectangles } = input
  const frames = [{ phase: 'start', activeLine: L('can the grid be cut'), axis: null, spans: [], groups: 0, reach: null, message: `Look for two parallel cuts that split the ${n} by ${n} grid into three sections.` }]

  // Rectangles are grouped by overlapping spans on one axis; a new group starts where no rectangle crosses the boundary.
  const sections = axis => {
    const spans = rectangles.map(r => ({ start: r[axis], end: r[axis + 2], group: null }))
      .sort((a, b) => a.start - b.start || a.end - b.end)
    const copy = () => spans.map(s => ({ ...s }))
    frames.push({ phase: 'sort', activeLine: L('sort the rectangles'), axis: AXIS[axis], spans: copy(), groups: 0, reach: -1, message: `Sort the rectangles by their ${AXIS[axis]} start.` })
    let groups = 0
    let reach = -1
    for (const span of spans) {
      let message
      if (span.start >= reach) {
        groups++
        reach = span.end
        message = `Span ${span.start} to ${span.end} starts a new section, ${groups}.`
      } else {
        reach = Math.max(reach, span.end)
        message = `Span ${span.start} to ${span.end} overlaps the current section.`
      }
      span.group = groups
      frames.push({ phase: 'group', activeLine: L('if its start is at least reach'), axis: AXIS[axis], spans: copy(), groups, reach, message })
    }
    frames.push({ phase: 'axis', activeLine: L('return true if groups'), axis: AXIS[axis], spans: copy(), groups, reach, message: `${groups} section${groups === 1 ? '' : 's'} along ${AXIS[axis]}.` })
    return groups >= 3
  }

  const byX = sections(0)
  const byY = sections(1)
  const result = byX || byY
  frames.push({ phase: 'done', activeLine: L('return true if the grid'), axis: null, spans: [], groups: 0, reach: null, message: result ? 'Two parallel cuts give three sections.' : 'No pair of parallel cuts works.' })
  return { input, result, frames }
}

export const code = `can the grid be cut into three sections
  return true if the grid can be cut along x or along y

sections along one axis
  sort the rectangles by their start on that axis
  set groups to 0 and reach to -1
  for each rectangle in that order
    if its start is at least reach then add 1 to groups and set reach to its end
    otherwise set reach to the larger of reach and its end
  return true if groups is at least 3`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def can_cut(n, rectangles):
    def three_sections(axis):
        spans = sorted((rect[axis], rect[axis + 2]) for rect in rectangles)
        groups = 0
        reach = -1
        for start, end in spans:
            if start >= reach:
                groups += 1
                reach = end
            else:
                reach = max(reach, end)
        return groups >= 3

    return three_sections(0) or three_sections(1)
`
