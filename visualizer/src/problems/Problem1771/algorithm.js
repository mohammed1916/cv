export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with word1 and word2.')
  const { word1, word2 } = data
  for (const [name, value] of [['word1', word1], ['word2', word2]]) {
    if (typeof value !== 'string' || value.length < 1 || value.length > 6 || !/^[a-z]+$/.test(value)) throw new Error(`${name} is 1 to 6 lowercase letters.`)
  }
  return { word1, word2 }
}

export function buildTrace(input) {
  const { word1, word2 } = input
  const s = word1 + word2
  const n = word1.length
  const total = s.length
  const dp = Array.from({ length: total }, () => Array(total).fill(0))
  const frames = []
  const snapshot = () => dp.map(row => [...row])
  const frame = (phase, line, cell, best, message) => frames.push({ phase, activeLine: line, cell, best, dp: snapshot(), message })
  frame('start', L('join word1 and word2'), null, 0, `Join the words into ${s}. Indices below ${n} come from word1.`)
  for (let i = total - 1; i >= 0; i--) {
    dp[i][i] = 1
    for (let j = i + 1; j < total; j++) {
      dp[i][j] = s[i] === s[j]
        ? (i + 1 <= j - 1 ? dp[i + 1][j - 1] : 0) + 2
        : Math.max(dp[i + 1][j], dp[i][j - 1])
    }
  }
  frame('fill', L('fill the table of longest palindromic'), null, 0, 'The table holds the longest palindromic subsequence of every span of s.')
  let best = 0
  for (let i = 0; i < n; i++) {
    for (let j = n; j < total; j++) {
      if (s[i] === s[j]) {
        const inner = i + 1 <= j - 1 ? dp[i + 1][j - 1] : 0
        best = Math.max(best, inner + 2)
        frame('pair', L('if s at i equals s at j'), [i, j], best, `Ends ${s[i]} at ${i} and ${s[j]} at ${j} match, so the palindrome is 2 plus ${inner} inside.`)
      }
    }
  }
  frame('done', L('return best'), null, best, `The longest palindrome from one subsequence of each word has length ${best}.`)
  return { input, result: best, frames }
}

export const code = `maximum palindrome length from a subsequence of each word
  join word1 and word2 into s, where word2 starts at index n
  fill the table of longest palindromic subsequences for every span of s
  set best to 0
  for each i in word1 and each j in word2, do
    if s at i equals s at j then set best to the larger of best and 2 plus the span value from i+1 to j-1, where an empty span is 0
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_palindrome_length(word1, word2):
    s = word1 + word2
    n, total = len(word1), len(s)
    dp = [[0] * total for _ in range(total)]
    for i in range(total - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, total):
            if s[i] == s[j]:
                inner = dp[i + 1][j - 1] if i + 1 <= j - 1 else 0
                dp[i][j] = inner + 2
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    best = 0
    for i in range(n):
        for j in range(n, total):
            if s[i] == s[j]:
                inner = dp[i + 1][j - 1] if i + 1 <= j - 1 else 0
                best = max(best, inner + 2)
    return best
`
