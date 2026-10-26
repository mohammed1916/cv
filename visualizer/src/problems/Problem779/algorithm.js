export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Number.isInteger(obj.n) || !Number.isInteger(obj.k)) throw new Error('Enter a JSON object like {"n":4,"k":5}.')
  const { n, k } = obj
  if (n < 1 || n > 30 || k < 1 || k > 2 ** (n - 1)) throw new Error('Need 1 <= n <= 30 and 1 <= k <= 2^(n-1).')
  return { n, k }
}
export function buildTrace({ n, k }) {
  // chain[d] is the position in row (n - d) of the symbol that determines the answer.
  const chain = []
  let cur = k
  for (let row = n; row >= 1; row--) { chain.push({ row, pos: cur }); cur = Math.ceil(cur / 2) }
  const values = new Array(chain.length).fill(null)
  const frames = [{ phase: 'start', activeLine: 1, depth: 0, values: [...values], message: `Row ${n} is built from row ${n - 1} by 0 -> 01 and 1 -> 10. Position ${k} is the ${k % 2 ? 'first' : 'second'} child of position ${Math.ceil(k / 2)} in the row above.` }]
  for (let d = 0; d < chain.length - 1; d++) {
    const { row, pos } = chain[d]
    frames.push({ phase: 'descend', activeLine: 4, depth: d, values: [...values], message: `Row ${row}, position ${pos} comes from row ${row - 1}, position ${Math.ceil(pos / 2)}. Recurse upward.` })
  }
  values[chain.length - 1] = 0
  frames.push({ phase: 'base', activeLine: 3, depth: chain.length - 1, values: [...values], message: 'Row 1 is just "0", so the recursion bottoms out with 0.' })
  for (let d = chain.length - 2; d >= 0; d--) {
    const parent = values[d + 1]
    const odd = chain[d].pos % 2 === 1
    values[d] = odd ? parent : 1 - parent
    frames.push({ phase: 'resolve', activeLine: odd ? 6 : 7, depth: d, values: [...values], message: `Position ${chain[d].pos} in row ${chain[d].row} is ${odd ? 'odd (first child): it copies' : 'even (second child): it flips'} its parent ${parent}, giving ${values[d]}.` })
  }
  const result = values[0]
  frames.push({ phase: 'done', activeLine: 7, depth: 0, values: [...values], message: `The ${k}-th symbol in row ${n} is ${result}.` })
  return { input: { n, k }, chain, result, frames }
}
export const code = `def kthGrammar(n, k):
    if n == 1:
        return 0
    parent = kthGrammar(n - 1, (k + 1) // 2)
    if k % 2 == 1:
        return parent
    return 1 - parent`.split('\n').map((text, index) => ({ line: index + 1, text }))
