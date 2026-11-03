export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with features and responses.')
  const { features, responses } = input
  if (!Array.isArray(features) || features.length < 1 || features.length > 8) throw new Error('features has 1 to 8 names.')
  if (!features.every(f => typeof f === 'string' && /^[a-z]+$/.test(f))) throw new Error('Each feature is lowercase letters.')
  if (new Set(features).size !== features.length) throw new Error('Feature names must be distinct.')
  if (!Array.isArray(responses) || responses.length < 1 || responses.length > 6) throw new Error('responses has 1 to 6 strings.')
  for (const r of responses) {
    if (typeof r !== 'string' || !/^[a-z]+( [a-z]+)*$/.test(r)) throw new Error('Each response is lowercase words separated by single spaces.')
  }
  return { features, responses }
}

export const code = `rank features by how many distinct responses mention them
  set count of every feature to 0
  for each response in order
    split it into words and keep the distinct words
    for each feature in its original order
      if the feature is one of the words then add 1 to its count
  stable sort the features by count, highest first
  return the sorted features`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const line = code.findIndex(c => c.text.includes(s))
  if (line < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return line + 1
}

export const python = `def sort_features(features, responses):
    count = {f: 0 for f in features}
    for response in responses:
        words = set(response.split(' '))
        for f in features:
            if f in words:
                count[f] += 1
    order = sorted(range(len(features)), key=lambda i: (-count[features[i]], i))
    return [features[i] for i in order]
`
const P = s => {
  const line = python.split('\n').findIndex(p => p.includes(s))
  if (line < 0) throw new Error(`Missing python line: ${s}`)
  return line + 1
}

export const phases = [
  { id: 'setup', label: 'Counts', description: 'Start every feature at zero.' },
  { id: 'read', label: 'Response', description: 'Split a response into distinct words.' },
  { id: 'check', label: 'Check', description: 'Test one feature against the words.' },
  { id: 'count', label: 'Count', description: 'The feature appears in this response.' },
  { id: 'sort', label: 'Sort', description: 'Order by count, ties by original position.' },
  { id: 'done', label: 'Result', description: 'Report the ranked features.' },
]

export function buildTrace({ features, responses }) {
  const frames = []
  const count = Object.fromEntries(features.map(f => [f, 0]))
  const snap = () => ({ ...count })
  frames.push({ pythonLine: P('count = {'), phase: 'setup', activeLine: L('set count of every'), ri: -1, words: [], fi: -1, hit: null, counts: snap(), placed: [], message: 'Every feature starts with zero responses.' })
  responses.forEach((response, ri) => {
    const words = [...new Set(response.split(' '))]
    frames.push({ pythonLine: P('words = set'), phase: 'read', activeLine: L('split it into words'), ri, words, fi: -1, hit: null, counts: snap(), placed: [], message: `Response ${ri + 1} has distinct words: ${words.join(', ')}.` })
    features.forEach((f, fi) => {
      const hit = words.includes(f)
      frames.push({ pythonLine: P('if f in words'), phase: 'check', activeLine: L('if the feature is one of'), ri, words, fi, hit, counts: snap(), placed: [], message: hit ? `${f} appears in response ${ri + 1}.` : `${f} is not in response ${ri + 1}.` })
      if (hit) {
        count[f] += 1
        frames.push({ pythonLine: P('count[f] += 1'), phase: 'count', activeLine: L('add 1 to its count'), ri, words, fi, hit, counts: snap(), placed: [], message: `${f} now has ${count[f]} response${count[f] === 1 ? '' : 's'}.` })
      }
    })
  })
  const order = features.map((_, i) => i).sort((a, b) => (count[features[b]] - count[features[a]]) || (a - b))
  const result = order.map(i => features[i])
  frames.push({ pythonLine: P('order = sorted'), phase: 'sort', activeLine: L('stable sort the features'), ri: responses.length, words: [], fi: -1, hit: null, counts: snap(), placed: [], message: 'Sort by count, highest first; equal counts keep their original order.' })
  const placed = []
  for (const i of order) {
    placed.push(features[i])
    frames.push({ pythonLine: P('return [features'), phase: 'sort', activeLine: L('stable sort the features'), ri: responses.length, words: [], fi: i, hit: null, counts: snap(), placed: [...placed], message: `${features[i]} goes at position ${placed.length} with ${count[features[i]]}.` })
  }
  frames.push({ pythonLine: P('return [features'), phase: 'done', activeLine: L('return the sorted'), ri: responses.length, words: [], fi: -1, hit: null, counts: snap(), placed: [...placed], message: `Ranking: ${result.join(', ')}.` })
  return { input: { features, responses }, result, frames }
}
