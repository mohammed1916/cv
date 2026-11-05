export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with arr and d.')
  const { arr, d } = data
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 12) throw new Error('arr must be an array of 1 to 12 integers.')
  if (arr.some(v => !Number.isInteger(v) || v < 1 || v > 100000)) throw new Error('Each arr value is an integer from 1 to 100000.')
  if (!Number.isInteger(d) || d < 1 || d > arr.length) throw new Error('d is an integer from 1 to the length of arr.')
  return { arr, d }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function jumpGameV(arr, d) {', 'def jump_game_v(arr, d):'],
  ['  const n = arr.length', '    n = len(arr)'],
  ['  const memo = new Map()', '    memo = {}'],
  ['  const chain = i => {', '    def chain(i):'],
  ['    if (memo.has(i)) return memo.get(i)', '        if i in memo: return memo[i]'],
  ['    let best = 1', '        best = 1'],
  ['    for (const dir of [1, -1]) {', '        for direction in (1, -1):'],
  ['      for (let step = 1; step <= d; step++) {', '            for step in range(1, d + 1):'],
  ['        const j = i + dir * step', '                j = i + direction * step'],
  ['        if (j < 0 || j >= n || arr[j] >= arr[i]) break', '                if j < 0 or j >= n or arr[j] >= arr[i]: break'],
  ['        best = Math.max(best, 1 + chain(j))', '                best = max(best, 1 + chain(j))'],
  ['      }', ''],
  ['    }', ''],
  ['    memo.set(i, best)', '        memo[i] = best'],
  ['    return best', '        return best'],
  ['  }', ''],
  ['  let result = 0', '    result = 0'],
  ['  for (let i = 0; i < n; i++) result = Math.max(result, chain(i))', '    for i in range(n): result = max(result, chain(i))'],
  ['  return result', '    return result'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(input) {
  const { arr, d } = input
  const n = arr.length
  const memo = new Map()
  const entries = []
  const snapshot = () => entries.map(e => ({ ...e }))
  const frames = [{ phase: 'start', activeLine: L('let result = 0'), pythonLine: P('result = 0'), index: null, targets: [], memo: [], message: 'Find the longest chain of jumps from every starting index.' }]

  // Indices reachable in one jump: at most d steps away, all values strictly below arr[i] on the way and at the target.
  const targetsOf = i => {
    const out = []
    for (const dir of [1, -1]) {
      for (let step = 1; step <= d; step++) {
        const j = i + dir * step
        if (j < 0 || j >= n || arr[j] >= arr[i]) break
        out.push(j)
      }
    }
    return out
  }

  const chain = i => {
    if (memo.has(i)) {
      const value = memo.get(i)
      frames.push({ phase: 'reuse', activeLine: L('if (memo.has(i))'), pythonLine: P('if i in memo'), index: i, targets: [], memo: snapshot(), message: `Index ${i} already has a chain of ${value}.` })
      return value
    }
    let best = 1
    const targets = targetsOf(i)
    frames.push({ phase: 'visit', activeLine: L('let best = 1'), pythonLine: P('best = 1'), index: i, targets, memo: snapshot(), message: `From index ${i} (value ${arr[i]}) the jumps reach ${targets.length ? targets.join(', ') : 'nothing'}.` })
    for (const j of targets) {
      best = Math.max(best, 1 + chain(j))
    }
    memo.set(i, best)
    entries.push({ index: i, value: best })
    frames.push({ phase: 'store', activeLine: L('memo.set(i, best)'), pythonLine: P('memo[i] = best'), index: i, targets: [], memo: snapshot(), message: `Chain from index ${i} is ${best}.` })
    return best
  }

  let result = 0
  for (let i = 0; i < n; i++) {
    result = Math.max(result, chain(i))
  }
  frames.push({ phase: 'done', activeLine: L('return result'), pythonLine: P('return result'), index: null, targets: [], memo: snapshot(), message: `Most indices visited in one walk: ${result}.` })
  return { input, result, frames }
}
