export function parseInput(text) {
  const pairs = JSON.parse(text)
  if (!Array.isArray(pairs) || pairs.length < 1 || pairs.length > 1000) throw new Error('Enter 1–1,000 pairs as a JSON array of [left, right].')
  for (const pair of pairs) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(Number.isInteger)) throw new Error('Each pair must be two integers [left, right].')
    if (pair[0] >= pair[1]) throw new Error('Each pair needs left < right.')
    if (pair.some(v => Math.abs(v) > 1000)) throw new Error('Pair values must be between −1,000 and 1,000.')
  }
  return pairs
}

// Greedy: sort by right end. Take a pair whenever its left end is strictly past the last taken right end.
export function buildTrace(pairs) {
  const sorted = [...pairs].sort((x, y) => x[1] - y[1] || x[0] - y[0])
  let count = 0
  let current = -Infinity
  const kept = []
  const frames = [{ phase: 'start', sorted, index: -1, kept: [], current: null, count, activeLine: L('const sorted = '), pythonLine: P('pairs = sorted('), message: 'Sort the pairs by their right end.' }]
  sorted.forEach((pair, index) => {
    const take = pair[0] > current
    frames.push({ phase: 'consider', sorted, index, kept: [...kept], current, take, count, activeLine: L('if (left > current)'), pythonLine: P('if left > current'), message: `Pair [${pair[0]}, ${pair[1]}]: left ${pair[0]} ${take ? 'is past' : 'does not pass'} ${current === -Infinity ? 'the start' : current}.` })
    if (take) {
      count++
      current = pair[1]
      kept.push(index)
      frames.push({ phase: 'take', sorted, index, kept: [...kept], current, take, count, activeLine: L('current = right'), pythonLine: P('current = right'), message: `Take [${pair[0]}, ${pair[1]}]; the chain ends at ${current}.` })
    }
  })
  const result = count
  frames.push({ phase: 'done', sorted, index: -1, kept: [...kept], current, count, result, activeLine: L('return count'), pythonLine: P('return count'), message: `Longest chain: ${result} pairs.` })
  return { input: pairs, result, frames }
}

const SOURCE = `function findLongestChain(pairs) {
  const sorted = [...pairs].sort((a, b) => a[1] - b[1] || a[0] - b[0])
  let count = 0
  let current = -Infinity
  for (const [left, right] of sorted) {
    if (left > current) {
      count++
      current = right
    }
  }
  return count
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_longest_chain(pairs):
    pairs = sorted(pairs, key=lambda pair: pair[1])
    count = 0
    current = float('-inf')
    for left, right in pairs:
        if left > current:
            count += 1
            current = right
    return count`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
