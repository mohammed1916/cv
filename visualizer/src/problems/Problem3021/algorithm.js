export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with n and m.')
  const { n, m } = input
  if (!Number.isInteger(n) || n < 1 || n > 100000) throw new Error('n must be an integer from 1 to 100000.')
  if (!Number.isInteger(m) || m < 1 || m > 100000) throw new Error('m must be an integer from 1 to 100000.')
  return { n, m }
}

export function buildTrace({ n, m }) {
  const oddN = Math.floor((n + 1) / 2)
  const evenN = Math.floor(n / 2)
  const oddM = Math.floor((m + 1) / 2)
  const evenM = Math.floor(m / 2)
  const result = oddN * evenM + evenN * oddM
  const frames = [
    { phase: 'start', activeLine: L('set oddN'), oddN: 0, evenN: 0, message: `Count the fields in each direction: 1 to ${n} and 1 to ${m}.` },
    { phase: 'count', activeLine: L('add oddN times evenM'), oddN, evenN, oddM, evenM, message: `Fields 1 to ${n} have ${oddN} odd and ${evenN} even. Fields 1 to ${m} have ${oddM} odd and ${evenM} even.` },
    { phase: 'done', activeLine: L('return the total'), oddN, evenN, oddM, evenM, message: `Winning pairs: ${oddN} x ${evenM} + ${evenN} x ${oddM} = ${result}.` },
  ]
  return { input: { n, m }, result, frames }
}

export const code = `count the pairs (x, y) where Alice wins the flower game
read n and m from the input
set oddN to the odd numbers from 1 to n
set evenN to the even numbers from 1 to n
set oddM to the odd numbers from 1 to m
set evenM to the even numbers from 1 to m
Alice wins when x plus y is odd, so pair an odd x with an even y
add oddN times evenM to evenN times oddM
return the total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_winning_pairs(n, m):
    odd_n = (n + 1) // 2
    even_n = n // 2
    odd_m = (m + 1) // 2
    even_m = m // 2
    return odd_n * even_m + even_n * odd_m
`
