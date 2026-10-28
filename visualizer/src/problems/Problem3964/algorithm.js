export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.lights)) throw new Error('Use {"lights": [...]} with one value per position.')
  const { lights } = data
  const n = lights.length
  if (n < 1 || n > 8) throw new Error('lights must have 1 to 8 entries for the visualization.')
  if (lights.some(v => !Number.isInteger(v) || v < 0 || v > n)) throw new Error('Each light value is an integer from 0 to n.')
  return { lights }
}

function litBy(bulbs, n) {
  const lit = Array(n).fill(false)
  for (const [i, v] of bulbs) {
    for (let p = Math.max(0, i - v); p <= Math.min(n - 1, i + v); p++) lit[p] = true
  }
  return lit
}

export function buildTrace(input) {
  const { lights } = input
  const n = lights.length
  const bulbs = []
  lights.forEach((v, i) => { if (v > 0) bulbs.push([i, v]) })
  const lit = litBy(bulbs, n)
  let extra = 0
  const frames = [{ phase: 'start', activeLine: L('let lit be'), p: -1, lit: [...lit], extra, message: 'Mark what the existing bulbs already light, then fill the gaps from the left.' }]
  for (let p = 0; p < n; p++) {
    if (lit[p]) continue
    const j = Math.min(p + 1, n - 1)
    extra++
    for (let q = Math.max(0, j - 1); q <= Math.min(n - 1, j + 1); q++) lit[q] = true
    frames.push({ phase: 'place', activeLine: L('place a bulb'), p, bulb: j, lit: [...lit], extra, message: `Position ${p} is dark, so place an extra bulb at ${j}, which lights ${Math.max(0, j - 1)} to ${Math.min(n - 1, j + 1)}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return extra'), p: -1, lit: [...lit], extra, message: `Extra bulbs needed: ${extra}.` })
  return { input, result: extra, frames }
}

export const code = `minimum extra bulbs to light the road
  let lit be the positions covered by the given bulbs
  let extra be 0
  for each position p from 0 to n minus 1
    if p is already lit then skip p
    place a bulb at the smaller of p plus 1 and n minus 1
    add 1 to extra
    mark the three positions around that bulb as lit
  return extra`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_lights_to_illuminate(lights):
    n = len(lights)
    lit = [False] * n
    for i, v in enumerate(lights):
        if v > 0:
            for p in range(max(0, i - v), min(n - 1, i + v) + 1):
                lit[p] = True
    extra = 0
    for p in range(n):
        if lit[p]:
            continue
        j = min(p + 1, n - 1)
        extra += 1
        for q in range(max(0, j - 1), min(n - 1, j + 1) + 1):
            lit[q] = True
    return extra
`
