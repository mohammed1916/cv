const MOD = 1000000007n

export function parseInput(text) {
  const input = JSON.parse(text)
  const { n, queries } = input ?? {}
  if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error('n is an integer from 1 to 1000.')
  const count = [...n.toString(2)].filter(bit => bit === '1').length
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 10) throw new Error('Use 1 to 10 queries.')
  for (const pair of queries) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(Number.isInteger)) throw new Error('Each query is a pair [left, right] of integers.')
    const [left, right] = pair
    if (left < 0 || right < left || right >= count) throw new Error(`Each query needs 0 <= left <= right < ${count}.`)
  }
  return { n, queries }
}

export function buildTrace({ n, queries }) {
  const powers = []
  for (let bit = 1; bit <= n; bit *= 2) if (n & bit) powers.push(bit)
  const frames = [{ phase: 'start', activeLine: L('list the powers of two that sum to n'), powers, query: null, k: null, product: 1, answers: [], message: `The powers of two that sum to ${n} are ${powers.join(', ')}.` }]
  const answers = []
  queries.forEach(([left, right], qi) => {
    let product = 1n
    frames.push({ phase: 'query', activeLine: L('for each query'), powers, query: [left, right], k: null, product: 1, answers: [...answers], message: `Query ${qi + 1}: multiply powers ${left} to ${right}.` })
    for (let k = left; k <= right; k++) {
      product = (product * BigInt(powers[k])) % MOD
      frames.push({ phase: 'multiply', activeLine: L('multiply the product by that power'), powers, query: [left, right], k, product: Number(product), answers: [...answers], message: `Multiply by ${powers[k]}: product is ${product}.` })
    }
    answers.push(Number(product))
    frames.push({ phase: 'record', activeLine: L('record the product as the answer'), powers, query: [left, right], k: null, product: Number(product), answers: [...answers], message: `Answer for this query: ${product}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return the answers'), powers, query: null, k: null, product: 1, answers: [...answers], message: `Answers: ${answers.join(', ')}.` })
  return { input: { n, queries }, result: answers, frames }
}

export const code = `range product queries of powers
  list the powers of two that sum to n, smallest first
  for each query [left, right]
    set the product to one
    for each power from left to right
      multiply the product by that power, modulo 1000000007
    record the product as the answer
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def product_of_powers(n, queries):
    MOD = 10 ** 9 + 7
    powers = []
    bit = 1
    while bit <= n:
        if n & bit:
            powers.append(bit)
        bit *= 2
    answer = []
    for left, right in queries:
        product = 1
        for k in range(left, right + 1):
            product = product * powers[k] % MOD
        answer.append(product)
    return answer
`
