export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with word, for example {"word":"abcdeafdef"}.')
  const { word } = data
  if (typeof word !== 'string' || word.length < 1 || word.length > 14) throw new Error('word must be 1 to 14 lowercase letters.')
  if (!/^[a-z]+$/.test(word)) throw new Error('word may contain only lowercase letters.')
  return { word }
}

export function buildTrace(input) {
  const { word } = input
  const n = word.length
  const dp = Array(n + 1).fill(0)
  const frames = [{ phase: 'start', activeLine: L('set best[0] to 0'), at: -1, best: 0, message: 'With an empty prefix, no substring fits, so the best count is 0.' }]
  for (let i = 1; i <= n; i++) {
    dp[i] = dp[i - 1]
    for (let j = 0; j <= i - 4; j++) {
      if (word[j] === word[i - 1]) dp[i] = Math.max(dp[i], dp[j] + 1)
    }
    frames.push({ phase: 'prefix', activeLine: L('for each start j'), at: i - 1, best: dp[i], message: `Best count for the first ${i} letters is ${dp[i]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best[n]'), at: -1, best: dp[n], message: `The largest number of non-overlapping substrings is ${dp[n]}.` })
  return { input, result: dp[n], frames }
}

export const code = `maximum non intersecting substrings (word)
  let n be the length of word
  set best[0] to 0
  for each prefix length i from 1 to n
    set best[i] to best[i - 1]
    for each start j with i minus j at least 4
      if word[j] equals word[i - 1] then
        set best[i] to the larger of best[i] and best[j] + 1
  return best[n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_non_intersecting(word):
    n = len(word)
    best = [0] * (n + 1)
    for i in range(1, n + 1):
        best[i] = best[i - 1]
        for j in range(0, i - 3):
            if word[j] == word[i - 1]:
                best[i] = max(best[i], best[j] + 1)
    return best[n]
`
