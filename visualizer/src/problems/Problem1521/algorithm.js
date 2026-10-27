export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.arr) || !Number.isInteger(input.target)) throw new Error('Use an object with an integer array "arr" and an integer "target".')
  if (input.arr.length < 1 || input.arr.length > 12) throw new Error('Use an array of 1 to 12 entries.')
  if (input.arr.some(v => !Number.isInteger(v) || v < 0 || v > 1023)) throw new Error('Array values are integers from 0 to 1023.')
  if (input.target < 0 || input.target > 1023) throw new Error('Target is an integer from 0 to 1023.')
  return { arr: input.arr, target: input.target }
}

export function buildTrace({ arr, target }) {
  const n = arr.length
  const table = [arr.slice()]
  const frames = []
  const snap = (phase, line, extra, message) => frames.push({ phase, activeLine: L(line), table: table.map(row => row.slice()), best, message, ...extra })
  let best = Infinity
  snap('build', 'set n to the length', {}, `Level 0 is the array itself. Each higher level stores the AND of two overlapping blocks of twice the length.`)
  for (let j = 1; (1 << j) <= n; j++) {
    const half = 1 << (j - 1)
    const row = []
    for (let i = 0; i + (1 << j) <= n; i++) row.push(table[j - 1][i] & table[j - 1][i + half])
    table.push(row)
    snap('build', 'for level j from 1', { level: j }, `Level ${j}: each entry ANDs two level ${j - 1} blocks of length ${half}.`)
  }
  const range = (l, r) => {
    const k = Math.floor(Math.log2(r - l + 1))
    return table[k][l] & table[k][r - (1 << k) + 1]
  }
  snap('search', 'set best to infinity', { l: -1 }, `Target is ${target}. The best distance so far is unset.`)
  for (let l = 0; l < n; l++) {
    let lo = l, hi = n - 1, first = -1
    snap('search', 'for each left index l', { l, lo, hi }, `Left end ${l}. The AND of [${l}..r] can only drop as r grows, so search for the first r that reaches the target.`)
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      const value = range(l, mid)
      if (value <= target) {
        first = mid
        snap('search', 'binary search for the smallest r', { l, lo, hi, mid, value, first }, `AND of [${l}..${mid}] is ${value}, at most ${target}. Try a shorter range.`)
        hi = mid - 1
      } else {
        snap('search', 'binary search for the smallest r', { l, lo, hi, mid, value, first }, `AND of [${l}..${mid}] is ${value}, above ${target}. Try a longer range.`)
        lo = mid + 1
      }
    }
    if (first === -1) {
      const value = range(l, n - 1)
      best = Math.min(best, Math.abs(value - target))
      snap('record', 'if there is no such r', { l, first, value }, `Every range from ${l} stays above the target; the closest is [${l}..${n - 1}] with value ${value}.`)
    } else {
      const value = range(l, first)
      best = Math.min(best, Math.abs(value - target))
      snap('record', 'update best with |range(l, r) - target|', { l, first, value }, `Range [${l}..${first}] gives ${value}, distance ${Math.abs(value - target)}.`)
      if (first > l) {
        const above = range(l, first - 1)
        best = Math.min(best, Math.abs(above - target))
        snap('record', 'if r is above l', { l, first, value: above }, `The range one step shorter gives ${above}, above the target, distance ${Math.abs(above - target)}.`)
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), table: table.map(row => row.slice()), best, l: -1, message: `Smallest distance to ${target}: ${best}.` })
  return { input: { arr, target }, result: best, frames }
}

export const code = `closest AND of a subarray to target:
  set n to the length of arr
  table level 0 is arr
  for level j from 1 while 2^j is at most n:
    for each start i where i + 2^j - 1 is at most n - 1:
      set table[j][i] to table[j-1][i] AND table[j-1][i + 2^(j-1)]
  set best to infinity
  for each left index l from 0 to n - 1:
    binary search for the smallest r from l to n - 1 where range(l, r) is at most target
    if there is no such r then
      update best with |range(l, n - 1) - target|
    otherwise
      update best with |range(l, r) - target|
      if r is above l then update best with |range(l, r - 1) - target|
  return best

range(l, r):
  k is the largest power with 2^k at most r - l + 1
  return table[k][l] AND table[k][r - 2^k + 1]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def closest_to_target(arr, target):
    n = len(arr)
    table = [arr[:]]
    j = 1
    while (1 << j) <= n:
        half = 1 << (j - 1)
        prev = table[j - 1]
        table.append([prev[i] & prev[i + half] for i in range(n - (1 << j) + 1)])
        j += 1

    def query(l, r):
        k = (r - l + 1).bit_length() - 1
        return table[k][l] & table[k][r - (1 << k) + 1]

    best = float('inf')
    for l in range(n):
        lo, hi, first = l, n - 1, -1
        while lo <= hi:
            mid = (lo + hi) // 2
            if query(l, mid) <= target:
                first = mid
                hi = mid - 1
            else:
                lo = mid + 1
        if first == -1:
            best = min(best, abs(query(l, n - 1) - target))
        else:
            best = min(best, abs(query(l, first) - target))
            if first > l:
                best = min(best, abs(query(l, first - 1) - target))
    return best
`
