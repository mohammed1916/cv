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
  const frames = [{ phase: 'start', activeLine: L('set rising to rising'), index: k, direction: null, memo: [], message: `Find the longest strictly increasing path through point ${k}, ${coordinates[k]}.` }]

  // sign +1 looks for points that are larger in both coordinates (rising); sign -1 for smaller ones (falling).
  const chain = (i, sign) => {
    const memo = sign === 1 ? upMemo : downMemo
    const name = sign === 1 ? 'rising' : 'falling'
    if (memo.has(i)) {
      const value = memo.get(i)
      frames.push({ phase: 'reuse', activeLine: L('if memo already holds'), index: i, direction: name, memo: snapshot(), message: `${name} from point ${i} is already ${value}.` })
      return value
    }
    let best = 1
    frames.push({ phase: 'visit', activeLine: L('set best to 1'), index: i, direction: name, memo: snapshot(), message: `Look for points that are ${sign === 1 ? 'larger' : 'smaller'} in both coordinates than point ${i}.` })
    for (let j = 0; j < n; j++) {
      const dx = coordinates[j][0] - coordinates[i][0]
      const dy = coordinates[j][1] - coordinates[i][1]
      if (sign * dx > 0 && sign * dy > 0) best = Math.max(best, 1 + chain(j, sign))
    }
    memo.set(i, best)
    frames.push({ phase: 'store', activeLine: L('store best for i'), index: i, direction: name, memo: snapshot(), message: `${name} from point ${i} is ${best}.` })
    return best
  }

  const rising = chain(k, 1)
  const falling = chain(k, -1)
  const result = rising + falling - 1
  frames.push({ phase: 'done', activeLine: L('return rising plus falling'), index: k, direction: null, memo: snapshot(), message: `Longest path through point ${k}: ${rising} + ${falling} - 1 = ${result}.` })
  return { input, result, frames }
}

export const code = `longest strictly increasing path that contains point k
  set rising to rising(k), the longest path that starts at point k
  set falling to falling(k), the longest path that ends at point k
  return rising plus falling minus 1

rising(i)
  if memo already holds i then return it
  set best to 1
  for each point j with both coordinates larger than point i
    set best to the larger of best and 1 plus rising(j)
  store best for i and return it

falling(i) is the same as rising(i), but with both coordinates smaller`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

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
