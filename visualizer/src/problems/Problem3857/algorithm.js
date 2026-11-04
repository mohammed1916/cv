export const code = [
  'best[1] is zero because one is already a single unit',
  'for x from 2 to n',
  'try every split x = a + b with a and b positive',
  'best[x] is the smallest best[a] + best[b] + a times b',
  'return best[n]',
].map((text, index) => ({ line: index + 1, text }))
const L = key => code.findIndex(c => c.text.includes(key)) + 1
const PY = key => python.split('\n').findIndex(line => line.includes(key)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 1 || n > 30) throw new Error('n is an integer from 1 to 30.')
  return { n }
}

export function buildTrace({ n }) {
  const best = [0, 0]
  const frames = [{ best: best.slice(), x: 1, a: null, phase: 'setup', pythonLine: PY('best = [0] * (n + 1)'), activeLine: L('best[1] is zero'), message: 'A single one costs nothing.' }]
  for (let x = 2; x <= n; x++) {
    let cost = Infinity
    let arg = 1
    for (let a = 1; a < x; a++) {
      const b = x - a
      const candidate = best[a] + best[b] + a * b
      if (candidate < cost) { cost = candidate; arg = a }
    }
    best[x] = cost
    frames.push({ best: best.slice(), x, a: arg, phase: 'split', pythonLine: PY('best[x] = min'), activeLine: L('best[x] is'), message: `Splitting ${x} as ${arg} + ${x - arg} costs ${cost} in total.` })
  }
  frames.push({ best: best.slice(), x: n, a: null, phase: 'done', pythonLine: PY('return best[n]'), activeLine: L('return best[n]'), message: `Minimum cost for ${n} is ${best[n]}.` })
  return { input: { n }, result: best[n], frames }
}

export const python = `def min_cost_to_split(n):
    best = [0] * (n + 1)
    for x in range(2, n + 1):
        best[x] = min(best[a] + best[x - a] + a * (x - a) for a in range(1, x))
    return best[n]`
