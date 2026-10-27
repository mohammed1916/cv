const MAX_STONES = 8

export function parseInput(text) {
  const data = JSON.parse(text)
  const stones = data?.stones
  if (!Array.isArray(stones) || stones.length < 1 || stones.length > MAX_STONES) throw new Error(`stones must list 1 to ${MAX_STONES} values.`)
  if (stones.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Each stone value is an integer from 1 to 20.')
  return { stones }
}

export const code = `maximum score(stones)
  set best[i][i] to 0 for every single stone
  for each segment length from 2 to n
    for each segment from i to j of that length
      for each split point k from i to j-1
        let left and right be the sums of the two parts
        if left is smaller than right, candidate = left + best[i][k]
        if right is smaller than left, candidate = right + best[k+1][j]
        if they are equal, candidate = the better of the two
        keep the largest candidate in best[i][j]
  return best[0][n-1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Alice splits a row of stones. Bob throws away the larger part, and Alice scores the smaller one and keeps playing it.
export function buildTrace({ stones }) {
  const n = stones.length
  const prefix = [0]
  stones.forEach(v => prefix.push(prefix[prefix.length - 1] + v))
  const sum = (i, j) => prefix[j + 1] - prefix[i]
  const best = Array.from({ length: n }, () => Array(n).fill('–'))
  for (let i = 0; i < n; i++) best[i][i] = 0
  const frames = [{ phase: 'start', cell: null, split: null, table: best.map(r => [...r]), activeLine: L('set best[i][i]'), message: 'A single stone gives Alice no score, since the game ends.' }]
  for (let length = 2; length <= n; length++) {
    for (let i = 0; i + length - 1 < n; i++) {
      const j = i + length - 1
      let top = -Infinity
      for (let k = i; k < j; k++) {
        const left = sum(i, k)
        const right = sum(k + 1, j)
        let candidate
        let line
        let text
        if (left < right) { candidate = left + best[i][k]; line = 'if left is smaller'; text = `left ${left} < right ${right}: Bob drops the right part, so Alice scores ${left} and plays on.` }
        else if (right < left) { candidate = right + best[k + 1][j]; line = 'if right is smaller'; text = `right ${right} < left ${left}: Bob drops the left part, so Alice scores ${right} and plays on.` }
        else { candidate = Math.max(left + best[i][k], right + best[k + 1][j]); line = 'if they are equal'; text = `left and right tie at ${left}: Alice keeps whichever part scores more.` }
        top = Math.max(top, candidate)
        frames.push({ phase: 'split', cell: [i, j], split: k, table: best.map(r => [...r]), activeLine: L(line), message: `Stones ${i + 1}-${j + 1}, split after ${k + 1}: ${text}` })
      }
      best[i][j] = top
      frames.push({ phase: 'interval', cell: [i, j], split: null, table: best.map(r => [...r]), activeLine: L('keep the largest candidate'), message: `Best score from stones ${i + 1} to ${j + 1} is ${top}.` })
    }
  }
  const result = best[0][n - 1]
  frames.push({ phase: 'done', cell: [0, n - 1], split: null, table: best.map(r => [...r]), activeLine: L('return best[0][n-1]'), result, message: `Alice's best total score is ${result}.` })
  return { input: { stones }, result, frames }
}

export const python = `def stone_game_v(stones):
    n = len(stones)
    prefix = [0] * (n + 1)
    for i, s in enumerate(stones):
        prefix[i + 1] = prefix[i] + s
    best = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):
        for i in range(0, n - length + 1):
            j = i + length - 1
            top = 0
            for k in range(i, j):
                left = prefix[k + 1] - prefix[i]
                right = prefix[j + 1] - prefix[k + 1]
                if left < right:
                    candidate = left + best[i][k]
                elif right < left:
                    candidate = right + best[k + 1][j]
                else:
                    candidate = max(left + best[i][k], right + best[k + 1][j])
                top = max(top, candidate)
            best[i][j] = top
    return best[0][n - 1]
`
