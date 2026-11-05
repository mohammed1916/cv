// LeetCode 2217: Find Palindrome With Fixed Length.
// A palindrome of length L is fixed by its first ceil(L / 2) digits, and those digits form an increasing sequence
// with no leading zero. The q-th palindrome has first half 10^(h-1) + q - 1, where h = ceil(L / 2). If that half
// has more than h digits, no such palindrome exists. Mirror the half to complete the palindrome.

const MAX_LENGTH = 6
const MAX_QUERIES = 6
const MAX_QUERY = 1000

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"queries":[1,2,3],"intLength":4}.') }
  if (!spec || !Array.isArray(spec.queries) || !Number.isInteger(spec.intLength)) throw new Error('Give a queries array and an integer intLength.')
  if (spec.intLength < 1 || spec.intLength > MAX_LENGTH) throw new Error(`intLength is from 1 to ${MAX_LENGTH} in this visualization.`)
  if (spec.queries.length < 1 || spec.queries.length > MAX_QUERIES) throw new Error(`Use 1 to ${MAX_QUERIES} queries.`)
  if (!spec.queries.every(q => Number.isInteger(q) && q >= 1 && q <= MAX_QUERY)) throw new Error(`Each query is an integer from 1 to ${MAX_QUERY}.`)
  return { queries: spec.queries, intLength: spec.intLength }
}

export const code = `FUNCTION palindromeNumbers(queries, intLength)
    h ← ceil(intLength / 2)
    FOR each query q
        half ← 10^(h - 1) + q - 1
        IF length of half > h THEN
            answer ← -1
        ELSE
            mirror ← reverse of half without its last digit when intLength is odd
            answer ← half followed by mirror
    RETURN answers`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def palindrome_numbers(queries, int_length):
    h = (int_length + 1) // 2
    answers = []
    for q in queries:
        half = 10 ** (h - 1) + q - 1
        s = str(half)
        if len(s) > h:
            answers.append(-1)
            continue
        mirror = s[:-1] if int_length % 2 else s
        answers.append(int(s + mirror[::-1]))
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
  { id: 'start', label: 'Half length', description: 'Only the first half of the digits is free.' },
  { id: 'query', label: 'Queries', description: 'Each query picks the next first half and mirrors it.' },
  { id: 'done', label: 'Answers', description: 'One palindrome or -1 per query.' },
]

export function buildTrace({ queries, intLength }) {
  const h = Math.ceil(intLength / 2)
  const answers = []
  const frames = []
  const push = (phase, index, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index, activeLine, pythonLine, message, queries, intLength, h, answers: answers.slice(), ...extra })
  push('start', -1, L('h ← ceil'), P('h = (int_length + 1)'), `Palindromes of length ${intLength} are fixed by their first ${h} digit(s).`)
  queries.forEach((q, i) => {
    const half = 10 ** (h - 1) + q - 1
    const s = String(half)
    if (s.length > h) {
      answers.push(-1)
      push('query', i, L('answer ← -1'), P('answers.append(-1)'), `Query ${q}: the first half would be ${half}, which has too many digits. Answer -1.`, { q, half, answer: -1 })
      return
    }
    const mirror = intLength % 2 ? s.slice(0, -1) : s
    const answer = Number(s + mirror.split('').reverse().join(''))
    answers.push(answer)
    push('query', i, L('mirror ← reverse'), P('mirror = s[:-1]'), `Query ${q}: first half ${s}, mirrored to ${answer}.`, { q, half: s, answer })
  })
  push('done', -1, L('RETURN answers'), P('return answers'), `Answers: ${answers.join(', ')}.`, { result: answers.slice() })
  return { input: { queries, intLength }, result: answers, frames }
}
