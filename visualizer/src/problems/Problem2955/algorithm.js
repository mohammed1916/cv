export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and queries.')
  const { s, queries } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 30 || !/^[a-z]+$/.test(s)) throw new Error('s has 1 to 30 lowercase letters.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6) throw new Error('queries has 1 to 6 ranges.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || !q.every(Number.isInteger)) throw new Error('Each query is a [l, r] pair of integers.')
    if (q[0] < 0 || q[1] >= s.length || q[0] > q[1]) throw new Error('Each query needs 0 <= l <= r < length of s (zero-based, inclusive).')
  }
  return { s, queries }
}

// A letter that occurs c times in a range gives c * (c + 1) / 2 substrings whose two ends are both that letter
// (choose a start and an end among those c positions, allowing the same position for single characters).
export function buildTrace({ s, queries }) {
  const frames = []
  const letters = [...new Set(s)].sort()
  const prefix = new Map(letters.map(ch => [ch, [0]]))
  for (const ch of s) {
    for (const c of letters) prefix.get(c).push(prefix.get(c).at(-1) + (ch === c ? 1 : 0))
  }
  const answers = []
  const push = (phase, pythonLine, text, state, message) =>
    frames.push({ phase, pythonLine, activeLine: L(text), answers: [...answers], ...state, message })

  push('start', 2, 'build prefix counts', { query: -1, letter: null, count: null, pairs: null, answer: 0 }, `Letters present: ${letters.join(', ')}. Prefix counts are ready.`)
  for (let qi = 0; qi < queries.length; qi++) {
    const [l, r] = queries[qi]
    let answer = 0
    push('query', 8, 'for each query', { query: qi, range: [l, r], letter: null, count: null, pairs: null, answer }, `Query ${qi + 1}: range ${l} to ${r} of "${s}".`)
    for (const c of letters) {
      const count = prefix.get(c)[r + 1] - prefix.get(c)[l]
      const pairs = count * (count + 1) / 2
      answer += pairs
      push('letter', 12, 'add count times count', { query: qi, range: [l, r], letter: c, count, pairs, answer },
        count > 0 ? `${c} appears ${count} time${count === 1 ? '' : 's'}, giving ${pairs} same-end substrings.` : `${c} does not appear in this range.`)
    }
    answers.push(answer)
    push('answer', 13, 'append answer', { query: qi, range: [l, r], letter: null, count: null, pairs: null, answer }, `Query ${qi + 1} answer: ${answer}.`)
  }
  push('done', 14, 'return answers', { query: -1, letter: null, count: null, pairs: null, answer: null }, `Answers: ${answers.join(', ')}.`)
  return { input: { s, queries }, result: answers, frames }
}

export const code = `same-end substring counts for each query range
  build prefix counts for each letter that appears
  answers starts empty
  for each query [l, r]
    answer is zero
    for each letter present, count its occurrences from l to r
      add count times count plus one over two to answer
    append answer
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def same_end_counts(s, queries):
    letters = sorted(set(s))
    prefix = {ch: [0] for ch in letters}
    for ch in s:
        for c in letters:
            prefix[c].append(prefix[c][-1] + (1 if ch == c else 0))
    answers = []
    for l, r in queries:
        answer = 0
        for c in letters:
            count = prefix[c][r + 1] - prefix[c][l]
            answer += count * (count + 1) // 2
        answers.append(answer)
    return answers
`
