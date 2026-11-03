export const code = [
  'a segment with no sensitive element costs flatCost',
  'otherwise its length times its count times encCost',
  'best(segment) starts with keeping it whole',
  'if the length is even then try the two equal halves',
  'the best cost is the smaller of the two options',
  'return best of the whole string',
].map((text, index) => ({ line: index + 1, text }))
const L = key => code.findIndex(c => c.text.includes(key)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s, encCost and flatCost.')
  const { s, encCost, flatCost } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 16 || !/^[01]+$/.test(s)) throw new Error('s is a binary string from 1 to 16 characters.')
  if (!Number.isInteger(encCost) || encCost < 1 || encCost > 10) throw new Error('encCost is an integer from 1 to 10.')
  if (!Number.isInteger(flatCost) || flatCost < 1 || flatCost > 10) throw new Error('flatCost is an integer from 1 to 10.')
  return { s, encCost, flatCost }
}

export function buildTrace({ s, encCost, flatCost }) {
  const frames = []
  const memo = new Map()
  const wholeCost = (l, len) => {
    let x = 0
    for (let i = l; i < l + len; i++) if (s[i] === '1') x++
    return x === 0 ? flatCost : len * x * encCost
  }
  function best(l, len) {
    const key = `${l}:${len}`
    if (memo.has(key)) return memo.get(key)
    let cost = wholeCost(l, len)
    frames.push({ start: l, len, cost, split: false, phase: 'segment', activeLine: L('best(segment) starts'),
      message: `Segment ${l} to ${l + len - 1} kept whole costs ${cost}.` })
    let split = false
    if (len % 2 === 0) {
      const half = len / 2
      const pieces = best(l, half) + best(l + half, half)
      if (pieces < cost) { cost = pieces; split = true }
    }
    memo.set(key, cost)
    frames.push({ start: l, len, cost, split, phase: 'choose', activeLine: L('the best cost is the smaller'),
      message: split ? `Splitting segment ${l} to ${l + len - 1} is cheaper: ${cost}.` : `Keeping segment ${l} to ${l + len - 1} whole is best: ${cost}.` })
    return cost
  }
  const result = best(0, s.length)
  frames.push({ start: 0, len: s.length, cost: result, split: false, phase: 'done', activeLine: L('return best of the whole'), message: `Minimum total cost: ${result}.` })
  return { input: { s, encCost, flatCost }, result, frames }
}

export const python = `def min_partition_cost(s, enc_cost, flat_cost):
    memo = {}

    def best(l, length):
        if (l, length) in memo:
            return memo[(l, length)]
        x = s[l:l + length].count('1')
        cost = flat_cost if x == 0 else length * x * enc_cost
        if length % 2 == 0:
            half = length // 2
            cost = min(cost, best(l, half) + best(l + half, half))
        memo[(l, length)] = cost
        return cost

    return best(0, len(s))`
