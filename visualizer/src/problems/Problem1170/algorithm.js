export const phases = [
  { id: 'setup', label: 'Setup', description: 'Read the queries and the words.' },
  { id: 'measure', label: 'Measure words', description: 'Find each word smallest letter and count how often it appears.' },
  { id: 'query', label: 'Compare queries', description: 'Measure each query the same way, then count the words with a strictly larger score.' },
  { id: 'done', label: 'Result', description: 'Return one count per query, in order.' },
]

const LIST_LIMIT = 20
const STRING_LIMIT = 10

export function parseInput(text) {
  let obj
  try {
    obj = typeof text === 'string' ? JSON.parse(text) : text
  } catch {
    throw new Error('Input must be JSON such as {"queries":["cbd"],"words":["cc","ab"]}')
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Input must be a JSON object with queries and words keys')
  const { queries, words } = obj
  const check = (list, name) => {
    if (!Array.isArray(list) || list.length < 1 || list.length > LIST_LIMIT) throw new Error(`${name} must be an array of 1-${LIST_LIMIT} strings`)
    list.forEach((s, index) => {
      if (typeof s !== 'string' || s.length < 1 || s.length > STRING_LIMIT || !/^[a-z]+$/.test(s)) {
        throw new Error(`${name}[${index}] must be 1-${STRING_LIMIT} lowercase letters`)
      }
    })
    return [...list]
  }
  return { queries: check(queries, 'queries'), words: check(words, 'words') }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function countGreater(queries, words) {', 'def count_greater(queries, words):'],
  ['  const score = s => s.split([...s].sort()[0]).length - 1', '    score = lambda s: s.count(min(s))'],
  ['  const wordScores = words.map(score), answers = []', '    word_scores, answers = [score(w) for w in words], []'],
  ['  for (const q of queries) {', '    for q in queries:'],
  ['    const target = score(q)', '        target = score(q)'],
  ['    answers.push(wordScores.filter(s => s > target).length)', '        answers.append(sum(1 for s in word_scores if s > target))'],
  ['  } return answers }', '    return answers'],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
export const pythonLineMap = Object.fromEntries(code.map(({ line }) => [line, line]))

// The score of a string is how many times its smallest letter occurs in it.
export function letterScore(s) {
  const smallest = [...s].sort()[0]
  return s.split(smallest).length - 1
}

export function buildTrace(text) {
  const { queries, words } = parseInput(text)
  const frames = []
  const wordScores = []
  const snap = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message,
    snapshot: { wordIndex: -1, queryIndex: -1, wordScores: [...wordScores], target: null, counted: [], answers: [], ...extra },
  })

  snap('setup', L('function countGreater'), P('def count_greater'), `There are ${words.length} words and ${queries.length} queries. Each score counts the smallest letter.`)
  snap('measure', L('const wordScores'), P('word_scores, answers'), 'Measure every word before answering any query.')
  for (let i = 0; i < words.length; i++) {
    wordScores.push(letterScore(words[i]))
    snap('measure', L('const wordScores'), P('word_scores, answers'), `${words[i]}: the smallest letter appears ${wordScores[i]} time(s), so its score is ${wordScores[i]}.`, { wordIndex: i })
  }

  const answers = []
  for (let q = 0; q < queries.length; q++) {
    const target = letterScore(queries[q])
    snap('query', L('const target'), P('target = score(q)'), `${queries[q]} has score ${target}. Words must score strictly higher to count.`, { queryIndex: q, target })
    const counted = []
    wordScores.forEach((score, i) => { if (score > target) counted.push(i) })
    answers.push(counted.length)
    snap('query', L('answers.push'), P('answers.append'), `${counted.length} word(s) score higher than ${target} for ${queries[q]}.`, {
      queryIndex: q, target, counted: [...counted], answers: [...answers],
    })
  }

  snap('done', L('return answers'), P('return answers'), `The answers are ${answers.join(', ')}.`, { answers: [...answers] })
  return { input: { queries, words }, result: answers, frames }
}
