export function parseInput(text) {
  const strs = JSON.parse(text)
  if (!Array.isArray(strs) || strs.length < 1 || strs.length > 6) throw new Error('Use 1 to 6 strings.')
  const width = strs[0]?.length ?? 0
  if (width < 1 || width > 10 || strs.some(s => typeof s !== 'string' || s.length !== width || !/^[a-z]+$/.test(s))) {
    throw new Error('All strings have the same length, 1 to 10 lowercase letters.')
  }
  return strs
}

export function buildTrace(strs) {
  const cols = strs[0].length
  // dp[j]: the most columns that can be kept with column j as the last one kept.
  const dp = Array(cols).fill(1)
  const from = Array(cols).fill(-1)
  const frames = [{ phase: 'start', activeLine: L('dp = [1]'), column: null, dp: [...dp], from: null, message: 'Each column alone is a valid choice. Look for longer chains of columns that stay sorted in every row.' }]
  for (let j = 0; j < cols; j++) {
    for (let i = 0; i < j; i++) {
      if (strs.every(row => row[i] <= row[j]) && dp[i] + 1 > dp[j]) {
        dp[j] = dp[i] + 1
        from[j] = i
      }
    }
    frames.push({ phase: 'fill', activeLine: L('dp[j] = dp[i] + 1'), column: j, dp: [...dp], from: from[j], message: from[j] === -1 ? `Column ${j} starts a new chain of length 1.` : `Column ${j} extends the chain ending at column ${from[j]} to length ${dp[j]}.` })
  }
  let best = 0
  for (let j = 1; j < cols; j++) if (dp[j] > dp[best]) best = j
  const result = cols - dp[best]
  frames.push({ phase: 'done', activeLine: L('return len'), column: best, dp: [...dp], from: null, message: `Keep ${dp[best]} columns and delete ${result}.` })
  return { input: strs, cols, result, frames }
}

export const code = `def minDeletionSize(strs):
    cols = len(strs[0])
    dp = [1] * cols
    for j in range(cols):
        for i in range(j):
            if all(row[i] <= row[j] for row in strs):
                dp[j] = max(dp[j], dp[i] + 1)
    return cols - max(dp)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
