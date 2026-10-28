export function parseInput(text) {
  const input = JSON.parse(text)
  const { weights, k } = input ?? {}
  if (!Array.isArray(weights) || weights.length < 1 || weights.length > 10) throw new Error('weights is a list of 1 to 10 positive integers.')
  if (weights.some(w => !Number.isInteger(w) || w < 1 || w > 100)) throw new Error('Weights are integers from 1 to 100.')
  if (!Number.isInteger(k) || k < 1 || k > weights.length) throw new Error('k is an integer from 1 to the number of marbles.')
  return { weights, k }
}

export function buildTrace(input) {
  const { weights, k } = input
  const pairs = []
  for (let i = 0; i + 1 < weights.length; i++) pairs.push(weights[i] + weights[i + 1])
  const frames = [{ phase: 'pairs', activeLine: L('set pairs to the sum'), pairs: [...pairs], sorted: null, low: null, high: null, message: `Each cut between neighbours costs the sum of the two weights: ${pairs.join(', ') || 'none'}.` }]
  const sorted = [...pairs].sort((a, b) => a - b)
  frames.push({ phase: 'sort', activeLine: L('sort pairs from smallest'), pairs: [...pairs], sorted, low: null, high: null, message: `Sorted cut costs: ${sorted.join(', ') || 'none'}.` })
  const need = k - 1
  const low = sorted.slice(0, need).reduce((s, x) => s + x, 0)
  frames.push({ phase: 'low', activeLine: L('set low to the sum'), pairs: [...pairs], sorted, low, high: null, message: `The ${need} cheapest cut(s) add up to ${low}.` })
  const high = sorted.slice(sorted.length - need).reduce((s, x) => s + x, 0)
  frames.push({ phase: 'high', activeLine: L('set high to the sum'), pairs: [...pairs], sorted, low, high, message: `The ${need} most expensive cut(s) add up to ${high}.` })
  const result = high - low
  frames.push({ phase: 'done', activeLine: L('return high minus low'), pairs: [...pairs], sorted, low, high, message: `Difference between the highest and lowest score: ${result}.` })
  return { input, result, frames }
}

export const code = `difference between the highest and lowest total cost over all ways to split
  set pairs to the sum of each adjacent pair of weights
  sort pairs from smallest to largest
  set low to the sum of the k minus 1 smallest pairs
  set high to the sum of the k minus 1 largest pairs
  return high minus low`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def put_marbles(weights, k):
    pairs = sorted(weights[i] + weights[i + 1] for i in range(len(weights) - 1))
    return sum(pairs[len(pairs) - (k - 1):]) - sum(pairs[:k - 1])
`
