export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with coordinates and k.')
  const { coordinates, k } = data
  if (!Array.isArray(coordinates) || coordinates.length < 1 || coordinates.length > 10) throw new Error('coordinates must be an array of 1 to 10 points.')
  if (coordinates.some(p => !Array.isArray(p) || p.length !== 2 || !p.every(v => Number.isInteger(v) && v >= 0 && v <= 100))) throw new Error('Each point is [x, y] with integers from 0 to 100.')
  const keys = new Set(coordinates.map(p => p.join(',')))
  if (keys.size !== coordinates.length) throw new Error('Points must be distinct.')
  if (!Number.isInteger(k) || k < 0 || k >= coordinates.length) throw new Error('k is a valid index into coordinates.')
  return { coordinates, k }
}

export function buildTrace(input) {
  const { coordinates, k } = input
  const n = coordinates.length
  const upMemo = new Map()
  const downMemo = new Map()
  const snapshot = () => {
    const rows = []
    for (let i = 0; i < n; i++) {
      if (upMemo.has(i) || downMemo.has(i)) rows.push({ index: i, rising: upMemo.get(i) ?? null, falling: downMemo.get(i) ?? null })
    }
    return rows
  }
  const frames = [{ pythonLine: PY('return chain(k, 1'), phase: 'start', activeLine: L('return chain(k, 1, upMemo)'), index: k, direction: null, memo: [], message: `Find the longest strictly increasing path through point ${k}, ${coordinates[k]}.` }]

  // sign +1 looks for points that are larger in both coordinates (rising); sign -1 for smaller ones (falling).
  const chain = (i, sign) => {
    const memo = sign === 1 ? upMemo : downMemo
    const name = sign === 1 ? 'rising' : 'falling'
    if (memo.has(i)) {
      const value = memo.get(i)
      frames.push({ pythonLine: PY('if i in memo'), phase: 'reuse', activeLine: L('if (memo.has(i))'), index: i, direction: name, memo: snapshot(), message: `${name} from point ${i} is already ${value}.` })
      return value
    }
    let best = 1
    frames.push({ pythonLine: PY('best = 1'), phase: 'visit', activeLine: L('let best = 1'), index: i, direction: name, memo: snapshot(), message: `Look for points that are ${sign === 1 ? 'larger' : 'smaller'} in both coordinates than point ${i}.` })
    for (let j = 0; j < n; j++) {
      const dx = coordinates[j][0] - coordinates[i][0]
      const dy = coordinates[j][1] - coordinates[i][1]
      if (sign * dx > 0 && sign * dy > 0) best = Math.max(best, 1 + chain(j, sign))
    }
    memo.set(i, best)
    frames.push({ pythonLine: PY('memo[i] = best'), phase: 'store', activeLine: L('memo.set(i, best)'), index: i, direction: name, memo: snapshot(), message: `${name} from point ${i} is ${best}.` })
    return best
  }

  const rising = chain(k, 1)
  const falling = chain(k, -1)
  const result = rising + falling - 1
  frames.push({ pythonLine: PY('return chain(k, 1'), phase: 'done', activeLine: L('return chain(k, 1'), index: k, direction: null, memo: snapshot(), message: `Longest path through point ${k}: ${rising} + ${falling} - 1 = ${result}.` })
  return { input, result, frames }
}

// Code panel: real JavaScript. Python below mirrors it line for line.
export const code = [
  "function longestIncreasingPath(coordinates, k) {",
  "  const upMemo = new Map(), downMemo = new Map();",
  "  const chain = (i, sign, memo) => {",
  "    if (memo.has(i)) return memo.get(i);",
  "    let best = 1;",
  "    coordinates.forEach(([x, y], j) => {",
  "      const dx = x - coordinates[i][0], dy = y - coordinates[i][1];",
  "      if (sign * dx > 0 && sign * dy > 0) best = Math.max(best, 1 + chain(j, sign, memo));",
  "    });",
  "    memo.set(i, best);",
  "    return best;",
  "  };",
  "  return chain(k, 1, upMemo) + chain(k, -1, downMemo) - 1;",
  "}",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export const python = `def longest_increasing_path(coordinates, k):
    n = len(coordinates)
    up_memo = {}
    down_memo = {}

    def chain(i, sign, memo):
        if i in memo:
            return memo[i]
        best = 1
        for j in range(n):
            dx = coordinates[j][0] - coordinates[i][0]
            dy = coordinates[j][1] - coordinates[i][1]
            if sign * dx > 0 and sign * dy > 0:
                best = max(best, 1 + chain(j, sign, memo))
        memo[i] = best
        return best

    return chain(k, 1, up_memo) + chain(k, -1, down_memo) - 1
`
