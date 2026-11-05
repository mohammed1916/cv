export const code = `function longestRepeatingSubstring(s) {
  const n = s.length
  const run = Array.from({ length: n }, () => Array(n).fill(0))
  let best = 0
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (s[i] === s[j]) {
        run[i][j] = 1 + (i > 0 ? run[i - 1][j - 1] : 0)
        best = Math.max(best, run[i][j])
      }
    }
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def longest_repeating(s):
    n = len(s)
    run = [[0] * n for _ in range(n)]
    best = 0
    for i in range(n):
        for j in range(i + 1, n):
            if s[i] == s[j]:
                run[i][j] = 1 + (run[i - 1][j - 1] if i > 0 else 0)
                best = max(best, run[i][j])
    return best


if __name__ == "__main__":
    print(longest_repeating("abbaba"))
`

const PY_LINES = python.split('\n')
const L = text => {
  const index = code.findIndex(item => item.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY_LINES.findIndex(item => item.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

const MAX_LENGTH = 20

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || typeof input.s !== 'string') throw new Error('Use an object with a string s.')
  if (input.s.length < 1 || input.s.length > MAX_LENGTH) throw new Error(`s has 1 to ${MAX_LENGTH} characters.`)
  return { s: input.s }
}

export function buildTrace({ s }) {
  const n = s.length
  const run = Array.from({ length: n }, () => Array(n).fill(0))
  const known = Array.from({ length: n }, () => Array(n).fill(false))
  const frames = []
  let best = 0
  let bestCell = null
  const state = (extra = {}) => ({ s, n, run: run.map(r => r.slice()), known: known.map(r => r.slice()), i: -1, j: -1, best, bestCell, ...extra })
  const add = (phase, line, py, message, extra) => frames.push({ phase, activeLine: L(line), pythonLine: P(py), message, ...state(extra) })
  add('start', 'let best = 0', 'best = 0', `Compare every pair of positions in "${s}". run[i][j] counts equal letters that end at i and j.`, {})
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      add('pair', 'for (let j = i + 1', 'for j in range(i + 1, n)', `Compare s[${i}] = "${s[i]}" with s[${j}] = "${s[j]}".`, { i, j })
      if (s[i] === s[j]) {
        const before = i > 0 ? run[i - 1][j - 1] : 0
        run[i][j] = 1 + before
        known[i][j] = true
        add('match', 'run[i][j] = 1 +', 'run[i][j] = 1 + (run[i - 1][j - 1]', `Letters match: run[${i}][${j}] = ${run[i][j]}.`, { i, j })
        if (run[i][j] > best) {
          best = run[i][j]
          bestCell = [i, j]
          add('best', 'best = Math.max(best, run[i][j])', 'best = max(best, run[i][j])', `New best ${best}: "${s.slice(i - best + 1, i + 1)}" ends at ${i} and at ${j}.`, { i, j })
        }
      } else {
        known[i][j] = true
        add('miss', 'if (s[i] === s[j])', 'if s[i] == s[j]', `Letters differ, so no repeat ends here.`, { i, j })
      }
    }
  }
  add('done', 'return best', 'return best', best === 0 ? 'No nonempty substring repeats.' : `Longest repeat has length ${best}: "${s.slice(bestCell[0] - best + 1, bestCell[0] + 1)}".`, { i: -1, j: -1 })
  return { input: { s }, result: best, frames }
}
