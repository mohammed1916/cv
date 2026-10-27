export function parseInput(text) {
  const input = JSON.parse(text)
  const tiles = input?.tiles
  if (!Array.isArray(tiles) || tiles.length < 1 || tiles.length > 6) throw new Error('Give tiles as 1 to 6 [start, end] pairs.')
  if (tiles.some(t => !Array.isArray(t) || t.length !== 2 || !Number.isInteger(t[0]) || !Number.isInteger(t[1]) || t[0] < 1 || t[1] > 40 || t[0] > t[1])) throw new Error('Each tile is [start, end] with 1 <= start <= end <= 40.')
  const sorted = [...tiles].sort((a, b) => a[0] - b[0])
  if (sorted.some((t, i) => i > 0 && t[0] <= sorted[i - 1][1])) throw new Error('Tile ranges must not overlap.')
  if (!Number.isInteger(input.carpet_length) || input.carpet_length < 1 || input.carpet_length > 40) throw new Error('carpet_length is an integer from 1 to 40.')
  return { tiles, carpet_length: input.carpet_length }
}

export function buildTrace({ tiles, carpet_length: length }) {
  const sorted = [...tiles].sort((a, b) => a[0] - b[0])
  const n = sorted.length
  const prefix = [0]
  for (const [l, r] of sorted) prefix.push(prefix[prefix.length - 1] + r - l + 1)
  const frames = [{ phase: 'start', activeLine: L('set sorted to'), tiles: sorted, first: 0, last: -1, start: null, end: null, covered: 0, best: 0, message: `Sort the tiles. A carpet of length ${length} starts at the beginning of some tile.` }]
  let best = 0, right = 0
  for (let i = 0; i < n; i++) {
    const start = sorted[i][0]
    const end = start + length - 1
    while (right < n && sorted[right][0] <= end) right++
    const last = right - 1
    let covered = prefix[last + 1] - prefix[i]
    if (sorted[last][1] > end) covered -= sorted[last][1] - end
    best = Math.max(best, covered)
    frames.push({ phase: 'place', activeLine: L('set covered to whole tiles'), tiles: sorted, first: i, last, start, end, covered, best, message: `Carpet ${start} to ${end} covers ${covered} white tiles. Best ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), tiles: sorted, first: 0, last: -1, start: null, end: null, covered: best, best, message: `The most white tiles covered is ${best}.` })
  return { input: { tiles, carpet_length: length }, result: best, tiles: sorted, frames }
}

export const code = `maximum white tiles covered (tiles, carpet_length)
  set sorted to the tiles sorted by start
  set best to zero and right to zero
  for each tile i as the carpet start
    set end to start plus carpet length minus one
    while the next tile starts at or before end
      move right one step forward
    set covered to whole tiles from i to right minus one
    subtract the part of the last tile past end
    set best to the larger of best and covered
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_white_tiles_covered(tiles, carpet_length):
    tiles = sorted(tiles)
    n = len(tiles)
    prefix = [0]
    for left, right in tiles:
        prefix.append(prefix[-1] + right - left + 1)
    best = 0
    right = 0
    for i in range(n):
        start = tiles[i][0]
        end = start + carpet_length - 1
        while right < n and tiles[right][0] <= end:
            right += 1
        last = right - 1
        covered = prefix[last + 1] - prefix[i]
        if tiles[last][1] > end:
            covered -= tiles[last][1] - end
        best = max(best, covered)
    return best
`
