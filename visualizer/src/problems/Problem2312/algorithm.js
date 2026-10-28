export function parseInput(text) {
  const data = JSON.parse(text)
  const { m, n, prices } = data ?? {}
  for (const [name, value] of [['m', m], ['n', n]]) {
    if (!Number.isInteger(value) || value < 1 || value > 6) throw new Error(`${name} must be an integer from 1 to 6.`)
  }
  if (!Array.isArray(prices) || prices.length < 1 || prices.length > 6) throw new Error('prices must be 1 to 6 triples [height, width, price].')
  for (const p of prices) {
    if (!Array.isArray(p) || p.length !== 3 || !Number.isInteger(p[0]) || !Number.isInteger(p[1]) || !Number.isInteger(p[2])) throw new Error('Each price is [height, width, price] with integers.')
    if (p[0] < 1 || p[0] > m || p[1] < 1 || p[1] > n || p[2] < 1 || p[2] > 1000) throw new Error('A piece must fit the board, and its price is from 1 to 1000.')
  }
  return { m, n, prices }
}

export const code = `maximum money from wood(m, n, prices)
  price = table of m + 1 rows and n + 1 columns, filled with 0
  for each [h, w, p] in prices: price[h][w] = max(price[h][w], p)
  best = table of m + 1 rows and n + 1 columns, filled with 0
  for h from 1 to m
    for w from 1 to n
      best[h][w] = price[h][w]
      for each vertical cut k from 1 to w - 1: best[h][w] = max(best[h][w], best[h][k] + best[h][w - k])
      for each horizontal cut k from 1 to h - 1: best[h][w] = max(best[h][w], best[k][w] + best[h - k][w])
  return best[m][n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const grid = (rows, cols) => Array.from({ length: rows }, () => Array(cols).fill(0))

// A board of height h and width w is either sold whole or cut edge to edge into two smaller boards.
export function buildTrace({ m, n, prices }) {
  const price = grid(m + 1, n + 1)
  for (const [h, w, p] of prices) price[h][w] = Math.max(price[h][w], p)
  const best = grid(m + 1, n + 1)
  const frames = [{ phase: 'start', cell: null, table: grid(m + 1, n + 1), activeLine: L('price = table'), message: 'Empty boards are worth nothing. Each board is worth its best single piece or its best cut.' }]
  for (let h = 1; h <= m; h++) {
    for (let w = 1; w <= n; w++) {
      best[h][w] = price[h][w]
      for (let k = 1; k < w; k++) best[h][w] = Math.max(best[h][w], best[h][k] + best[h][w - k])
      for (let k = 1; k < h; k++) best[h][w] = Math.max(best[h][w], best[k][w] + best[h - k][w])
      frames.push({ phase: 'cell', cell: [h, w], table: best.map(row => [...row]), activeLine: L('best[h][w] = price[h][w]'), message: `Board ${h} by ${w} is worth ${best[h][w]}.` })
    }
  }
  const result = best[m][n]
  frames.push({ phase: 'done', cell: [m, n], table: best.map(row => [...row]), activeLine: L('return best[m][n]'), message: `Most money for the ${m} by ${n} board: ${result}.` })
  return { input: { m, n, prices }, result, frames }
}

export const python = `def selling_wood(m, n, prices):
    price = [[0] * (n + 1) for _ in range(m + 1)]
    for h, w, p in prices:
        price[h][w] = max(price[h][w], p)
    best = [[0] * (n + 1) for _ in range(m + 1)]
    for h in range(1, m + 1):
        for w in range(1, n + 1):
            best[h][w] = price[h][w]
            for k in range(1, w):
                best[h][w] = max(best[h][w], best[h][k] + best[h][w - k])
            for k in range(1, h):
                best[h][w] = max(best[h][w], best[k][w] + best[h - k][w])
    return best[m][n]
`
