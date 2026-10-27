export function parseInput(text) {
  const o = JSON.parse(text)
  if (!o || !Number.isInteger(o.n) || !Number.isInteger(o.limit)) throw new Error('Use an object with integers n and limit.')
  if (o.n < 1 || o.n > 50) throw new Error('n must be an integer from 1 to 50.')
  if (o.limit < 1 || o.limit > 50) throw new Error('limit must be an integer from 1 to 50.')
  return { n: o.n, limit: o.limit }
}

export function buildTrace({ n, limit }) {
  let total = 0
  const rows = []
  const frames = [{ phase: 'start', activeLine: L('set total to zero'), a: -1, row: 0, total: 0, message: `Split ${n} candies among three children, each at most ${limit}.` }]
  for (let a = 0; a <= Math.min(n, limit); a++) {
    let row = 0
    for (let b = 0; b <= Math.min(n - a, limit); b++) {
      const c = n - a - b
      if (c <= limit) {
        row++
        total++
      }
    }
    rows.push(row)
    frames.push({ phase: 'first', activeLine: L('for each count a'), a, row, total, message: `First child takes ${a}: ${row} ways to share the rest.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), a: -1, row: 0, total, message: `Total ways: ${total}.` })
  return { input: { n, limit }, result: total, frames, rows }
}

export const code = `count ways to split n candies among three children with at most limit each
  set total to zero
  for each count a for the first child from zero to the smaller of n and limit
    for each count b for the second child from zero to the smaller of n minus a and limit
      set c to n minus a minus b
      if c is at most limit then add one to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def distribute_candies(n, limit):
    total = 0
    for a in range(min(n, limit) + 1):
        for b in range(min(n - a, limit) + 1):
            c = n - a - b
            if c <= limit:
                total += 1
    return total
`
