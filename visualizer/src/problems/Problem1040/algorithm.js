export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.stones)) throw new Error('Use an object with a stones array.')
  const { stones } = obj
  if (stones.length < 3 || stones.length > 10) throw new Error('stones needs 3 to 10 positions.')
  if (stones.some(v => !Number.isInteger(v) || v < 1 || v > 30)) throw new Error('Positions are integers from 1 to 30 in this visualization.')
  if (new Set(stones).size !== stones.length) throw new Error('Positions must be distinct.')
  return { stones }
}

export function buildTrace(input) {
  const s = [...input.stones].sort((a, b) => a - b)
  const n = s.length
  const most = Math.max(s[n - 2] - s[0], s[n - 1] - s[1]) - (n - 2)
  const frames = [{ phase: 'sort', activeLine: L('sort the stones'), i: -1, j: -1, sorted: s, least: null, most: null, message: `Sorted stones: ${s.join(', ')}.` }]
  frames.push({ phase: 'most', activeLine: L('set most to'), i: 0, j: n - 1, sorted: s, least: null, most, message: `Most moves: the outer gaps leave ${most} moves when the endpoints step inward.` })
  let least = n
  let j = 0
  for (let i = 0; i < n; i++) {
    j = Math.max(j, i)
    while (j + 1 < n && s[j + 1] - s[i] + 1 <= n) j++
    const count = j - i + 1
    const moves = count === n - 1 && s[j] - s[i] + 1 === n - 1 ? 2 : n - count
    least = Math.min(least, moves)
    frames.push({ phase: 'window', activeLine: L('for each start index'), i, j, sorted: s, least, most, message: `Window ${s[i]} to ${s[j]} holds ${count} stones and needs ${moves} moves.` })
  }
  frames.push({ phase: 'done', activeLine: L('return least and most'), i: -1, j: -1, sorted: s, least, most, message: `Fewest moves ${least}, most moves ${most}.` })
  return { input, result: [least, most], frames }
}

export const code = `moving stones until consecutive, fewest and most moves
  sort the stones
  set most to the larger of s[n-2] minus s[0] and s[n-1] minus s[1], minus n minus 2
  set least to n
  set j to 0
  for each start index i do
    move j right while the stones from i to j plus 1 fit in a span of n
    let count be the number of stones from i to j
    if count is n minus 1 and they fill a span of n minus 1 then
      set least to the smaller of least and 2
    otherwise set least to the smaller of least and n minus count
  return least and most`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def moving_stones(stones):
    s = sorted(stones)
    n = len(s)
    most = max(s[n - 2] - s[0], s[n - 1] - s[1]) - (n - 2)
    least = n
    j = 0
    for i in range(n):
        j = max(j, i)
        while j + 1 < n and s[j + 1] - s[i] + 1 <= n:
            j += 1
        count = j - i + 1
        if count == n - 1 and s[j] - s[i] + 1 == n - 1:
            least = min(least, 2)
        else:
            least = min(least, n - count)
    return [least, most]
`
