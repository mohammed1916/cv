const letter = c => c.charCodeAt(0) - 97
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with source, target, original, changed and cost.')
  const { source, target, original, changed, cost } = input
  if (typeof source !== 'string' || typeof target !== 'string' || source.length < 1 || source.length > 8 || source.length !== target.length || !/^[a-z]+$/.test(source + target)) throw new Error('source and target are equal-length lowercase strings of 1 to 8 letters.')
  if (!Array.isArray(original) || !Array.isArray(changed) || !Array.isArray(cost) || original.length !== changed.length || original.length !== cost.length || original.length > 10) throw new Error('original, changed and cost are equal-length arrays of at most 10 entries.')
  original.forEach((o, i) => {
    if (typeof o !== 'string' || typeof changed[i] !== 'string' || !/^[a-z]$/.test(o) || !/^[a-z]$/.test(changed[i])) throw new Error('original and changed hold single lowercase letters.')
    if (!Number.isInteger(cost[i]) || cost[i] < 1 || cost[i] > 20) throw new Error('Each cost is an integer from 1 to 20.')
  })
  return { source, target, original, changed, cost }
}

export function buildTrace({ source, target, original, changed, cost }) {
  const dist = Array.from({ length: 26 }, (_, i) => Array.from({ length: 26 }, (_, j) => (i === j ? 0 : Infinity)))
  const frames = []
  const used = [...new Set([...source, ...target, ...original, ...changed].map(letter))].sort((a, b) => a - b)
  const snapshot = () => used.map(i => used.map(j => dist[i][j]))
  const labels = used.map(i => LETTERS[i])
  frames.push({ phase: 'start', activeLine: L('set dist'), matrix: snapshot(), labels, pivot: -1, message: 'Each letter starts at distance 0 from itself and infinity from the rest.' })
  original.forEach((o, i) => {
    const a = letter(o)
    const b = letter(changed[i])
    dist[a][b] = Math.min(dist[a][b], cost[i])
  })
  frames.push({ phase: 'edges', activeLine: L('for each pair i'), matrix: snapshot(), labels, pivot: -1, message: 'Each rule sets the cheapest direct cost from one letter to another.' })
  for (let k = 0; k < 26; k++) {
    for (let i = 0; i < 26; i++) {
      for (let j = 0; j < 26; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) dist[i][j] = dist[i][k] + dist[k][j]
      }
    }
    if (used.includes(k)) frames.push({ phase: 'relax', activeLine: L('relax dist'), matrix: snapshot(), labels, pivot: used.indexOf(k), message: `Route through ${LETTERS[k]} to shorten any pair that benefits.` })
  }
  let total = 0
  for (let i = 0; i < source.length; i++) total += dist[letter(source[i])][letter(target[i])]
  const result = total === Infinity ? -1 : total
  frames.push({ phase: 'done', activeLine: L('return -1'), matrix: snapshot(), labels, pivot: -1, message: result === -1 ? 'Some position cannot be converted, so return -1.' : `Total minimum cost: ${result}.` })
  return { input: { source, target, original, changed, cost }, result, frames }
}

export const code = `find the cheapest way to turn each letter of source into the matching letter of target
set dist[a][b] to 0 when a equals b, and to infinity otherwise
for each pair i, lower dist[original i][changed i] to cost i when that is cheaper
for k from a to z do
  for i from a to z do
    for j from a to z do
      relax dist[i][j] through k
sum dist[source i][target i] over every position i
return -1 if the sum is infinite, otherwise the sum`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_cost(source, target, original, changed, cost):
    INF = float('inf')
    dist = [[0 if i == j else INF for j in range(26)] for i in range(26)]
    for o, c, w in zip(original, changed, cost):
        a, b = ord(o) - 97, ord(c) - 97
        dist[a][b] = min(dist[a][b], w)
    for k in range(26):
        for i in range(26):
            for j in range(26):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    total = 0
    for s, t in zip(source, target):
        total += dist[ord(s) - 97][ord(t) - 97]
    return -1 if total == INF else total
`
