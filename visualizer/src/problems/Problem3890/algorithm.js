export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Number.isInteger(obj.n)) throw new Error('Use a JSON object with an integer "n".')
  const { n } = obj
  if (n < 1 || n > 5000) throw new Error('n must be from 1 to 5000 for this visualization.')
  return { n }
}

export function buildTrace({ n }) {
  const ways = new Map()
  const frames = [{ phase: 'start', activeLine: L('set ways to'), a: null, sums: 0, result: null, message: `Find every integer up to ${n} that is a sum of two positive cubes in at least two ways.` }]
  for (let a = 1; 2 * a ** 3 <= n; a++) {
    for (let b = a; a ** 3 + b ** 3 <= n; b++) {
      const s = a ** 3 + b ** 3
      ways.set(s, (ways.get(s) ?? 0) + 1)
    }
    frames.push({ phase: 'a', activeLine: L('for each a'), a, sums: ways.size, result: null, message: `Added every pair starting with ${a}; ${ways.size} sums seen so far.` })
  }
  const result = [...ways.keys()].filter(s => ways.get(s) >= 2).sort((x, y) => x - y)
  frames.push({ phase: 'done', activeLine: L('return the collected'), a: null, sums: ways.size, result, message: `Integers with at least two ways: [${result.join(', ')}].` })
  return { input: { n }, result, frames }
}

export const code = `integers with multiple sum of two cubes (n):
  set ways to an empty table
  for each a from 1 while 2 times a cubed is at most n
    for each b from a while a cubed plus b cubed is at most n
      add one to ways[a cubed plus b cubed]
  collect every sum with at least two ways, in ascending order
  return the collected list

a pair with a equal to b counts as one way, and each unordered pair is counted once`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def multi_cube_sums(n):
    ways = {}
    a = 1
    while 2 * a ** 3 <= n:
        b = a
        while a ** 3 + b ** 3 <= n:
            s = a ** 3 + b ** 3
            ways[s] = ways.get(s, 0) + 1
            b += 1
        a += 1
    return sorted(s for s in ways if ways[s] >= 2)
`
