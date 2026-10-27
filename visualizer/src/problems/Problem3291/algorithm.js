const MAX_WORDS = 5
const MAX_WORD = 5
const MAX_TARGET = 12

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.words) || typeof data.target !== 'string') throw new Error('Use an object like {"words":["abc"],"target":"abc"}.')
  if (data.words.length < 1 || data.words.length > MAX_WORDS) throw new Error(`Use 1 to ${MAX_WORDS} words.`)
  if (data.words.some(w => typeof w !== 'string' || !new RegExp(`^[a-z]{1,${MAX_WORD}}$`).test(w))) throw new Error(`Each word is 1 to ${MAX_WORD} lowercase letters.`)
  if (!new RegExp(`^[a-z]{1,${MAX_TARGET}}$`).test(data.target)) throw new Error(`Target is 1 to ${MAX_TARGET} lowercase letters.`)
  return { words: data.words, target: data.target }
}

export function buildTrace({ words, target }) {
  const prefixes = new Set()
  for (const w of words) for (let i = 1; i <= w.length; i++) prefixes.add(w.slice(0, i))
  const n = target.length
  const reach = []
  const frames = [{ phase: 'prefixes', activeLine: L('set prefixes to the set'), p: -1, reach: [], cost: [], message: `Stored ${prefixes.size} distinct valid prefixes.` }]
  for (let p = 0; p < n; p++) {
    let length = 0
    while (p + length < n && prefixes.has(target.slice(p, p + length + 1))) length++
    reach.push(length)
    frames.push({ phase: 'reach', activeLine: L('set length to the longest'), p, reach: [...reach], cost: [], message: `From position ${p}, the longest valid piece is ${length}.` })
  }
  const cost = Array(n + 1).fill(Infinity)
  cost[0] = 0
  for (let p = 0; p < n; p++) {
    if (cost[p] === Infinity) continue
    for (let k = 1; k <= reach[p]; k++) {
      if (cost[p] + 1 < cost[p + k]) cost[p + k] = cost[p] + 1
    }
    frames.push({ phase: 'relax', activeLine: L('set cost[p + k]'), p, reach: [...reach], cost: [...cost], message: `Pieces from ${p} reach up to position ${p + reach[p]}.` })
  }
  const result = cost[n] === Infinity ? -1 : cost[n]
  frames.push({ phase: 'done', activeLine: L('return cost[n]'), p: n, reach: [...reach], cost: [...cost], message: result === -1 ? 'The target cannot be formed.' : `Minimum valid strings: ${result}.` })
  return { input: { words, target }, result, frames }
}

export const code = `minimum valid strings to form the target
  set prefixes to the set of all non-empty prefixes of words
  for each start position p in target
    set length to the longest run from p that is in prefixes
    record length as reach[p]
  set cost[0] to 0 and every other cost to infinity
  for each position p from 0 to n - 1
    if cost[p] is infinity then skip p
    for each length k from 1 to reach[p]
      set cost[p + k] to the smaller of cost[p + k] and cost[p] + 1
  if cost[n] is infinity then return -1
  return cost[n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_valid_strings(words, target):
    prefixes = set()
    for w in words:
        for i in range(1, len(w) + 1):
            prefixes.add(w[:i])
    n = len(target)
    reach = [0] * n
    for p in range(n):
        length = 0
        while p + length < n and target[p:p + length + 1] in prefixes:
            length += 1
        reach[p] = length
    INF = float('inf')
    cost = [0] + [INF] * n
    for p in range(n):
        if cost[p] == INF:
            continue
        for k in range(1, reach[p] + 1):
            cost[p + k] = min(cost[p + k], cost[p] + 1)
    return cost[n] if cost[n] != INF else -1
`
