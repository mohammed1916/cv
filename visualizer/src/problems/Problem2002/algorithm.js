export const phases = [
  { id: 'start', label: 'Start', description: 'Start with the best product found so far: zero.' },
  { id: 'split', label: 'Split the indices', description: 'Give each character to the first or the second subsequence; the rest of the string is the other one.' },
  { id: 'measure', label: 'Measure palindromes', description: 'Find the longest palindromic subsequence inside each side and multiply the lengths.' },
  { id: 'done', label: 'Result', description: 'Return the largest product over all splits.' },
]

export const code = `function longestPalindromeLength(t) {
  const n = t.length
  const dp = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1
    for (let j = i + 1; j < n; j++) {
      dp[i][j] = t[i] === t[j] ? dp[i + 1][j - 1] + 2 : Math.max(dp[i + 1][j], dp[i][j - 1])
    }
  }
  return n ? dp[0][n - 1] : 0
}

function maxProductOfPalindromes(s) {
  const n = s.length
  let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    let left = '', right = ''
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) left += s[i]
      else right += s[i]
    }
    best = Math.max(best, longestPalindromeLength(left) * longestPalindromeLength(right))
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def longest_palindrome_length(t):
    n = len(t)
    dp = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            if t[i] == t[j]:
                dp[i][j] = dp[i + 1][j - 1] + 2
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1] if n else 0

def max_product_of_palindromes(s):
    n = len(s)
    best = 0
    for mask in range(1 << n):
        left = ''.join(s[i] for i in range(n) if mask & (1 << i))
        right = ''.join(s[i] for i in range(n) if not mask & (1 << i))
        best = max(best, longest_palindrome_length(left) * longest_palindrome_length(right))
    return best
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function longestPalindromeLength(t) {
  const n = t.length
  const dp = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1
    for (let j = i + 1; j < n; j++) {
      dp[i][j] = t[i] === t[j] ? dp[i + 1][j - 1] + 2 : Math.max(dp[i + 1][j], dp[i][j - 1])
    }
  }
  return n ? dp[0][n - 1] : 0
}

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"s":"abcbdcbb"}.') }
  const s = obj?.s
  if (typeof s !== 'string' || s.length < 2 || s.length > 12 || !/^[a-z]+$/.test(s)) throw new Error('s must be 2 to 12 lowercase letters.')
  return s
}

export function buildTrace(s) {
  const frames = []
  const n = s.length
  let best = 0
  let bestSplit = null
  const add = (phase, c, p, message, split) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { s, split, best, bestSplit },
  })
  add('start', 'let best = 0', 'best = 0', 'No split has been measured yet.', null)
  for (let mask = 0; mask < 1 << n; mask++) {
    let left = '', right = ''
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) left += s[i]
      else right += s[i]
    }
    const product = longestPalindromeLength(left) * longestPalindromeLength(right)
    if (product > best) {
      best = product
      bestSplit = { left, right, mask }
      add('measure', 'best = Math.max', 'best = max', `Split "${left}" and "${right}" gives product ${product}.`, { left, right, mask })
    }
  }
  add('done', 'return best', 'return best', `The best product is ${best}.`, bestSplit)
  return { input: s, result: best, frames }
}
