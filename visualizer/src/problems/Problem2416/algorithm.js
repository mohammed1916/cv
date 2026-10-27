const MAX_WORDS = 6
const MAX_LENGTH = 6

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.words)) throw new Error('Use an object like {"words":["abc","ab"]}.')
  if (data.words.length < 1 || data.words.length > MAX_WORDS) throw new Error(`Use 1 to ${MAX_WORDS} words.`)
  if (data.words.some(w => typeof w !== 'string' || !/^[a-z]{1,6}$/.test(w))) throw new Error(`Each word is 1 to ${MAX_LENGTH} lowercase letters.`)
  return { words: data.words }
}

export function buildTrace({ words }) {
  const counts = new Map()
  const frames = [{ phase: 'start', activeLine: L('set counts to an empty map'), word: null, counts: [], score: null, answer: [], message: 'Start with no prefixes counted.' }]
  for (const w of words) {
    for (let i = 1; i <= w.length; i++) {
      const p = w.slice(0, i)
      counts.set(p, (counts.get(p) || 0) + 1)
    }
    frames.push({ phase: 'count', activeLine: L('add one to counts'), word: w, counts: [...counts.entries()], score: null, answer: [], message: `Counted every prefix of ${w}.` })
  }
  const answer = []
  for (const w of words) {
    let score = 0
    for (let i = 1; i <= w.length; i++) {
      score += counts.get(w.slice(0, i))
      frames.push({ phase: 'score', activeLine: L('add counts[p] to score'), word: w, counts: [...counts.entries()], score, answer: [...answer], message: `Prefix ${w.slice(0, i)} adds ${counts.get(w.slice(0, i))}.` })
    }
    answer.push(score)
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), word: null, counts: [...counts.entries()], score: null, answer: [...answer], message: `Scores: ${answer.join(', ')}.` })
  return { input: { words }, result: answer, frames }
}

export const code = `sum of prefix scores for each word
  set counts to an empty map from prefix to number of words
  for each word w
    for each non-empty prefix p of w
      add one to counts[p]
  set answer to an empty list
  for each word w
    set score to 0
    for each non-empty prefix p of w
      add counts[p] to score
    add score to answer
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_prefix_scores(words):
    counts = {}
    for w in words:
        for i in range(1, len(w) + 1):
            counts[w[:i]] = counts.get(w[:i], 0) + 1
    answer = []
    for w in words:
        score = 0
        for i in range(1, len(w) + 1):
            score += counts[w[:i]]
        answer.append(score)
    return answer
`
