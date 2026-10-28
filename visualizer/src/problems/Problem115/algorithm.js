export function buildSubsequenceStory(source, target) {
  const s = Array.from(source), t = Array.from(target);
  if (s.length > 64 || t.length > 64) throw new Error('Use at most 64 characters per string for the visual trace.');
  const dp = Array.from({ length: s.length + 1 }, () => Array(t.length + 1).fill(0n));
  const writtenAt = dp.map(row => row.map(() => Infinity));
  for (let i = 0; i <= s.length; i++) { dp[i][0] = 1n; writtenAt[i][0] = 0; }
  for (let j = 1; j <= t.length; j++) writtenAt[0][j] = 0;
  const frames = [{ activeLine: 4, phase: 'base', i: 0, j: 0, message: 'There is one way to make an empty target: skip every source character. An empty source cannot make a nonempty target.' }];
  for (let i = 1; i <= s.length; i++) for (let j = 1; j <= t.length; j++) {
    const skip = dp[i-1][j], use = s[i-1] === t[j-1] ? dp[i-1][j-1] : 0n;
    const common = { i, j, skip: String(skip), use: String(use), matched: s[i-1] === t[j-1] };
    frames.push({ ...common, activeLine: 7, phase: 'skip', value: String(skip), message: `Skip source character #${i-1} (${s[i-1]}): keep ${skip} ways from the row above.` });
    frames.push({ ...common, activeLine: 8, phase: 'compare', value: String(skip), message: s[i-1] === t[j-1] ? 'Characters match. We can also use this source position to extend the shorter target prefix.' : 'Characters differ. This source position cannot finish the target prefix.' });
    dp[i][j] = skip + use;
    if (s[i-1] === t[j-1]) frames.push({ ...common, activeLine: 9, phase: 'match', value: String(dp[i][j]), message: `Skip ${skip} + use ${use} = ${dp[i][j]} distinct choices of source positions.` });
    writtenAt[i][j] = frames.length - 1;
  }
  frames.push({ activeLine: 10, phase: 'done', i: s.length, j: t.length, value: String(dp[s.length][t.length]), message: `${dp[s.length][t.length]} distinct subsequences form the complete target.` });
  return { s, t, frames, values: dp.map(row => row.map(String)), writtenAt };
}

export function subsequenceCellAt(story, stepIndex, row, column) {
  if (stepIndex < 0) return '0';
  const step = story.frames[stepIndex];
  if (step.i === row && step.j === column && step.value !== undefined) return step.value;
  return story.writtenAt[row][column] <= stepIndex ? story.values[row][column] : '0';
}

// ─── Statement contract: parseInput / buildTrace / code / python ───
const MAX_LEN = 30
export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Input must be JSON, e.g. {"s": "rabbbit", "t": "rabbit"}.') }
  if (!data || typeof data !== 'object' || typeof data.s !== 'string' || typeof data.t !== 'string') throw new Error('Input must be an object with string fields "s" and "t".')
  if (data.s.length > MAX_LEN || data.t.length > MAX_LEN) throw new Error(`Use at most ${MAX_LEN} characters per string for the visual trace.`)
  if (!/^[A-Za-z]*$/.test(data.s) || !/^[A-Za-z]*$/.test(data.t)) throw new Error('Strings must contain English letters only.')
  return { s: data.s, t: data.t }
}

export function buildTrace(input) {
  const { s, t } = input
  const rows = s.length + 1, cols = t.length + 1
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0))
  const frames = []
  for (let i = 0; i < rows; i++) dp[i][0] = 1
  frames.push({ activeLine: L('dp[i][0] = 1'), phase: 'base', i: 0, j: 0, value: 1, message: 'One way to make an empty target: skip every source character.' })
  for (let i = 1; i < rows; i++) for (let j = 1; j < cols; j++) {
    const ch = s[i - 1], want = t[j - 1]
    dp[i][j] = dp[i - 1][j]
    frames.push({ activeLine: L('dp[i][j] = dp[i - 1][j]'), phase: 'skip', i, j, value: dp[i][j], message: `Skip source ${ch}: keep ${dp[i][j]} ways from the row above.` })
    if (ch === want) {
      dp[i][j] += dp[i - 1][j - 1]
      frames.push({ activeLine: L('add dp[i - 1][j - 1]'), phase: 'match', i, j, value: dp[i][j], message: `${ch} matches ${want}: add the ${dp[i - 1][j - 1]} ways for the shorter target prefix.` })
    } else {
      frames.push({ activeLine: L('if s[i - 1] equals t[j - 1]'), phase: 'compare', i, j, value: dp[i][j], message: `${ch} differs from ${want}: no extra ways.` })
    }
  }
  const result = dp[rows - 1][cols - 1]
  frames.push({ activeLine: L('return dp'), phase: 'done', i: s.length, j: t.length, value: result, message: `${result} distinct subsequences of s form t.` })
  return { input, result, frames, dp }
}

export const code = [
  { line: 1, text: 'count distinct subsequences of s equal to t' },
  { line: 2, text: 'let dp be a table of (len s + 1) by (len t + 1)' },
  { line: 3, text: 'dp[i][0] = 1 for every prefix length i' },
  { line: 4, text: 'for i from 1 to len s' },
  { line: 5, text: 'for j from 1 to len t' },
  { line: 6, text: 'dp[i][j] = dp[i - 1][j]' },
  { line: 7, text: 'if s[i - 1] equals t[j - 1] add dp[i - 1][j - 1]' },
  { line: 8, text: 'return dp[len s][len t]' },
]
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def distinct_subsequences(s, t):
    rows = len(s) + 1
    cols = len(t) + 1
    dp = [[0] * cols for _ in range(rows)]
    for i in range(rows):
        dp[i][0] = 1
    for i in range(1, rows):
        for j in range(1, cols):
            dp[i][j] = dp[i - 1][j]
            if s[i - 1] == t[j - 1]:
                dp[i][j] += dp[i - 1][j - 1]
    return dp[rows - 1][cols - 1]
`
