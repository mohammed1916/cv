export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 30) throw new Error('Use a JSON string of 1 to 30 characters.')
  if (!/^[01]+$/.test(s)) throw new Error('Use only the characters 0 and 1.')
  return s
}

export function buildTrace(s) {
  const n = s.length
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set total to 0'), boundary: -1, total, message: `Check each boundary between neighbours in "${s}".` }]
  for (let i = 0; i < n - 1; i++) {
    if (s[i] === s[i + 1]) {
      frames.push({ phase: 'same', activeLine: L('if the two characters differ'), boundary: i, total, message: `Boundary ${i}: the characters match, so nothing is paid.` })
      continue
    }
    const prefix = i + 1
    const suffix = n - i - 1
    const cost = Math.min(prefix, suffix)
    total += cost
    frames.push({ phase: 'differ', activeLine: L('add the cheaper'), boundary: i, total, message: `Boundary ${i} differs. Flipping the prefix costs ${prefix} and the suffix costs ${suffix}, so add ${cost}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), boundary: -1, total, message: `Minimum cost: ${total}.` })
  return { input: s, result: total, frames }
}

export const code = `minimum cost to make all characters equal:
  set total to 0
  for each boundary i between position i and position i plus 1 do
    if the two characters differ then
      add the cheaper of flipping prefix 0 to i or suffix i plus 1 to the end
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_cost(s):
    n = len(s)
    total = 0
    for i in range(n - 1):
        if s[i] != s[i + 1]:
            total += min(i + 1, n - i - 1)
    return total
`
