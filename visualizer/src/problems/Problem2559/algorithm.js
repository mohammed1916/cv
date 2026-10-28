const VOWELS = 'aeiou'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with words and queries.')
  const { words, queries } = input
  if (!Array.isArray(words) || words.length < 1 || words.length > 12) throw new Error('words must have 1 to 12 entries.')
  if (words.some(w => typeof w !== 'string' || !/^[a-z]{1,10}$/.test(w))) throw new Error('each word is 1 to 10 lowercase letters.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('queries must have 1 to 8 entries.')
  if (queries.some(q => !Array.isArray(q) || q.length !== 2 || !Number.isInteger(q[0]) || !Number.isInteger(q[1]) || q[0] < 0 || q[1] >= words.length || q[0] > q[1])) throw new Error('each query is [l, r] with 0 <= l <= r < words.length.')
  return { words, queries }
}

const isGood = w => VOWELS.includes(w[0]) && VOWELS.includes(w[w.length - 1])

export function buildTrace(input) {
  const { words, queries } = input
  const prefix = [0]
  const frames = [{ phase: 'start', activeLine: L('build prefix counts'), index: -1, prefix: [0], query: null, answers: [], message: 'Count the words that start and end with a vowel, running total by running total.' }]
  for (let i = 0; i < words.length; i++) {
    prefix.push(prefix[i] + (isGood(words[i]) ? 1 : 0))
    frames.push({ phase: 'prefix', activeLine: L('append prefix'), index: i, prefix: [...prefix], query: null, answers: [], message: `${words[i]} ${isGood(words[i]) ? 'counts' : 'does not count'}. Prefix now ${prefix[i + 1]}.` })
  }
  const answers = []
  for (const [l, r] of queries) {
    const answer = prefix[r + 1] - prefix[l]
    answers.push(answer)
    frames.push({ phase: 'query', activeLine: L('append prefix at r plus 1'), index: -1, prefix: [...prefix], query: [l, r], answers: [...answers], message: `Range [${l}, ${r}] holds ${answer} qualifying words.` })
  }
  frames.push({ phase: 'done', activeLine: L('return answers'), index: -1, prefix: [...prefix], query: null, answers: [...answers], message: 'Every query is answered.' })
  return { input, result: answers, frames }
}

export const code = `count vowel strings in ranges (words, queries):
  build prefix counts of words that start and end with a vowel
  set answers to an empty list
  for each query with left index l and right index r
    append prefix at r plus 1 minus prefix at l to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def vowel_strings(words, queries):
    vowels = 'aeiou'
    prefix = [0]
    for w in words:
        good = 1 if w[0] in vowels and w[-1] in vowels else 0
        prefix.append(prefix[-1] + good)
    answers = []
    for l, r in queries:
        answers.append(prefix[r + 1] - prefix[l])
    return answers
`
