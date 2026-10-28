export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with m, n, horizontalCut and verticalCut.')
  const { m, n, horizontalCut, verticalCut } = data
  if (!Number.isInteger(m) || m < 1 || m > 30) throw new Error('m (rows) is an integer from 1 to 30.')
  if (!Number.isInteger(n) || n < 1 || n > 30) throw new Error('n (columns) is an integer from 1 to 30.')
  if (!Array.isArray(horizontalCut) || horizontalCut.length !== m - 1) throw new Error('horizontalCut must have m minus 1 entries.')
  if (!Array.isArray(verticalCut) || verticalCut.length !== n - 1) throw new Error('verticalCut must have n minus 1 entries.')
  if ([...horizontalCut, ...verticalCut].some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Cut costs are integers from 1 to 100.')
  return { m, n, horizontalCut, verticalCut }
}

export function buildTrace(input) {
  const h = [...input.horizontalCut].sort((a, b) => b - a)
  const v = [...input.verticalCut].sort((a, b) => b - a)
  let i = 0
  let j = 0
  let hp = 1
  let vp = 1
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('sort the horizontal'), h: 0, v: 0, hp, vp, total, message: 'Sort both cut lists from most expensive to cheapest. Start with one piece.' }]
  while (i < h.length || j < v.length) {
    if (j === v.length || (i < h.length && h[i] >= v[j])) {
      const cost = h[i] * vp
      total += cost
      hp += 1
      i += 1
      frames.push({ phase: 'horizontal', activeLine: L('cut horizontally'), h: i, v: j, hp, vp, total, message: `Horizontal cut costs ${h[i - 1]} times ${vp} vertical pieces, adding ${cost}.` })
    } else {
      const cost = v[j] * hp
      total += cost
      vp += 1
      j += 1
      frames.push({ phase: 'vertical', activeLine: L('cut vertically'), h: i, v: j, hp, vp, total, message: `Vertical cut costs ${v[j - 1]} times ${hp} horizontal pieces, adding ${cost}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), h: i, v: j, hp, vp, total, message: `Minimum total cost: ${total}.` })
  return { input, result: total, frames }
}

export const code = `minimum total cost to cut the cake into single pieces:
  sort the horizontal costs and the vertical costs, largest first
  set horizontal pieces and vertical pieces to one
  set total to zero
  while cuts remain
    if the next horizontal cost is at least the next vertical cost then
      cut horizontally: add its cost times the vertical pieces to total
      increase horizontal pieces by one
    otherwise
      cut vertically: add its cost times the horizontal pieces to total
      increase vertical pieces by one
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_cost_to_cut(m, n, horizontalCut, verticalCut):
    h = sorted(horizontalCut, reverse=True)
    v = sorted(verticalCut, reverse=True)
    i = 0
    j = 0
    hp = 1
    vp = 1
    total = 0
    while i < len(h) or j < len(v):
        if j == len(v) or (i < len(h) and h[i] >= v[j]):
            total += h[i] * vp
            hp += 1
            i += 1
        else:
            total += v[j] * hp
            vp += 1
            j += 1
    return total
`
