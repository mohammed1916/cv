// Own wording and sample data. The interval table follows the Python solution in `python`.
export const phases = [
  { id: 'start', label: 'Start', description: 'Single characters are palindromes with zero deletions.' },
  { id: 'match', label: 'Matching ends', description: 'Equal end characters cost nothing extra: reuse the cost of the inner interval.' },
  { id: 'split', label: 'Mismatched ends', description: 'Delete one end character and keep whichever choice leaves the cheaper interval.' },
  { id: 'done', label: 'Result', description: 'Compare the cost for the whole string with k.' },
]

export const inputLabel = 'Object with s (lowercase letters) and k (JSON)'
export const complexity = 'O(n²) time and O(n²) space for the interval table. The visualizer caps s at 12 characters.'
export const examples = [
  { label: 'Two deletions needed', input: '{"s":"abcabca","k":2}' },
  { label: 'One short', input: '{"s":"abcabca","k":1}' },
  { label: 'Already a palindrome', input: '{"s":"racecar","k":0}' },
  { label: 'Single letter, no deletions', input: '{\"s\":\"a\",\"k\":0}' },
  { label: 'Equal letters are already palindromes', input: '{\"s\":\"aaaa\",\"k\":0}' },
  { label: 'Largest allowed string and budget', input: '{\"s\":\"abcdefghijkl\",\"k\":12}' },
  { label: 'Long run: twelve letters, budget three', input: '{\"s\":\"solruvmrclnm\",\"k\":3}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (typeof data.s !== 'string' || !/^[a-z]{1,12}$/.test(data.s)) throw new Error('s must be 1 to 12 lowercase letters.')
  if (!Number.isInteger(data.k) || data.k < 0 || data.k > 12) throw new Error('k must be an integer from 0 to 12.')
  return { s: data.s, k: data.k }
}

const codeText = `function isKPalindrome(s, k) {
  const n = s.length
  const dp = Array.from({ length: n }, () => Array(n).fill(0))
  for (let length = 2; length <= n; length++) {
    for (let i = 0; i + length <= n; i++) {
      const j = i + length - 1
      if (s[i] === s[j]) dp[i][j] = dp[i + 1][j - 1]
      else dp[i][j] = 1 + Math.min(dp[i + 1][j], dp[i][j - 1])
    }
  }
  return dp[0][n - 1] <= k
}`
const pythonText = `def is_k_palindrome(s, k):
    n = len(s)
    dp = [[0] * n for _ in range(n)]     # dp[i][j]: fewest deletions to make s[i..j] a palindrome
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if s[i] == s[j]:
                dp[i][j] = dp[i + 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1] <= k`

export const code = codeText.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = pythonText
const L = key => codeText.split('\n').findIndex(line => line.includes(key)) + 1
const P = key => pythonText.split('\n').findIndex(line => line.includes(key)) + 1

export function buildTrace({ s, k }) {
  const n = s.length
  const dp = Array.from({ length: n }, () => Array(n).fill(0))
  const frames = []
  const snap = (extra = {}) => ({ table: dp.map(row => [...row]), ...extra })
  frames.push({
    phase: 'start', activeLine: L('const dp = Array.from'), pythonLine: P('dp = [[0]'),
    message: `A string of ${n} characters. Every single character needs zero deletions to be a palindrome. We fill longer intervals from shorter ones.`,
    snapshot: snap({ i: null, j: null }),
  })
  for (let length = 2; length <= n; length++) {
    for (let i = 0; i + length <= n; i++) {
      const j = i + length - 1
      if (s[i] === s[j]) {
        dp[i][j] = dp[i + 1][j - 1]
        frames.push({
          phase: 'match', activeLine: L('dp[i][j] = dp[i + 1][j - 1]'), pythonLine: P('dp[i][j] = dp[i + 1][j - 1]'),
          message: `"${s[i]}" matches "${s[j]}" at positions ${i} and ${j}. The cost stays ${dp[i][j]}, the cost of the inner part.`,
          snapshot: snap({ i, j }),
        })
      } else {
        const dropLeft = dp[i + 1][j]
        const dropRight = dp[i][j - 1]
        dp[i][j] = 1 + Math.min(dropLeft, dropRight)
        frames.push({
          phase: 'split', activeLine: L('dp[i][j] = 1 + Math.min'), pythonLine: P('dp[i][j] = 1 + min'),
          message: `"${s[i]}" and "${s[j]}" differ. Deleting the left end costs ${dropLeft}, deleting the right end costs ${dropRight}; the cheaper one plus 1 gives ${dp[i][j]}.`,
          snapshot: snap({ i, j }),
        })
      }
    }
  }
  const cost = dp[0][n - 1]
  const result = cost <= k
  frames.push({
    phase: 'done', activeLine: L('return dp[0][n - 1] <= k'), pythonLine: P('return dp[0][n - 1]'),
    message: `The whole string needs ${cost} deletion${cost === 1 ? '' : 's'}. With k = ${k}, the answer is ${result}.`,
    snapshot: snap({ i: 0, j: n - 1, cost }),
  })
  return { input: { s, k }, result, frames }
}
