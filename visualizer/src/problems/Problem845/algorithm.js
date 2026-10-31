export function parseInput(text) {
  const a = JSON.parse(text)
  if (!Array.isArray(a) || a.length < 1 || a.length > 60 || a.some(v => !Number.isInteger(v) || v < 0 || v > 10000)) throw new Error('Enter a JSON array of 1-60 integers between 0 and 10000 (visualization cap: 60).')
  return a
}
export function buildTrace(arr) {
  const n = arr.length
  const up = new Array(n).fill(0), down = new Array(n).fill(0)
  const frames = []
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, activeLine, pythonLine, message, up: [...up], down: [...down], index: -1, best: extra.best ?? 0, ...extra })
  push('start', 3, 4, 'up[i] = length of the strictly increasing run ending at i (steps taken uphill); down[i] = steps downhill starting at i.')
  for (let i = 1; i < n; i++) {
    if (arr[i] > arr[i - 1]) { up[i] = up[i - 1] + 1; push('up', 5, 7, `${arr[i - 1]} is below ${arr[i]}: still climbing, up[${i}] = up[${i - 1}] + 1 = ${up[i]}.`, { index: i }) }
    else push('up', 6, 6, `${arr[i - 1]} is not below ${arr[i]}: the climb breaks, up[${i}] stays 0.`, { index: i })
  }
  for (let i = n - 2; i >= 0; i--) {
    if (arr[i] > arr[i + 1]) { down[i] = down[i + 1] + 1; push('down', 8, 10, `${arr[i]} is above ${arr[i + 1]}: descending, down[${i}] = down[${i + 1}] + 1 = ${down[i]}.`, { index: i }) }
    else push('down', 9, 9, `${arr[i]} is not above ${arr[i + 1]}: the descent breaks, down[${i}] stays 0.`, { index: i })
  }
  let best = 0
  for (let i = 0; i < n; i++) {
    if (up[i] && down[i]) {
      const len = up[i] + down[i] + 1
      const improved = len > best
      best = Math.max(best, len)
      push('peak', 13, 14, `Index ${i} has a climb of ${up[i]} and a descent of ${down[i]}: a mountain of length ${up[i]} + ${down[i]} + 1 = ${len}${improved ? ', a new best' : ''}.`, { index: i, best })
    } else push('skip', 14, 13, `Index ${i} is not a peak (up = ${up[i]}, down = ${down[i]}): a peak needs both a climb and a descent.`, { index: i, best })
  }
  push('done', 15, 15, `The longest mountain has length ${best}${best ? '' : ' (no mountain exists)'}.`, { best })
  return { input: [...arr], result: best, frames }
}
export const code = `function longestMountain(arr)
  set n to the length of arr
  create up and down arrays of zeros, one entry per index
  for i from 1 to n - 1, scanning left to right
    if arr[i - 1] is below arr[i] then set up[i] to up[i - 1] + 1
    otherwise leave up[i] at 0
  for i from n - 2 down to 0, scanning right to left
    if arr[i] is above arr[i + 1] then set down[i] to down[i + 1] + 1
    otherwise leave down[i] at 0
  set best to 0
  for each index i
    if up[i] and down[i] are both positive then
      set best to the larger of best and up[i] + down[i] + 1
    otherwise skip i, because it is not a peak
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def longest_mountain(arr):
    n = len(arr)
    up = [0] * n
    down = [0] * n
    for i in range(1, n):
        if arr[i] > arr[i - 1]:
            up[i] = up[i - 1] + 1
    for i in range(n - 2, -1, -1):
        if arr[i] > arr[i + 1]:
            down[i] = down[i + 1] + 1
    best = 0
    for i in range(n):
        if up[i] and down[i]:
            best = max(best, up[i] + down[i] + 1)
    return best
`
