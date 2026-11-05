// LeetCode 2209: Minimum White Tiles After Covering With Carpets.
// dp[i][c] is the fewest white tiles visible among the first i tiles when at most c carpets are used.
// Tile i-1 is either left uncovered (it adds its colour) or is the last tile of a carpet that starts at i - len,
// which costs one carpet and nothing else.

const MAX_TILES = 12
const MAX_CARPETS = 3
const MAX_LEN = 4

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"floor":"10110101","numCarpets":2,"carpetLen":2}.') }
  if (!spec || typeof spec.floor !== 'string' || !Number.isInteger(spec.numCarpets) || !Number.isInteger(spec.carpetLen)) throw new Error('Give floor, numCarpets and carpetLen.')
  if (!/^[01]+$/.test(spec.floor) || spec.floor.length > MAX_TILES) throw new Error(`floor is a string of 0 and 1, up to ${MAX_TILES} tiles.`)
  if (spec.numCarpets < 0 || spec.numCarpets > MAX_CARPETS) throw new Error(`numCarpets is from 0 to ${MAX_CARPETS}.`)
  if (spec.carpetLen < 1 || spec.carpetLen > MAX_LEN) throw new Error(`carpetLen is from 1 to ${MAX_LEN}.`)
  if (spec.carpetLen > spec.floor.length) throw new Error('A carpet cannot be longer than the floor.')
  return { floor: spec.floor, numCarpets: spec.numCarpets, carpetLen: spec.carpetLen }
}

export const code = `FUNCTION minimumWhiteTiles(floor, numCarpets, carpetLen)
    n ← length of floor
    dp ← (n + 1) by (numCarpets + 1) table, dp[0][c] = 0
    FOR i from 1 to n
        FOR c from 0 to numCarpets
            dp[i][c] ← dp[i - 1][c] + (floor[i - 1] is '1')
            IF c >= 1 THEN
                dp[i][c] ← min(dp[i][c], dp[max(0, i - carpetLen)][c - 1])
    RETURN dp[n][numCarpets]`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minimum_white_tiles(floor, num_carpets, carpet_len):
    n = len(floor)
    dp = [[0] * (num_carpets + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for c in range(num_carpets + 1):
            dp[i][c] = dp[i - 1][c] + (floor[i - 1] == "1")
            if c >= 1:
                dp[i][c] = min(dp[i][c], dp[max(0, i - carpet_len)][c - 1])
    return dp[n][num_carpets]
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Floor', description: 'The table starts with zero white tiles for an empty floor.' },
  { id: 'row', label: 'Tile by tile', description: 'For each tile, leave it bare or end a carpet on it.' },
  { id: 'done', label: 'Result', description: 'The fewest visible white tiles.' },
]

export function buildTrace({ floor, numCarpets, carpetLen }) {
  const n = floor.length
  const dp = Array.from({ length: n + 1 }, () => Array(numCarpets + 1).fill(0))
  const frames = []
  const push = (phase, i, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, index: i, i, activeLine, pythonLine, message, floor, numCarpets, carpetLen, dp: dp.map(r => r.slice()), ...extra,
  })
  push('start', 0, L('dp ← (n + 1)'), P('dp = [[0]'), `${n} tiles, ${numCarpets} carpet(s) of length ${carpetLen}.`)
  for (let i = 1; i <= n; i++) {
    const white = floor[i - 1] === '1' ? 1 : 0
    for (let c = 0; c <= numCarpets; c++) {
      dp[i][c] = dp[i - 1][c] + white
      let via = 'bare'
      if (c >= 1) {
        const carpet = dp[Math.max(0, i - carpetLen)][c - 1]
        if (carpet < dp[i][c]) { dp[i][c] = carpet; via = 'carpet' }
      }
      push('row', i, L('dp[i][c] ← dp[i - 1][c]'), P('dp[i][c] = dp[i - 1][c]'),
        `Tile ${i - 1} is ${white ? 'white' : 'black'}. With ${c} carpet(s) through tile ${i - 1}: ${via === 'carpet' ? 'a carpet ending here is best' : 'leaving it bare is best'}, giving ${dp[i][c]}.`,
        { c, via, value: dp[i][c] })
    }
  }
  const result = dp[n][numCarpets]
  push('done', n, L('RETURN dp[n][numCarpets]'), P('return dp[n]'), `The fewest visible white tiles is ${result}.`, { result })
  return { input: { floor, numCarpets, carpetLen }, result, frames }
}
