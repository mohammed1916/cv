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
  const trie = { next: new Map() }
  for (const w of words) {
    let node = trie
    for (const ch of w) {
      if (!node.next.has(ch)) node.next.set(ch, { next: new Map() })
      node = node.next.get(ch)
    }
  }
  const n = target.length
  const reach = []
  const frames = [{ phase: 'trie', activeLine: L('build a trie of the words'), p: -1, reach: [], cost: [], message: 'Built a trie of every word.' }]
  for (let p = 0; p < n; p++) {
    let node = trie
    let length = 0
    while (p + length < n && node.next.has(target[p + length])) {
      node = node.next.get(target[p + length])
      length++
    }
    reach.push(length)
    frames.push({ phase: 'reach', activeLine: L('walk the target from p'), p, reach: [...reach], cost: [], message: `Walking the trie from position ${p} reaches length ${length}.` })
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
  build a trie of the words
  for each start position p in target
    walk the target from p down the trie as far as it goes
    record that length as reach[p]
  set cost[0] to 0 and every other cost to infinity
  for each position p from 0 to n - 1
    if cost[p] is infinity then skip p
    for each length k from 1 to reach[p]
      set cost[p + k] to the smaller of cost[p + k] and cost[p] + 1
  if cost[n] is infinity then return -1
  return cost[n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_valid_strings(words, target):
    trie = {}
    for w in words:
        node = trie
        for ch in w:
            node = node.setdefault(ch, {})
    n = len(target)
    reach = [0] * n
    for p in range(n):
        node = trie
        length = 0
        while p + length < n and target[p + length] in node:
            node = node[target[p + length]]
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
