const LOWER = /^[a-z]+$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with first and second.')
  const { first, second } = input
  for (const [name, s] of [['first', first], ['second', second]]) {
    if (typeof s !== 'string' || s.length < 1 || s.length > 8 || !LOWER.test(s)) throw new Error(`${name} is 1 to 8 lowercase letters.`)
  }
  return { first, second }
}

// Placement of x followed by y with an overlap of k characters (k = 0 means no overlap).
const place = (x, y, k) => x + y.slice(k)

export function buildTrace({ first, second }) {
  const frames = []
  const candidates = []
  const frame = fields => frames.push({ candidates: candidates.map(c => ({ ...c })), ...fields })
  frame({ pythonLine: P('if second in first'), phase: 'start', activeLine: L('if the first string contains the second'), x: '', y: '', k: -1, text: '', message: `Compare "${first}" and "${second}".` })
  if (first.includes(second)) {
    frame({ pythonLine: P('return first'), phase: 'done', activeLine: L('if the first string contains'), x: first, y: second, k: -1, text: first, message: `"${second}" is inside "${first}", so "${first}" is the answer.` })
    return { input: { first, second }, result: first, frames }
  }
  if (second.includes(first)) {
    frame({ pythonLine: P('return second'), phase: 'done', activeLine: L('if the second string contains'), x: second, y: first, k: -1, text: second, message: `"${first}" is inside "${second}", so "${second}" is the answer.` })
    return { input: { first, second }, result: second, frames }
  }
  for (const [x, y] of [[first, second], [second, first]]) {
    for (let k = 0; k < Math.min(x.length, y.length); k++) {
      if (!x.endsWith(y.slice(0, k))) continue
      const text = place(x, y, k)
      candidates.push({ x, y, k, text })
      frame({ pythonLine: P('candidates.append'), phase: 'candidate', activeLine: L('if x ends with the first k characters of y'), x, y, k, text, message: `"${x}" then "${y}" with ${k} shared characters gives "${text}" (length ${text.length}).` })
    }
  }
  const best = candidates.reduce((bestSoFar, c) => (c.text.length < bestSoFar.text.length || (c.text.length === bestSoFar.text.length && c.text < bestSoFar.text) ? c : bestSoFar))
  frame({ pythonLine: P('return min(candidates'), phase: 'done', activeLine: L('return the shortest candidate'), x: best.x, y: best.y, k: best.k, text: best.text, message: `Shortest length ${best.text.length}; ties go to the smaller string, so the answer is "${best.text}".` })
  return { input: { first, second }, result: best.text, frames }
}

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const code = `shortest string containing both strings as substrings
  if the first string contains the second return the first
  if the second string contains the first return the second
  candidates is empty
  for each order (x, y) in (first, second) and (second, first)
    for each shared length k below the shorter length
      if x ends with the first k characters of y
        add x followed by the rest of y to the candidates
  return the shortest candidate, breaking ties by lexicographic order`.split('\n').map((text, index) => ({ line: index + 1, text: text.trimEnd() }))

export const python = `def shortest_superstring(first, second):
    if second in first:
        return first
    if first in second:
        return second
    candidates = []
    for x, y in ((first, second), (second, first)):
        for k in range(min(len(x), len(y))):
            if x.endswith(y[:k]):
                candidates.append(x + y[k:])
    return min(candidates, key=lambda s: (len(s), s))
`
