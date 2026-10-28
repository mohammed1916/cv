export function parseInput(text) {
  const input = JSON.parse(text)
  const { bottom, top, special } = input ?? {}
  if (!Number.isInteger(bottom) || !Number.isInteger(top) || bottom < 1 || top < bottom) throw new Error('Use integers with 1 <= bottom <= top.')
  if (top - bottom > 60) throw new Error('The visualization caps the floor range at 61 floors.')
  if (!Array.isArray(special) || special.length > 12) throw new Error('special is a list of at most 12 floors.')
  if (special.some(f => !Number.isInteger(f) || f < bottom || f > top)) throw new Error('Every special floor must lie between bottom and top.')
  if (new Set(special).size !== special.length) throw new Error('Special floors must be distinct.')
  return { bottom, top, special }
}

export function buildTrace(input) {
  const { bottom, top, special } = input
  const marks = [bottom - 1, ...[...special].sort((a, b) => a - b), top + 1]
  const frames = [{ phase: 'start', activeLine: L('sort the special floors'), from: null, to: null, best: 0, marks, message: `Marks at ${marks.join(', ')}, including sentinels just outside the range.` }]
  let best = 0
  for (let i = 0; i + 1 < marks.length; i++) {
    const left = marks[i]
    const right = marks[i + 1]
    const run = right - left - 1
    frames.push({ phase: 'gap', activeLine: L('set run length to'), from: left + 1, to: right - 1, run, best, marks, message: run > 0 ? `Floors ${left + 1} to ${right - 1} have no special floor: ${run} floor(s).` : `No floors lie between ${left} and ${right}.` })
    if (run > best) {
      best = run
      frames.push({ phase: 'better', activeLine: L('set best to run length'), from: left + 1, to: right - 1, run, best, marks, message: `${run} floor(s) is the longest run so far.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), from: null, to: null, best, marks, message: `Longest run of floors without a special floor: ${best}.` })
  return { input, result: best, frames }
}

export const code = `find the longest run of floors that contain no special floor
  sort the special floors and add bottom minus one and top plus one as sentinels at the ends
  set best to zero
  for each pair of neighbouring marks left and right
    set run length to right minus left minus one
    if run length is greater than best then set best to run length
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_consecutive_floors(bottom, top, special):
    marks = [bottom - 1] + sorted(special) + [top + 1]
    best = 0
    for left, right in zip(marks, marks[1:]):
        run = right - left - 1
        if run > best:
            best = run
    return best
`
