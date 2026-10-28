export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).sort().join() !== 'costs,target,words') throw new Error('Use a JSON object with keys target, words and costs.')
  const { target, words, costs } = input
  if (typeof target !== 'string' || !/^[a-z]{1,20}$/.test(target)) throw new Error('target must be 1 to 20 lowercase letters.')
  if (!Array.isArray(words) || words.length < 1 || words.length > 6) throw new Error('words must be an array of 1 to 6 strings.')
  if (words.some(w => typeof w !== 'string' || !/^[a-z]{1,6}$/.test(w))) throw new Error('Each word is 1 to 6 lowercase letters.')
  if (!Array.isArray(costs) || costs.length !== words.length || costs.some(c => !Number.isInteger(c) || c < 1 || c > 100)) throw new Error('costs must have one integer from 1 to 100 per word.')
  return { target, words, costs }
}

export function buildTrace(input) {
  const { target, words, costs } = input
  const n = target.length
  const INF = Infinity
  const best = new Array(n + 1).fill(INF)
  best[0] = 0
  const show = () => best.map(v => (v === INF ? '∞' : v))
  const frames = [{ phase: 'start', activeLine: L('set the best cost of the empty'), index: 0, best: show(), result: null, message: 'Building the empty prefix costs 0. Every other prefix starts unknown.' }]
  for (let i = 0; i < n; i++) {
    if (best[i] === INF) continue
    words.forEach((word, k) => {
      if (target.startsWith(word, i)) best[i + word.length] = Math.min(best[i + word.length], best[i] + costs[k])
    })
    frames.push({ phase: 'position', activeLine: L('for each word and its cost'), index: i, best: show(), result: null, message: `Prefix of length ${i} costs ${best[i]}. Words that match here update the prefixes after them.` })
  }
  const result = best[n] === INF ? -1 : best[n]
  frames.push({ phase: 'done', activeLine: L('or minus one'), index: n, best: show(), result, message: result === -1 ? 'The whole target cannot be built from these words.' : `Minimum cost to build the target is ${result}.` })
  return { input: { target, words, costs }, result, frames }
}

export const code = `Construct string with minimum cost
set the best cost of the empty prefix to zero and of every other prefix to infinity
for each position i from left to right
  if the best cost at i is infinity then skip this position
  for each word and its cost
    if the word matches the target starting at position i then
      set the best cost after the word to the smaller of its current value and best at i plus the cost
return the best cost of the whole target, or minus one if it is infinity`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_cost(target, words, costs):
    INF = float('inf')
    best = [INF] * (len(target) + 1)
    best[0] = 0
    for i in range(len(target)):
        if best[i] == INF:
            continue
        for word, cost in zip(words, costs):
            if target.startswith(word, i):
                best[i + len(word)] = min(best[i + len(word)], best[i] + cost)
    return best[-1] if best[-1] != INF else -1
`
