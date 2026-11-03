export const phases = [
  { id: 'init', label: 'Set up table', description: 'Mark the empty text against the empty pattern as matching, and fill the first row for starred tokens.' },
  { id: 'check', label: 'Check cell', description: 'Pick the rule for the last pattern token of this cell: a plain character, a dot, or a starred token.' },
  { id: 'char_or_dot', label: 'Character test', description: 'Test whether the last text character equals the token, or the token is a dot.' },
  { id: 'char_result', label: 'Character result', description: 'Both the text prefix and the pattern prefix before this token must match.' },
  { id: 'star_check', label: 'Starred token', description: 'A starred token can be dropped entirely or can absorb one more matching character.' },
  { id: 'star_zero', label: 'Zero copies', description: 'Drop the token and its star, then look at the same text with the shorter pattern.' },
  { id: 'star_multi', label: 'One more copy', description: 'If the last text character matches the token, consume it and keep the same starred token.' },
  { id: 'star_result', label: 'Starred result', description: 'The cell is true when either choice leads to a match.' },
  { id: 'done', label: 'Complete', description: 'Return the value of the bottom-right cell.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"text": "aab", "pattern": "c*a*b"}.')
  const { text: s, pattern: p } = input
  if (typeof s !== 'string' || s.length > 10 || !/^[a-z]*$/.test(s)) throw new Error('text is up to 10 lowercase letters.')
  if (typeof p !== 'string' || p.length < 1 || p.length > 10 || !/^[a-z.*]+$/.test(p)) throw new Error('pattern is 1 to 10 characters from a to z, dot and star.')
  if (p[0] === '*' || /\*\*/.test(p)) throw new Error('A star must follow a letter or dot, and stars cannot repeat.')
  return { text: s, pattern: p }
}

const matchesChar = (c, token) => token === '.' || token === c

export function buildTrace({ text: s, pattern: p }) {
  const m = s.length
  const n = p.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(null))
  const frames = []
  const add = (phase, line, pyText, message, i = null, j = null) => frames.push({ phase, activeLine: L(line), pythonLine: P(pyText), snapshot: { table: dp.map(row => [...row]), i, j, pattern: p, text: s, cell: i === null ? null : [i, j] }, message })
  dp[0][0] = true
  for (let i = 1; i <= m; i++) dp[i][0] = false
  add('init', 'dp[0][0] = true', 'dp[0][0] = True', 'Empty text matches empty pattern, so the top-left cell is true.', 0, 0)
  for (let j = 1; j <= n; j++) {
    if (p[j - 1] === '*') {
      dp[0][j] = dp[0][j - 2]
      add('star_zero', 'for each pattern column j', 'dp[0][j] = dp[0][j - 2]', `With empty text, the starred token at pattern position ${j} can only be dropped, so the cell copies its value from two columns back.`, 0, j)
    } else {
      dp[0][j] = false
    }
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const c = s[i - 1]
      const token = p[j - 1]
      add('check', 'for each row i and column j', 'for j in range(1, n + 1)', `Cell (${i}, ${j}): text prefix ${s.slice(0, i)} against pattern prefix ${p.slice(0, j)}.`, i, j)
      if (token === '*') {
        const starToken = p[j - 2]
        add('star_check', 'if pattern[j - 1] is a star', 'if pattern[j - 1] == "*"', `The token before the star is ${starToken}. Compare the two star choices.`, i, j)
        dp[i][j] = dp[i][j - 2]
        add('star_zero', 'dp[i][j] = dp[i][j - 2]', 'dp[i][j] = dp[i][j - 2]', `Zero copies: the value is ${dp[i][j - 2]} from pattern prefix ${p.slice(0, j - 2)}.`, i, j)
        if (matchesChar(c, starToken)) {
          const multi = dp[i - 1][j]
          dp[i][j] = dp[i][j] || multi
          add('star_multi', 'matches pattern[j - 2]', 'if matches(text[i - 1], pattern[j - 2])', `${c} matches ${starToken}, so one more copy is possible and the cell uses dp[${i - 1}][${j}] = ${multi}.`, i, j)
        } else {
          add('star_multi', 'matches pattern[j - 2]', 'if matches(text[i - 1], pattern[j - 2])', `${c} does not match ${starToken}, so the extra-copy choice is unavailable.`, i, j)
        }
        add('star_result', 'dp[i][j] = dp[i][j - 2]', 'dp[i][j] = True', `Cell (${i}, ${j}) is ${dp[i][j]}.`, i, j)
      } else {
        add('char_or_dot', 'dp[i][j] = text[i - 1] matches', 'dp[i][j] = matches(text[i - 1], pattern[j - 1])', `${c} against ${token}: ${matchesChar(c, token) ? 'they match' : 'they do not match'}.`, i, j)
        dp[i][j] = matchesChar(c, token) && dp[i - 1][j - 1]
        add('char_result', 'dp[i][j] = text[i - 1] matches', 'dp[i][j] = matches(text[i - 1], pattern[j - 1])', `Both prefixes must match, so cell (${i}, ${j}) is ${dp[i][j]}.`, i, j)
      }
    }
  }
  const result = dp[m][n]
  frames.push({ phase: 'done', activeLine: L('return dp[m][n]'), pythonLine: P('return dp[m][n]'), snapshot: { table: dp.map(row => [...row]), i: m, j: n, pattern: p, text: s, cell: [m, n] }, message: `The whole text ${result ? 'matches' : 'does not match'} the whole pattern.` })
  return { input: { text: s, pattern: p }, result, frames }
}

export const code = `regex match (text, pattern):
  dp[0][0] = true
  for each pattern column j, fill the empty-text row
  for each row i and column j:
    if pattern[j - 1] is a star:
      dp[i][j] = dp[i][j - 2]
      if text[i - 1] matches pattern[j - 2] then dp[i][j] = dp[i][j] or dp[i - 1][j]
    else:
      dp[i][j] = text[i - 1] matches pattern[j - 1] and dp[i - 1][j - 1]
  return dp[m][n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def is_match(text, pattern):
    m, n = len(text), len(pattern)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for j in range(1, n + 1):
        if pattern[j - 1] == "*":
            dp[0][j] = dp[0][j - 2]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if pattern[j - 1] == "*":
                dp[i][j] = dp[i][j - 2]
                if matches(text[i - 1], pattern[j - 2]) and dp[i - 1][j]:
                    dp[i][j] = True
            else:
                dp[i][j] = matches(text[i - 1], pattern[j - 1]) and dp[i - 1][j - 1]
    return dp[m][n]
`
