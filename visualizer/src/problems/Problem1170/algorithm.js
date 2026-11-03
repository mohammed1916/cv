export const phases = [
  { id: 'setup', label: 'Setup', description: 'Read the queries and the words.' },
  { id: 'measure', label: 'Measure words', description: 'Find each word smallest letter and count how often it appears.' },
  { id: 'query', label: 'Compare queries', description: 'Measure each query the same way, then count the words with a strictly larger score.' },
  { id: 'done', label: 'Result', description: 'Return one count per query, in order.' },
]

const CODE_LINES = [
  'FUNCTION countGreater(queries, words)',
  '  score(s) <- how many times the smallest letter of s appears',
  '  wordScores <- score of each word',
  '  FOR each query q',
  '    target <- score(q)',
  '    answer <- number of wordScores strictly greater than target',
  '  RETURN answers',
]

const PYTHON_LINES = [
  'def score(s):',
  '    smallest = min(s)',
  '    return s.count(smallest)',
  'def countGreater(queries, words):',
  '    word_scores = [score(w) for w in words]',
  '    answers = []',
  '    for q in queries:',
  '        target = score(q)',
  '        answers.append(sum(1 for s in word_scores if s > target))',
  '    return answers',
]

const py = text => PYTHON_LINES.findIndex(line => line.includes(text)) + 1

export const python = PYTHON_LINES.join('\n')
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
export const pythonLineMap = {
  1: py('def countGreater'), 2: py('smallest = min'), 3: py('word_scores = '), 4: py('for q in'), 5: py('target = '), 6: py('answers.append'), 7: py('return answers'),
}

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

// The score of a string is how many times its smallest letter occurs in it.
export function letterScore(s) {
  const smallest = [...s].sort()[0]
  return s.split(smallest).length - 1
}

export function buildTrace(text) {
  const { queries, words } = parseInput(text)
  const frames = []
  const wordScores = []
  const snap = (phase, activeLine, message, extra = {}) => frames.push({
    phase, activeLine, message,
    snapshot: { wordIndex: -1, queryIndex: -1, wordScores: [...wordScores], target: null, counted: [], answers: [], ...extra },
  })

  snap('setup', 1, `There are ${words.length} words and ${queries.length} queries. Each score counts the smallest letter.`)
  snap('measure', 2, 'Measure every word before answering any query.')
  for (let i = 0; i < words.length; i++) {
    wordScores.push(letterScore(words[i]))
    snap('measure', 3, `${words[i]}: the smallest letter appears ${wordScores[i]} time(s), so its score is ${wordScores[i]}.`, { wordIndex: i })
  }

  const answers = []
  for (let q = 0; q < queries.length; q++) {
    const target = letterScore(queries[q])
    snap('query', 5, `${queries[q]} has score ${target}. Words must score strictly higher to count.`, { queryIndex: q, target })
    const counted = []
    wordScores.forEach((score, i) => { if (score > target) counted.push(i) })
    answers.push(counted.length)
    snap('query', 6, `${counted.length} word(s) score higher than ${target} for ${queries[q]}.`, {
      queryIndex: q, target, counted: [...counted], answers: [...answers],
    })
  }

  snap('done', 7, `The answers are ${answers.join(', ')}.`, { answers: [...answers] })
  return { input: { queries, words }, result: answers, frames }
}
