const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('n is an integer from 1 to 8 in this visualization.')
  return { n }
}

export const code = `sum of products of the first n increasing blocks modulo M
  total = 0
  next = 1
  for k from 1 to n
    product = 1
    for x in the k integers starting at next
      product = product * x mod M
    total = (total + product) mod M
    next = next + k
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing pseudocode: ${s}`); return i + 1 }

export const python = `def sum_increasing_product_blocks(n):
    MOD = 1000000007
    total = 0
    start = 1
    for k in range(1, n + 1):
        product = 1
        for x in range(start, start + k):
            product = product * x % MOD
        total = (total + product) % MOD
        start += k
    return total`
const PY = python.split('\n')
const Q = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing python: ${s}`); return i + 1 }

export function buildTrace({ n }) {
  const frames = []
  const blocks = []
  let total = 0
  let next = 1
  frames.push({ phase: 'start', blocks: [], total, activeBlock: -1, pythonLine: Q('total = 0'), activeLine: L('total = 0'), message: `Blocks have lengths 1 to ${n}; the first block starts at 1.` })
  for (let k = 1; k <= n; k++) {
    const values = Array.from({ length: k }, (_, t) => next + t)
    let product = 1
    for (const x of values) {
      product = (product * x) % MOD
      frames.push({ phase: 'multiply', blocks: blocks.map(b => ({ ...b })), total, activeBlock: k - 1, values, reading: x, partial: product, pythonLine: Q('product = product * x'), activeLine: L('product = product * x'), message: `Multiply by ${x}; the block product is now ${product} modulo M.` })
    }
    blocks.push({ k, values, product })
    total = (total + product) % MOD
    frames.push({ phase: 'add', blocks: blocks.map(b => ({ ...b })), total, activeBlock: k - 1, values, reading: null, partial: product, pythonLine: Q('total = (total + product)'), activeLine: L('total = (total + product)'), message: `Block ${k} contributes ${product}; the running total is ${total}.` })
    next += k
  }
  frames.push({ phase: 'done', blocks: blocks.map(b => ({ ...b })), total, activeBlock: -1, values: [], reading: null, partial: null, pythonLine: Q('return total'), activeLine: L('return total'), message: `Sum of the first ${n} block products modulo 1000000007 is ${total}.` })
  return { input: { n }, result: total, frames }
}
