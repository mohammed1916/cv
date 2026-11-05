export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.stones)) throw new Error('Use an object with a stones array.')
  const { stones } = obj
  if (stones.length < 3 || stones.length > 10) throw new Error('stones needs 3 to 10 positions.')
  if (stones.some(v => !Number.isInteger(v) || v < 1 || v > 30)) throw new Error('Positions are integers from 1 to 30 in this visualization.')
  if (new Set(stones).size !== stones.length) throw new Error('Positions must be distinct.')
  return { stones }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function movingStonesII(stones) {', 'def moving_stones(stones):'],
  ['  const s = [...stones].sort((a, b) => a - b)', '    s = sorted(stones)'],
  ['  const n = s.length', '    n = len(s)'],
  ['  const most = Math.max(s[n - 2] - s[0], s[n - 1] - s[1]) - (n - 2)', '    most = max(s[n - 2] - s[0], s[n - 1] - s[1]) - (n - 2)'],
  ['  let least = n', '    least = n'],
  ['  let j = 0', '    j = 0'],
  ['  for (let i = 0; i < n; i++) {', '    for i in range(n):'],
  ['    j = Math.max(j, i)', '        j = max(j, i)'],
  ['    while (j + 1 < n && s[j + 1] - s[i] + 1 <= n) j++', '        while j + 1 < n and s[j + 1] - s[i] + 1 <= n: j += 1'],
  ['    const count = j - i + 1', '        count = j - i + 1'],
  ['    const moves = count === n - 1 && s[j] - s[i] + 1 === n - 1 ? 2 : n - count', '        moves = 2 if count == n - 1 and s[j] - s[i] + 1 == n - 1 else n - count'],
  ['    least = Math.min(least, moves)', '        least = min(least, moves)'],
  ['  }', ''],
  ['  return [least, most]', '    return [least, most]'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(input) {
  const s = [...input.stones].sort((a, b) => a - b)
  const n = s.length
  const most = Math.max(s[n - 2] - s[0], s[n - 1] - s[1]) - (n - 2)
  const frames = [{ phase: 'sort', pythonLine: P('s = sorted'), activeLine: L('const s = [...stones]'), i: -1, j: -1, sorted: s, least: null, most: null, message: `Sorted stones: ${s.join(', ')}.` }]
  frames.push({ phase: 'most', pythonLine: P('most = max'), activeLine: L('const most = Math.max'), i: 0, j: n - 1, sorted: s, least: null, most, message: `Most moves: the outer gaps leave ${most} moves when the endpoints step inward.` })
  let least = n
  let j = 0
  for (let i = 0; i < n; i++) {
    j = Math.max(j, i)
    while (j + 1 < n && s[j + 1] - s[i] + 1 <= n) j++
    const count = j - i + 1
    const moves = count === n - 1 && s[j] - s[i] + 1 === n - 1 ? 2 : n - count
    least = Math.min(least, moves)
    frames.push({ phase: 'window', pythonLine: P('moves = 2 if'), activeLine: L('const moves = count'), i, j, sorted: s, least, most, message: `Window ${s[i]} to ${s[j]} holds ${count} stones and needs ${moves} moves.` })
  }
  frames.push({ phase: 'done', pythonLine: P('return [least, most]'), activeLine: L('return [least, most]'), i: -1, j: -1, sorted: s, least, most, message: `Fewest moves ${least}, most moves ${most}.` })
  return { input, result: [least, most], frames }
}
