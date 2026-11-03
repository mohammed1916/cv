// Original teaching model. The example words are invented for this visualization.
// dp[i][j] is the longest common subsequence length of the first i letters of one word and the first j letters of the other.

export const phases = [
  { id: 'init', label: 'Set up', description: 'Empty prefixes share no letters, so the first row and column are zero.' },
  { id: 'match', label: 'Match', description: 'Equal letters extend the diagonal from the cell above and to the left.' },
  { id: 'no-match', label: 'Skip one', description: 'Unequal letters keep the better of dropping either last letter.' },
  { id: 'done', label: 'Result', description: 'The bottom-right cell is the common subsequence length.' },
]

export const code = [
  'a = length of the first string, b = length of the second',
  'dp[i][j] = LCS length of the first i letters and the first j letters',
  'dp row 0 and dp column 0 start at zero',
  'for i from 1 to a:',
  '  for j from 1 to b:',
  '    if first[i - 1] == second[j - 1]:',
  '      dp[i][j] = dp[i - 1][j - 1] + 1',
  '    else:',
  '      dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])',
  'return dp[a][b]',
].map((text, index) => ({ line: index + 1, text }))

const at = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing code line: ${key}`)
  return index + 1
}

export const python = `def common_length(first, second):
    a, b = len(first), len(second)
    dp = [[0] * (b + 1) for _ in range(a + 1)]
    for i in range(1, a + 1):
        for j in range(1, b + 1):
            if first[i - 1] == second[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[a][b]`

export const inputLabel = 'Two words (JSON array of two strings)'
export const complexity = 'O(a × b) time and space, where a and b are the two word lengths.'
export const examples = [
  { label: 'Sample', input: '["stream","taste"]' },
  { label: 'Shared tail', input: '["ocean","lean"]' },
  { label: 'No shared letter', input: '["abc","xyz"]' },
]

export function parseInput(text) {
  const pair = JSON.parse(text)
  if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(word => typeof word === 'string')) throw new Error('Enter a JSON array with exactly two strings.')
  if (pair.some(word => word.length < 1 || word.length > 8 || !/^[a-z]+$/.test(word))) throw new Error('Each word needs 1 to 8 lowercase letters.')
  return pair
}

export function buildTrace([first, second]) {
  const a = first.length, b = second.length
  const dp = Array.from({ length: a + 1 }, () => Array(b + 1).fill(null))
  for (let i = 0; i <= a; i++) dp[i][0] = 0
  for (let j = 0; j <= b; j++) dp[0][j] = 0
  const snap = extra => ({ first, second, table: dp.map(row => [...row]), cell: null, same: null, ...extra })
  const frames = [{
    phase: 'init', activeLine: at('a = length'),
    message: `Start with the empty prefixes. Each cell will hold the best common length for one prefix of ${first} against one prefix of ${second}.`,
    snapshot: snap(),
  }]

  for (let i = 1; i <= a; i++) {
    for (let j = 1; j <= b; j++) {
      const same = first[i - 1] === second[j - 1]
      if (same) dp[i][j] = dp[i - 1][j - 1] + 1
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      frames.push({
        phase: same ? 'match' : 'no-match',
        activeLine: at(same ? 'dp[i][j] = dp[i - 1][j - 1] + 1' : 'dp[i][j] = max('),
        message: same
          ? `${first[i - 1]} matches ${second[j - 1]}, so the diagonal cell extends to ${dp[i][j]}.`
          : `${first[i - 1]} and ${second[j - 1]} differ, so keep the longer neighbour: ${dp[i][j]}.`,
        snapshot: snap({ cell: [i, j], same }),
      })
    }
  }

  const result = dp[a][b]
  frames.push({
    phase: 'done', activeLine: at('return dp[a][b]'),
    message: `The bottom-right cell holds ${result}, the length of the longest common subsequence.`,
    snapshot: snap({ cell: [a, b] }),
  })
  return { input: [first, second], result, frames }
}
