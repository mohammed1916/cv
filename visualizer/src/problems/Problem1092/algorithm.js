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
  const frame = (phase, line, cell, answer, message) => frames.push({ phase, activeLine: line, cell, answer, dp: snapshot(), message })
  frame('start', L('set the table to rows'), null, '', 'Each cell holds the shortest supersequence length for the suffixes starting there.')
  for (let j = 0; j <= m; j++) dp[n][j] = m - j
  for (let i = 0; i <= n; i++) dp[i][m] = n - i
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (str1[i] === str2[j]) {
        dp[i][j] = 1 + dp[i + 1][j + 1]
        frame('fill', L('if the characters at the cell match'), [i, j], '', `${str1[i]} matches ${str2[j]}, so the cell is one plus the diagonal, ${dp[i][j]}.`)
      } else {
        dp[i][j] = 1 + Math.min(dp[i + 1][j], dp[i][j + 1])
        frame('fill', L('otherwise set the cell to one plus'), [i, j], '', `${str1[i]} and ${str2[j]} differ, so take one character plus the smaller neighbour, ${dp[i][j]}.`)
      }
    }
  }
  let i = 0
  let j = 0
  let answer = ''
  frame('walk', L('set i and j to 0'), [0, 0], answer, 'Walk from the top-left corner, emitting one character per step.')
  while (i < n || j < m) {
    if (i === n) {
      answer += str2[j]
      j++
      frame('walk', L('if str1 is used up'), [i, j - 1], answer, `str1 is used up, so emit ${str2[j - 1]} from str2.`)
    } else if (j === m) {
      answer += str1[i]
      i++
      frame('walk', L('if str2 is used up'), [i - 1, j], answer, `str2 is used up, so emit ${str1[i - 1]} from str1.`)
    } else if (str1[i] === str2[j]) {
      answer += str1[i]
      i++
      j++
      frame('walk', L('if the characters match then'), [i - 1, j - 1], answer, `Both strings share ${str1[i - 1]}, so emit it once.`)
    } else if (dp[i + 1][j] <= dp[i][j + 1]) {
      answer += str1[i]
      i++
      frame('walk', L('if the cell below is no longer'), [i - 1, j], answer, `Emit ${str1[i - 1]} from str1; the rest is still shortest.`)
    } else {
      answer += str2[j]
      j++
      frame('walk', L('otherwise append str2'), [i, j - 1], answer, `Emit ${str2[j - 1]} from str2; the rest is still shortest.`)
    }
  }
  frame('done', L('return the built string'), null, answer, `The shortest supersequence is ${answer}, with length ${answer.length}.`)
  return { input, result: answer, frames }
}

export const code = `shortest common supersequence of str1 and str2
  set the table to rows for str1 and columns for str2, with border values
  for each cell from the bottom right to the top left, do
    if the characters at the cell match then set the cell to one plus the diagonal cell
    otherwise set the cell to one plus the smaller of the cell below and the cell to the right
  set i and j to 0 and an empty answer
  while i or j is not at its end, do
    if str1 is used up then append str2 at j and advance j
    else if str2 is used up then append str1 at i and advance i
    else if the characters match then append that character and advance both
    else if the cell below is no longer than the cell to the right then append str1 at i and advance i
    otherwise append str2 at j and advance j
  return the built string`.split('\n').map((text, index) => ({ line: index + 1, text }))
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
