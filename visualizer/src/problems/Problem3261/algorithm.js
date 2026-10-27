export function parseInput(text) {
  const input = JSON.parse(text)
  const { s, k, queries } = input ?? {}
  if (typeof s !== 'string' || s.length < 1 || s.length > 12 || !/^[01]+$/.test(s)) throw new Error('Give s as a binary string of 1 to 12 characters.')
  if (!Number.isInteger(k) || k < 0 || k > 12) throw new Error('k is an integer from 0 to 12.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 5) throw new Error('Give 1 to 5 queries.')
  if (queries.some(q => !Array.isArray(q) || q.length !== 2 || !Number.isInteger(q[0]) || !Number.isInteger(q[1]) || q[0] < 0 || q[0] > q[1] || q[1] >= s.length)) throw new Error('Each query is [l, r] with 0 <= l <= r < s.length.')
  return { s, k, queries }
}

export function buildTrace({ s, k, queries }) {
  const frames = [{ phase: 'start', activeLine: L('set answers to an empty list'), query: -1, left: 0, right: -1, zeros: 0, ones: 0, total: 0, answers: [], message: 'A substring passes when it has at most k zeros or at most k ones.' }]
  const answers = []
  queries.forEach(([queryLeft, queryRight], q) => {
    let left = queryLeft, zeros = 0, ones = 0, total = 0
    for (let right = queryLeft; right <= queryRight; right++) {
      if (s[right] === '0') zeros++
      else ones++
      frames.push({ phase: 'extend', activeLine: L('add its character'), query: q, left, right, zeros, ones, total, answers: [...answers], message: `Add s[${right}]. Window ${left} to ${right} has ${zeros} zeros and ${ones} ones.` })
      while (zeros > k && ones > k) {
        if (s[left] === '0') zeros--
        else ones--
        left++
        frames.push({ phase: 'shrink', activeLine: L('remove the character at left'), query: q, left, right, zeros, ones, total, answers: [...answers], message: `Both counts exceed ${k}, so move the left end to ${left}.` })
      }
      total += right - left + 1
      frames.push({ phase: 'count', activeLine: L('add right minus left plus one'), query: q, left, right, zeros, ones, total, answers: [...answers], message: `Every start from ${left} to ${right} passes for this end. Query total ${total}.` })
    }
    answers.push(total)
    frames.push({ phase: 'answer', activeLine: L('append total'), query: q, left, right: queryRight, zeros, ones, total, answers: [...answers], message: `Query ${q} answer is ${total}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return answers'), query: -1, left: 0, right: -1, zeros: 0, ones: 0, total: 0, answers: [...answers], message: `Answers: ${answers.join(', ')}.` })
  return { input: { s, k, queries }, result: answers, frames }
}

export const code = `count substrings that satisfy the k constraint (s, k, queries)
  set answers to an empty list
  for each query from its left end to its right end
    set left to the query start and total to zero
    for each right position in the query range
      add its character to the zero or one count
      while zeros and ones are both above k
        remove the character at left and move left one step right
      add right minus left plus one to total
    append total to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_k_constraint_substrings(s, k, queries):
    answers = []
    for query_left, query_right in queries:
        left = query_left
        zeros = 0
        ones = 0
        total = 0
        for right in range(query_left, query_right + 1):
            if s[right] == '0':
                zeros += 1
            else:
                ones += 1
            while zeros > k and ones > k:
                if s[left] == '0':
                    zeros -= 1
                else:
                    ones -= 1
                left += 1
            total += right - left + 1
        answers.append(total)
    return answers
`
