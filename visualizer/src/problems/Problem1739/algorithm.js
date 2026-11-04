export function parseInput(text) {
  const value = Number(String(text).trim())
  if (!Number.isInteger(value) || value < 1 || value > 1000000000) throw new Error('Use a whole number of boxes from 1 to 1000000000.')
  return { n: value }
}

const total = m => m * (m + 1) * (m + 2) / 6

export function buildTrace({ n }) {
  const frames = []
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('find the largest m'), m: 0, remaining: n, floor: 0, extra: 0, result: null, message: `Place ${n} boxes; find the largest full pyramid that fits.` })
  let m = 0
  while (total(m + 1) <= n) {
    m++
    frames.push({ pythonLine: 4, phase: 'pyramid', activeLine: L('find the largest m'), m, remaining: n - total(m), floor: m * (m + 1) / 2, extra: 0, result: null, message: `A pyramid of height ${m} uses ${total(m)} boxes and ${m * (m + 1) / 2} floor boxes.` })
  }
  let remaining = n - total(m)
  const floor = m * (m + 1) / 2
  frames.push({ pythonLine: 5, phase: 'leftover', activeLine: L('remaining = n minus'), m, remaining, floor, extra: 0, result: null, message: `${remaining} boxes are left over after the full pyramid.` })
  let extra = 0
  while (remaining > 0) {
    extra++
    remaining -= extra
    frames.push({ pythonLine: 9, phase: 'extra', activeLine: L('extra = extra plus 1'), m, remaining, floor, extra, result: null, message: `Add floor box ${extra}; ${remaining > 0 ? remaining + ' boxes still need room.' : 'the leftover boxes now fit.'}` })
  }
  const result = floor + extra
  frames.push({ pythonLine: 11, phase: 'done', activeLine: L('return floor plus extra'), m, remaining, floor, extra, result, message: `At least ${result} boxes must touch the floor.` })
  return { input: { n }, result, frames }
}

export const code = `export function minimumFloorBoxes(n) {
  let m = 0 // find the largest m with a full pyramid of m layers holding at most n boxes
  while ((m + 1) * (m + 2) * (m + 3) / 6 <= n) m++
  let remaining = n - m * (m + 1) * (m + 2) / 6 // remaining = n minus that pyramid size
  const floor = m * (m + 1) / 2
  let extra = 0
  while (remaining > 0) {
    extra += 1 // extra = extra plus 1
    remaining -= extra
  }
  return floor + extra // return floor plus extra
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_floor_boxes(n):
    m = 0
    while (m + 1) * (m + 2) * (m + 3) // 6 <= n:
        m += 1
    remaining = n - m * (m + 1) * (m + 2) // 6
    floor = m * (m + 1) // 2
    extra = 0
    while remaining > 0:
        extra += 1
        remaining -= extra
    return floor + extra
`
