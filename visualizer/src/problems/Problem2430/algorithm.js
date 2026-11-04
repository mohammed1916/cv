const CODE = [
  'function maxDeletions(s) {',
  '  const n = s.length',
  '  const dp = Array(n + 1).fill(0)',
  '  for (let i = n - 1; i >= 0; i--) {',
  '    dp[i] = 1',
  '    for (let len = 1; 2 * len <= n - i; len++) {',
  '      if (s.slice(i, i + len) === s.slice(i + len, i + 2 * len)) {',
  '        dp[i] = Math.max(dp[i], 1 + dp[i + len])',
  '      }',
  '    }',
  '  }',
  '  return dp[0]',
  '}',
]

const PY = [
  'def max_deletions(s):',
  '    n = len(s)',
  '    dp = [0] * (n + 1)',
  '    for i in range(n - 1, -1, -1):',
  '        dp[i] = 1',
  '        for length in range(1, (n - i) // 2 + 1):',
  '            if s[i:i + length] == s[i + length:i + 2 * length]:',
  '                dp[i] = max(dp[i], 1 + dp[i + length])',
  '    return dp[0]',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text.trim()))
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export const phases = [
  { id: 'rest', label: 'Whole rest', description: 'Deleting everything that remains counts as one operation.' },
  { id: 'repeat', label: 'Repeated prefix', description: 'Delete a prefix that is repeated right after it.' },
  { id: 'done', label: 'Complete', description: 'Report the best count from position 0.' },
]

export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || typeof obj.s !== 'string') throw new Error('Use a JSON object with a string s.')
  const { s } = obj
  if (s.length < 1 || s.length > 40) throw new Error('s must have 1 to 40 letters (visualization cap).')
  if (!/^[a-z]+$/.test(s)) throw new Error('s uses lowercase letters only.')
  return { s }
}

export function buildTrace(input) {
  const { s } = input
  const n = s.length
  const dp = new Array(n + 1).fill(0)
  const frames = []
  for (let i = n - 1; i >= 0; i--) {
    dp[i] = 1
    frames.push({ phase: 'rest', pythonLine: pyLine('dp[i] = 1'), activeLine: codeLine('dp[i] = 1'), index: i, len: 0, dp: [...dp], message: `From position ${i}, deleting the whole rest counts as 1 operation.` })
    for (let len = 1; 2 * len <= n - i; len++) {
      if (s.slice(i, i + len) === s.slice(i + len, i + 2 * len)) {
        dp[i] = Math.max(dp[i], 1 + dp[i + len])
        frames.push({ phase: 'repeat', pythonLine: pyLine('dp[i] = max('), activeLine: codeLine('dp[i] = Math.max'), index: i, len, dp: [...dp], message: `Delete ${len} letters at ${i}, since the next ${len} match. Best from ${i}: ${dp[i]}.` })
      }
    }
  }
  frames.push({ phase: 'done', pythonLine: pyLine('return dp[0]'), activeLine: codeLine('return dp[0]'), index: 0, len: 0, dp: [...dp], message: `Maximum operations: ${dp[0]}.` })
  return { input, s, result: dp[0], frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
