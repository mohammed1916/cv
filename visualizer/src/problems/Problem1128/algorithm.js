export const phases = [
  { id: 'start', label: 'Start', description: 'No domino has been seen yet, so there are no pairs.' },
  { id: 'inspect', label: 'Normalize domino', description: 'Store the two ends as (smaller, larger), so a domino and its turned copy share one key.' },
  { id: 'update', label: 'Count matches', description: 'Every earlier domino with the same key forms a new pair with this one.' },
  { id: 'done', label: 'Answer', description: 'Return the total number of equivalent pairs.' },
]

export function parseInput(text) {
  const dominoes = JSON.parse(text)
  if (!Array.isArray(dominoes) || dominoes.length < 1 || dominoes.length > 40) throw new Error('Enter a JSON array of 1 to 40 dominoes, each written as [a, b].')
  for (const d of dominoes) {
    if (!Array.isArray(d) || d.length !== 2 || !d.every(v => Number.isInteger(v) && v >= 1 && v <= 9)) throw new Error('Each domino must be a pair [a, b] of integers from 1 to 9.')
  }
  return dominoes
}

export const code = [
  'function numEquivDominoPairs(dominoes) {',
  '  const count = new Map()',
  '  let pairs = 0',
  '  for (const [a, b] of dominoes) {',
  "    const key = Math.min(a, b) + '-' + Math.max(a, b)",
  '    pairs += count.get(key) ?? 0',
  '    count.set(key, (count.get(key) ?? 0) + 1)',
  '  }',
  '  return pairs',
  '}',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def num_equiv_domino_pairs(dominoes):
    count = Counter()
    pairs = 0
    for a, b in dominoes:
        key = (min(a, b), max(a, b))
        pairs += count[key]
        count[key] += 1
    return pairs`

export function buildTrace(input) {
  const frames = []
  const frame = (phase, line, pyLine, message, snapshot) => frames.push({ phase, activeLine: line, pythonLine: pyLine, message, snapshot })
  const count = new Map()
  const countList = () => [...count.entries()].map(([key, n]) => ({ key, n }))
  let pairs = 0

  frame('start', 3, 3, 'No dominoes have been read yet. The pair total starts at 0.', { index: -1, domino: null, key: null, matches: 0, pairs, counts: countList() })
  input.forEach(([a, b], index) => {
    const key = `${Math.min(a, b)}-${Math.max(a, b)}`
    frame('inspect', 5, 5, `Domino ${index + 1} is [${a}, ${b}]. Its key is ${key}, so turning it over gives the same key.`, { index, domino: [a, b], key, matches: null, pairs, counts: countList() })
    const matches = count.get(key) || 0
    pairs += matches
    count.set(key, matches + 1)
    frame('update', 6, 6, matches
      ? `${matches} earlier domino${matches === 1 ? '' : 's'} share key ${key}, so ${matches} new pair${matches === 1 ? '' : 's'} form. The total is ${pairs}.`
      : `No earlier domino has key ${key}, so no pair forms here. The total stays ${pairs}.`,
    { index, domino: [a, b], key, matches, pairs, counts: countList() })
  })
  frame('done', 9, 8, `There are ${pairs} equivalent pairs.`, { index: input.length, domino: null, key: null, matches: null, pairs, counts: countList() })
  return { input, result: pairs, frames }
}
