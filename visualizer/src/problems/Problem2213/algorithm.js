// LeetCode 2213: Longest Substring of One Repeating Character.
// Each query replaces one character, then asks for the longest run of a single repeated character. A run is a maximal
// block of equal neighbours. This page rescans the runs after each query, so each answer is read straight off the
// current string.

const MAX_LEN = 12
const MAX_QUERIES = 4

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"s":"babacc","queryCharacters":"bcb","queryIndices":[1,3,3]}.') }
  if (!spec || typeof spec.s !== 'string' || typeof spec.queryCharacters !== 'string' || !Array.isArray(spec.queryIndices)) throw new Error('Give s, queryCharacters and queryIndices.')
  if (!/^[a-z]+$/.test(spec.s) || spec.s.length < 1 || spec.s.length > MAX_LEN) throw new Error(`s is 1 to ${MAX_LEN} lowercase letters.`)
  if (spec.queryCharacters.length !== spec.queryIndices.length || spec.queryIndices.length < 1 || spec.queryIndices.length > MAX_QUERIES) throw new Error(`Use 1 to ${MAX_QUERIES} queries, one character and one index each.`)
  if (!/^[a-z]+$/.test(spec.queryCharacters)) throw new Error('queryCharacters are lowercase letters.')
  if (!spec.queryIndices.every(i => Number.isInteger(i) && i >= 0 && i < spec.s.length)) throw new Error('Each query index is inside s.')
  return { s: spec.s, queryCharacters: spec.queryCharacters, queryIndices: spec.queryIndices }
}

export const code = `FUNCTION longestRepeating(s, queryCharacters, queryIndices)
    chars ← characters of s
    answers ← empty list
    FOR each query q
        chars[queryIndices[q]] ← queryCharacters[q]
        best ← 0
        run ← 0
        FOR i from 0 to length - 1
            IF i = 0 OR chars[i] differs from chars[i - 1] THEN run ← 0
            run ← run + 1
            best ← max(best, run)
        append best to answers
    RETURN answers`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def longest_repeating(s, query_characters, query_indices):
    chars = list(s)
    answers = []
    for ch, idx in zip(query_characters, query_indices):
        chars[idx] = ch
        best = run = 0
        for i in range(len(chars)):
            if i == 0 or chars[i] != chars[i - 1]:
                run = 0
            run += 1
            best = max(best, run)
        answers.append(best)
    return answers
`

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

export const phases = [
  { id: 'query', label: 'Update', description: 'Replace one character as the query asks.' },
  { id: 'scan', label: 'Scan runs', description: 'Walk the string and track the current run length.' },
  { id: 'done', label: 'Answers', description: 'One answer per query.' },
]

export function buildTrace({ s, queryCharacters, queryIndices }) {
  const chars = s.split('')
  const answers = []
  const frames = []
  const push = (phase, q, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index: q, q, activeLine, pythonLine, message, s, queryCharacters, queryIndices, chars: chars.slice(), answers: answers.slice(), ...extra })
  push('query', -1, L('chars ← characters'), P('chars = list(s)'), `${chars.length} characters and ${queryIndices.length} queries.`)
  for (let q = 0; q < queryIndices.length; q++) {
    chars[queryIndices[q]] = queryCharacters[q]
    push('query', q, L('chars[queryIndices[q]]'), P('chars[idx] = ch'), `Query ${q}: set position ${queryIndices[q]} to ${queryCharacters[q]}.`, { changed: queryIndices[q] })
    let best = 0
    let run = 0
    for (let i = 0; i < chars.length; i++) {
      if (i === 0 || chars[i] !== chars[i - 1]) run = 0
      run += 1
      best = Math.max(best, run)
    }
    answers.push(best)
    push('scan', q, L('best ← max(best'), P('best = max(best, run)'), `The longest run after query ${q} is ${best}.`, { best, run, changed: queryIndices[q] })
  }
  push('done', -1, L('RETURN answers'), P('return answers'), `Answers: ${answers.join(', ')}.`, { result: answers.slice() })
  return { input: { s, queryCharacters, queryIndices }, result: answers, frames }
}
