// Knowledge-derived model: take one land ride and one water ride, in either order. The second ride starts at the later
// of its own opening time and the moment the first ride ends, and the answer is the earliest finish over all choices.
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with land and water.')
  const { land, water } = input
  for (const [name, list] of [['land', land], ['water', water]]) {
    if (!Array.isArray(list) || list.length < 1 || list.length > 6) throw new Error(`${name} has 1 to 6 rides.`)
    for (const ride of list) {
      if (!Array.isArray(ride) || ride.length !== 2 || !ride.every(v => Number.isInteger(v) && v >= 0 && v <= 100)) {
        throw new Error(`Each ${name} ride is [opening time, duration] with integers from 0 to 100.`)
      }
      if (ride[1] < 1) throw new Error('A ride lasts at least 1.')
    }
  }
  return { land, water }
}

export function buildTrace({ land, water }) {
  const frames = []
  let best = Infinity
  let bestPair = null
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('set best to infinity'), order: null, a: -1, b: -1, finish: null, best: null, message: 'Nothing is chosen yet; the best finish starts at infinity.' })
  for (let a = 0; a < land.length; a++) {
    for (let b = 0; b < water.length; b++) {
      const end = land[a][0] + land[a][1]
      const finish = Math.max(end, water[b][0]) + water[b][1]
      if (finish < best) { best = finish; bestPair = { order: 'land-first', a, b } }
      frames.push({ pythonLine: 5, phase: 'land', activeLine: L('finish is the later of land'), order: 'land-first', a, b, finish, best, message: `Land ${a} then water ${b}: finish ${finish}.` })
    }
  }
  for (let b = 0; b < water.length; b++) {
    for (let a = 0; a < land.length; a++) {
      const end = water[b][0] + water[b][1]
      const finish = Math.max(end, land[a][0]) + land[a][1]
      if (finish < best) { best = finish; bestPair = { order: 'water-first', a, b } }
      frames.push({ pythonLine: 8, phase: 'water', activeLine: L('finish is the later of water'), order: 'water-first', a, b, finish, best, message: `Water ${b} then land ${a}: finish ${finish}.` })
    }
  }
  frames.push({ pythonLine: 9, phase: 'done', activeLine: L('return best'), order: bestPair?.order ?? null, a: bestPair?.a ?? -1, b: bestPair?.b ?? -1, finish: best, best, message: `Earliest finish is ${best}.` })
  return { input: { land, water }, result: best, bestPair, frames }
}

export const code = `earliest finish with one land ride and one water ride
  set best to infinity
  for each land ride a
    for each water ride b
      finish is the later of land a's end and water b's opening, plus water b's duration
      keep the smaller finish
  for each water ride b
    for each land ride a
      finish is the later of water b's end and land a's opening, plus land a's duration
      keep the smaller finish
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def earliest_finish(land, water):
    best = float("inf")
    for ls, ld in land:
        for ws, wd in water:
            best = min(best, max(ls + ld, ws) + wd)
    for ws, wd in water:
        for ls, ld in land:
            best = min(best, max(ws + wd, ls) + ld)
    return best
`
