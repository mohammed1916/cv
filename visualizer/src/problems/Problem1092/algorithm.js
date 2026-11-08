export const phases = [
  { id: 'start', label: 'Table', description: 'Set up the border values of the table.' },
  { id: 'fill', label: 'Fill cell', description: 'Each cell uses its diagonal or its smaller neighbour.' },
  { id: 'walk', label: 'Walk', description: 'Emit characters from the top-left corner along shortest moves.' },
  { id: 'done', label: 'Complete', description: 'Report the supersequence.' },
]

export const inputLabel = 'Two strings as JSON: str1, str2'
export const complexity = 'O(n * m) time and O(n * m) space for the table. The visualization caps each string at 8 letters.'
export const examples = [
  { label: 'Example 1', input: '{"str1":"ploy","str2":"lyr"}' },
  { label: 'Example 2', input: '{"str1":"aaaa","str2":"aa"}' },
  { label: 'Single letter', input: '{"str1":"a","str2":"a"}' },
  { label: 'Identical strings', input: '{"str1":"abc","str2":"abc"}' },
  { label: 'No shared letters', input: '{"str1":"x","str2":"y"}' },
  { label: 'Longest length 8, reversed', input: '{"str1":"abcdefgh","str2":"hgfedcba"}' },
  { label: 'Long run: 8 and 7 letters', input: '{"str1":"gycdzuxf","str2":"ltfkyzm"}' },
]

export const code = `function shortestCommonSupersequence(str1, str2) {
  const n = str1.length
  const m = str2.length
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let j = 0; j <= m; j++) dp[n][j] = m - j
  for (let i = 0; i <= n; i++) dp[i][m] = n - i
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (str1[i] === str2[j]) dp[i][j] = 1 + dp[i + 1][j + 1]
      else dp[i][j] = 1 + Math.min(dp[i + 1][j], dp[i][j + 1])
    }
  }
  let i = 0
  let j = 0
  let answer = ''
  while (i < n || j < m) {
    if (i === n) { answer += str2[j]; j++ }
    else if (j === m) { answer += str1[i]; i++ }
    else if (str1[i] === str2[j]) { answer += str1[i]; i++; j++ }
    else if (dp[i + 1][j] <= dp[i][j + 1]) { answer += str1[i]; i++ }
    else { answer += str2[j]; j++ }
  }
  return answer
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def shortest_common_supersequence(str1, str2):
    n, m = len(str1), len(str2)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for j in range(m + 1):
        dp[n][j] = m - j
    for i in range(n + 1):
        dp[i][m] = n - i
    for i in range(n - 1, -1, -1):
        for j in range(m - 1, -1, -1):
            if str1[i] == str2[j]:
                dp[i][j] = 1 + dp[i + 1][j + 1]
            else:
                dp[i][j] = 1 + min(dp[i + 1][j], dp[i][j + 1])
    i = j = 0
    out = []
    while i < n or j < m:
        if i == n:
            out.append(str2[j])
            j += 1
        elif j == m:
            out.append(str1[i])
            i += 1
        elif str1[i] == str2[j]:
            out.append(str1[i])
            i += 1
            j += 1
        elif dp[i + 1][j] <= dp[i][j + 1]:
            out.append(str1[i])
            i += 1
        else:
            out.append(str2[j])
            j += 1
    return ''.join(out)
`
const PY = python.trim().split('\n')
const P = s => {
  const line = PY.findIndex(text => text.includes(s)) + 1
  if (line < 1) throw new Error(`Python line missing: ${s}`)
  return line
}

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with str1 and str2.')
  const { str1, str2 } = data
  for (const [name, value] of [['str1', str1], ['str2', str2]]) {
    if (typeof value !== 'string' || value.length < 1 || value.length > 8 || !/^[a-z]+$/.test(value)) throw new Error(`${name} is 1 to 8 lowercase letters.`)
  }
  return { str1, str2 }
}

export function buildTrace(input) {
  const { str1, str2 } = input
  const n = str1.length
  const m = str2.length
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(null))
  const frames = []
  const snapshot = () => dp.map(row => [...row])
  const frame = (phase, codeKey, pyKey, cell, answer, message) => frames.push({
    phase, activeLine: L(codeKey), pythonLine: P(pyKey), cell, answer, dp: snapshot(), message,
  })
  frame('start', 'const dp = Array.from', 'dp = [[0]', null, '', 'Each cell holds the shortest supersequence length for the suffixes starting there.')
  for (let j = 0; j <= m; j++) dp[n][j] = m - j
  for (let i = 0; i <= n; i++) dp[i][m] = n - i
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (str1[i] === str2[j]) {
        dp[i][j] = 1 + dp[i + 1][j + 1]
        frame('fill', 'if (str1[i] === str2[j]) dp', 'if str1[i] == str2[j]', [i, j], '', `${str1[i]} matches ${str2[j]}, so the cell is one plus the diagonal, ${dp[i][j]}.`)
      } else {
        dp[i][j] = 1 + Math.min(dp[i + 1][j], dp[i][j + 1])
        frame('fill', 'else dp[i][j] = 1 + Math.min', 'dp[i][j] = 1 + min', [i, j], '', `${str1[i]} and ${str2[j]} differ, so take one character plus the smaller neighbour, ${dp[i][j]}.`)
      }
    }
  }
  let i = 0
  let j = 0
  let answer = ''
  frame('walk', 'let i = 0', 'i = j = 0', [0, 0], answer, 'Walk from the top-left corner, emitting one character per step.')
  while (i < n || j < m) {
    if (i === n) {
      answer += str2[j]
      j++
      frame('walk', 'if (i === n)', 'if i == n', [i, j - 1], answer, `str1 is used up, so emit ${str2[j - 1]} from str2.`)
    } else if (j === m) {
      answer += str1[i]
      i++
      frame('walk', 'else if (j === m)', 'elif j == m', [i - 1, j], answer, `str2 is used up, so emit ${str1[i - 1]} from str1.`)
    } else if (str1[i] === str2[j]) {
      answer += str1[i]
      i++
      j++
      frame('walk', 'else if (str1[i] === str2[j])', 'elif str1[i] == str2[j]', [i - 1, j - 1], answer, `Both strings share ${str1[i - 1]}, so emit it once.`)
    } else if (dp[i + 1][j] <= dp[i][j + 1]) {
      answer += str1[i]
      i++
      frame('walk', 'else if (dp[i + 1][j]', 'elif dp[i + 1][j]', [i - 1, j], answer, `Emit ${str1[i - 1]} from str1; the rest is still shortest.`)
    } else {
      answer += str2[j]
      j++
      frame('walk', 'else { answer += str2[j]', 'else:', [i, j - 1], answer, `Emit ${str2[j - 1]} from str2; the rest is still shortest.`)
    }
  }
  frame('done', 'return answer', 'return', null, answer, `The shortest supersequence is ${answer}, with length ${answer.length}.`)
  return { input, result: answer, frames }
}
