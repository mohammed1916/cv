// Independently written teaching model. The sample inputs are invented for this visualization.
export const code = [
  'function camelMatch(queries, pattern):',
  '  answer = []',
  '  for query in queries:',
  '    answer.push(matches(query, pattern))',
  '  return answer',
  '',
  'function matches(query, pattern):',
  '  j = 0',
  '  for ch in query:',
  '    if j < length(pattern) and ch == pattern[j]: j = j + 1',
  '    else if ch is uppercase: return false',
  '  return j == length(pattern)',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def camel_match(queries, pattern):
    answer = []
    for query in queries:
        answer.append(matches(query, pattern))
    return answer

def matches(query, pattern):
    j = 0
    for ch in query:
        if j < len(pattern) and ch == pattern[j]:
            j += 1
        elif ch.isupper():
            return False
    return j == len(pattern)`

const PSEUDO = code.map(line => line.text)
const PY_LINES = python.split('\n')
function lineOf(lines, key) {
  const index = lines.findIndex(text => text.includes(key))
  if (index < 0) throw new Error(`Missing line: ${key}`)
  return index + 1
}
const frame = (phase, pseudoKey, pyKey, message, snapshot) => ({
  phase,
  activeLine: lineOf(PSEUDO, pseudoKey),
  pythonLine: lineOf(PY_LINES, pyKey),
  message,
  snapshot,
})

export const phases = [
  { id: 'start', label: 'Start', description: 'Prepare an empty answer list and a pattern pointer at zero.' },
  { id: 'inspect', label: 'Read a character', description: 'Move through one query, one character at a time.' },
  { id: 'update', label: 'Match or skip', description: 'Advance the pattern on a match, skip lowercase letters, or reject an unmatched capital.' },
  { id: 'done', label: 'Result', description: 'Return one boolean per query.' },
]

export const inputLabel = 'JSON object with queries and pattern, for example {"queries":["ApplePie"],"pattern":"AP"}'
export const complexity = 'O(total query length) per pattern check, with a single left-to-right pass over each query. The visualizer accepts up to 12 queries of up to 24 letters.'
export const examples = [
  { label: 'Two capital pivots', input: '{"queries":["MonBox","MaskBlock","MeBtBx","MB","bMB"],"pattern":"MB"}' },
  { label: 'Inserted lowercase', input: '{"queries":["FooBarTest","FootBall","FrameBuffer"],"pattern":"FB"}' },
  { label: 'Unmatched capital', input: '{"queries":["AbCd","ABcd"],"pattern":"AC"}' },
  { label: 'Pattern exhausted early', input: '{"queries":["Mon","MonX"],"pattern":"MX"}' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.queries) || typeof input.pattern !== 'string') {
    throw new Error('Use {"queries": [...], "pattern": "..."}.')
  }
  if (input.queries.length < 1 || input.queries.length > 12) throw new Error('Use between 1 and 12 queries.')
  const letters = /^[A-Za-z]{1,24}$/
  if (!input.pattern.match(letters)) throw new Error('The pattern must be 1 to 24 letters.')
  for (const query of input.queries) {
    if (typeof query !== 'string' || !letters.test(query)) throw new Error('Each query must be 1 to 24 letters.')
  }
  return { queries: [...input.queries], pattern: input.pattern }
}

export function buildTrace({ queries, pattern }) {
  const frames = []
  const answer = []
  frames.push(frame('start', 'answer = []', 'answer = []', `Start with pattern ${pattern}.`, { pattern, answer: [] }))
  queries.forEach((query, queryIndex) => {
    frames.push(frame('inspect', 'for query in queries', 'for query in queries', `Check query ${queryIndex + 1}: ${query}.`, { pattern, query, answer: [...answer] }))
    let j = 0
    let verdict = null
    for (let index = 0; index < query.length && verdict === null; index++) {
      const ch = query[index]
      frames.push(frame('inspect', 'for ch in query', 'for ch in query', `Read ${ch} with pattern position ${j}.`, { pattern, query, index, j, answer: [...answer] }))
      if (j < pattern.length && ch === pattern[j]) {
        j += 1
        frames.push(frame('update', 'j = j + 1', 'j += 1', `${ch} matches pattern letter ${j}.`, { pattern, query, index, j, answer: [...answer] }))
      } else if (ch >= 'A' && ch <= 'Z') {
        verdict = false
        frames.push(frame('update', 'else if ch is uppercase', 'elif ch.isupper()', `${ch} is an unmatched capital, so this query fails.`, { pattern, query, index, j, answer: [...answer] }))
        frames.push(frame('update', 'return false', 'return False', 'Return false for this query.', { pattern, query, index, j, answer: [...answer] }))
      } else {
        frames.push(frame('update', 'else if ch is uppercase', 'elif ch.isupper()', `${ch} is lowercase, so it can be skipped.`, { pattern, query, index, j, answer: [...answer] }))
      }
    }
    if (verdict === null) verdict = j === pattern.length
    answer.push(verdict)
    frames.push(frame('update', 'answer.push(matches', 'answer.append(matches', `${query} ${verdict ? 'can' : 'cannot'} be formed from ${pattern}.`, { pattern, query, j, answer: [...answer] }))
  })
  frames.push(frame('done', 'return answer', 'return answer', 'Every query has been checked.', { pattern, answer: [...answer], result: [...answer] }))
  return { input: { queries, pattern }, result: answer, frames }
}
