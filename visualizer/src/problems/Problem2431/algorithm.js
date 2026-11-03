const MAX_FRUITS = 8
const MAX_COUPONS = 3
const MAX_AMOUNT = 24

const P = s => {
  const i = python.split('\n').findIndex(line => line.includes(s))
  if (i < 0) throw new Error(`missing python line: ${s}`)
  return i + 1
}
const L = s => {
  const i = code.findIndex(c => c.text.includes(s))
  if (i < 0) throw new Error(`missing pseudocode line: ${s}`)
  return i + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with price, tastiness, maxAmount and maxCoupons.')
  const { price, tastiness, maxAmount, maxCoupons } = input
  if (!Array.isArray(price) || !Array.isArray(tastiness) || price.length !== tastiness.length) throw new Error('price and tastiness are lists of the same length.')
  if (price.length < 1 || price.length > MAX_FRUITS) throw new Error(`The visualization uses 1 to ${MAX_FRUITS} fruits.`)
  if (!price.every(p => Number.isInteger(p) && p >= 1 && p <= 12)) throw new Error('Each price is an integer from 1 to 12 in this visualization.')
  if (!tastiness.every(t => Number.isInteger(t) && t >= 0 && t <= 20)) throw new Error('Each tastiness is an integer from 0 to 20 in this visualization.')
  if (!Number.isInteger(maxAmount) || maxAmount < 0 || maxAmount > MAX_AMOUNT) throw new Error(`maxAmount is an integer from 0 to ${MAX_AMOUNT} in this visualization.`)
  if (!Number.isInteger(maxCoupons) || maxCoupons < 0 || maxCoupons > MAX_COUPONS) throw new Error(`maxCoupons is an integer from 0 to ${MAX_COUPONS} in this visualization.`)
  return { price, tastiness, maxAmount, maxCoupons }
}

export function buildTrace({ price, tastiness, maxAmount: M, maxCoupons: C }) {
  const zeros = () => Array.from({ length: C + 1 }, () => Array(M + 1).fill(0))
  let table = zeros()
  const frames = []
  const snap = extra => ({ table: table.map(r => [...r]), prev: null, item: -1, full: null, coupon: null, value: table[C][M], ...extra })

  frames.push({ ...snap({ phase: 'start', activeLine: L('table[c][a] is zero'), pythonLine: P('table = [[0]'), message: `Every (coupons, money) pair starts at 0. The target is ${C} coupon${C === 1 ? '' : 's'} and money ${M}.` }) })

  price.forEach((p, i) => {
    const t = tastiness[i]
    const half = Math.floor(p / 2)
    frames.push({ ...snap({ phase: 'item', item: i, activeLine: L('for each fruit'), pythonLine: P('for p, t in zip'), message: `Fruit ${i}: price ${p}, coupon price ${half}, tastiness ${t}.` }) })
    const prev = table
    const next = prev.map(r => [...r])
    for (let c = 0; c <= C; c++) {
      for (let a = 0; a <= M; a++) {
        if (a >= p) next[c][a] = Math.max(next[c][a], prev[c][a - p] + t)
        if (c >= 1 && a >= half) next[c][a] = Math.max(next[c][a], prev[c - 1][a - half] + t)
      }
    }
    const full = M >= p ? prev[C][M - p] + t : null
    const coupon = C >= 1 && M >= half ? prev[C - 1][M - half] + t : null
    table = next
    frames.push({ ...snap({ phase: 'merge', item: i, prev: prev.map(r => [...r]), full, coupon, activeLine: L('try full price'), pythonLine: P('table = new'), message: `Target after fruit ${i}: full price gives ${full ?? 'no option'}, coupon gives ${coupon ?? 'no option'}, best is ${table[C][M]}.` }) })
  })

  const result = table[C][M]
  frames.push({ ...snap({ phase: 'done', item: price.length, activeLine: L('return the table entry'), pythonLine: P('return table'), message: `The best tastiness with at most ${C} coupon${C === 1 ? '' : 's'} and money ${M} is ${result}.` }) })
  return { input: { price, tastiness, maxAmount: M, maxCoupons: C }, result, frames }
}

export const code = [
  'maximum tastiness within the money and coupon limits',
  'table[c][a] is zero for every coupon count c and money a',
  'for each fruit',
  '  new table starts as a copy of the table',
  '  for each coupon count c and money a',
  '    if a is at least the price then try full price',
  '    if c is at least one and a is at least the half price then try the coupon',
  '    keep the larger tastiness in new[c][a]',
  '  the table becomes the new table',
  'return the table entry at max coupons and max amount',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def max_tastiness(price, tastiness, max_amount, max_coupons):
    table = [[0] * (max_amount + 1) for _ in range(max_coupons + 1)]
    for p, t in zip(price, tastiness):
        half = p // 2
        new = [row[:] for row in table]
        for c in range(max_coupons + 1):
            for a in range(max_amount + 1):
                if a >= p:
                    new[c][a] = max(new[c][a], table[c][a - p] + t)
                if c >= 1 and a >= half:
                    new[c][a] = max(new[c][a], table[c - 1][a - half] + t)
        table = new
    return table[max_coupons][max_amount]
`
