const BIT = /^[AB]+$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and queries.')
  const { s, queries } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 12 || !BIT.test(s)) throw new Error('s is 1 to 12 characters, each A or B.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('queries holds 1 to 8 entries.')
  for (const q of queries) {
    if (!Array.isArray(q)) throw new Error('Each query is a list.')
    if (q[0] === 1 && q.length === 2 && Number.isInteger(q[1]) && q[1] >= 0 && q[1] < s.length) continue
    if (q[0] === 2 && q.length === 3 && Number.isInteger(q[1]) && Number.isInteger(q[2]) && q[1] >= 0 && q[1] <= q[2] && q[2] < s.length) continue
    throw new Error('Use [1, j] to flip index j, or [2, l, r] with 0 <= l <= r < length.')
  }
  return { s, queries }
}

export function buildTrace({ s, queries }) {
  const chars = s.split('')
  const frames = []
  const answers = []
  for (let q = 0; q < queries.length; q++) {
    const [type, a, b] = queries[q]
    if (type === 1) {
      chars[a] = chars[a] === 'A' ? 'B' : 'A'
      frames.push({ pythonLine: pyAt('chars[j] = '), phase: 'flip', activeLine: codeAt('if it flips index'), at: a, lo: -1, hi: -1, count: null, text: chars.join(''), message: `Flip index ${a} to ${chars[a]}.` })
      continue
    }
    let count = 0
    frames.push({ pythonLine: pyAt('count = 0'), phase: 'start', activeLine: codeAt('count equal neighbours'), at: -1, lo: a, hi: b, count, text: chars.join(''), message: `Count equal neighbours from ${a} to ${b}.` })
    for (let i = a; i < b; i++) {
      if (chars[i] === chars[i + 1]) {
        count++
        frames.push({ pythonLine: pyAt('count += 1'), phase: 'pair', activeLine: codeAt('count equal neighbours'), at: i, lo: a, hi: b, count, text: chars.join(''), message: `Positions ${i} and ${i + 1} are both ${chars[i]}: one deletion.` })
      } else {
        frames.push({ pythonLine: pyAt('if chars[i]'), phase: 'skip', activeLine: codeAt('count equal neighbours'), at: i, lo: a, hi: b, count, text: chars.join(''), message: `Positions ${i} and ${i + 1} differ.` })
      }
    }
    answers.push(count)
    frames.push({ pythonLine: pyAt('answers.append'), phase: 'answer', activeLine: codeAt('record the count'), at: -1, lo: a, hi: b, count, text: chars.join(''), message: `Answer for this query: ${count}.` })
  }
  frames.push({ pythonLine: pyAt('return answers'), phase: 'done', activeLine: codeAt('return the recorded answers'), at: -1, lo: -1, hi: -1, count: null, text: chars.join(''), message: `Answers: [${answers.join(', ')}].` })
  return { input: { s, queries }, result: answers, frames }
}

export const code = `answer each query in order
  chars is the string as a list
  for each query
    if it flips index j then toggle chars at j
    otherwise
      count equal neighbours from l to r minus one
      record the count
  return the recorded answers`.split('\n').map((text, index) => ({ line: index + 1, text }))

const codeAt = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_deletions(s, queries):
    chars = list(s)
    answers = []
    for query in queries:
        if query[0] == 1:
            j = query[1]
            chars[j] = 'B' if chars[j] == 'A' else 'A'
        else:
            _, l, r = query
            count = 0
            for i in range(l, r):
                if chars[i] == chars[i + 1]:
                    count += 1
            answers.append(count)
    return answers
`
const pyAt = s => python.split('\n').findIndex(l => l.includes(s)) + 1
