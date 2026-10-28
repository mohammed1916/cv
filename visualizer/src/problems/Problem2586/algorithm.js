export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.words) || input.words.length < 1 || input.words.length > 10) throw new Error('Use an object with words: an array of 1 to 10 words.')
  if (input.words.some(w => typeof w !== 'string' || !/^[a-z]{1,6}$/.test(w))) throw new Error('Each word is 1 to 6 lowercase letters.')
  if (!Array.isArray(input.queries) || input.queries.length < 1 || input.queries.length > 10) throw new Error('Use queries: an array of 1 to 10 [l, r] pairs.')
  const n = input.words.length
  if (input.queries.some(q => !Array.isArray(q) || q.length !== 2 || !Number.isInteger(q[0]) || !Number.isInteger(q[1]) || q[0] < 0 || q[1] >= n || q[0] > q[1])) throw new Error('Each query is [l, r] with 0 <= l <= r < words.length.')
  return { words: input.words, queries: input.queries }
}

const VOWELS = 'aeiou'
const qualifies = word => VOWELS.includes(word[0]) && VOWELS.includes(word[word.length - 1])

export function buildTrace(input) {
  const { words, queries } = input
  const running = [0]
  const flags = []
  const frames = [{ phase: 'start', activeLine: L('set running to'), index: -1, running: [0], flags, range: null, message: 'Start a running count at 0 before the first word.' }]
  words.forEach((word, i) => {
    const hit = qualifies(word) ? 1 : 0
    flags.push(hit)
    running.push(running[i] + hit)
    frames.push({ phase: 'count', activeLine: L('add 1 to the running total'), index: i, running: [...running], flags: [...flags], range: null, message: `${word} ${hit ? 'starts and ends with a vowel' : 'does not qualify'}. Running total ${running[i + 1]}.` })
  })
  const result = queries.map(([l, r], q) => {
    const count = running[r + 1] - running[l]
    frames.push({ phase: 'query', activeLine: L('subtract running[l]'), index: r, running: [...running], flags: [...flags], range: [l, r], query: q, count, message: `Query [${l}, ${r}]: ${running[r + 1]} minus ${running[l]} gives ${count}.` })
    return count
  })
  frames.push({ phase: 'done', activeLine: L('return answers'), index: -1, running: [...running], flags: [...flags], range: null, message: `Answers: ${result.join(', ')}.` })
  return { input, result, frames }
}

export const code = `count vowel strings within each query range
  set running to [0]
  for each word in words do
    add 1 to the running total if the word starts and ends with a vowel
    append the running total to running
  set answers to an empty list
  for each query [l, r] do
    subtract running[l] from running[r + 1] to get the count
    add the count to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def vowel_strings_in_range(words, queries):
    vowels = 'aeiou'
    running = [0]
    for word in words:
        hit = 1 if word[0] in vowels and word[-1] in vowels else 0
        running.append(running[-1] + hit)
    return [running[r + 1] - running[l] for l, r in queries]
`
