export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with s (a binary string) and numOps.')
  const { s, numOps } = data
  if (typeof s !== 'string' || s.length < 1 || s.length > 10 || !/^[01]+$/.test(s)) throw new Error('s is a binary string of 1 to 10 characters.')
  if (!Number.isInteger(numOps) || numOps < 0 || numOps > s.length) throw new Error('numOps is an integer from 0 to the length of s.')
  return { s, numOps }
}

export function buildTrace({ s, numOps }) {
  const bits = [...s].map(Number)
  const n = bits.length
  // best[c][r]: fewest flips for the prefix so far that ends in character c with a final run of length r.
  const fewestFlips = limit => {
    const INF = Infinity
    const row = () => Array.from({ length: limit + 1 }, () => INF)
    let best = [row(), row()]
    best[0][1] = bits[0] === 0 ? 0 : 1
    best[1][1] = bits[0] === 1 ? 0 : 1
    for (let i = 1; i < n; i++) {
      const next = [row(), row()]
      for (let c = 0; c < 2; c++) {
        const cost = c === bits[i] ? 0 : 1
        const switchFrom = Math.min(...best[1 - c])
        next[c][1] = switchFrom + cost
        for (let r = 2; r <= limit; r++) next[c][r] = best[c][r - 1] + cost
      }
      best = next
    }
    return Math.min(...best[0], ...best[1])
  }
  let lo = 1
  let hi = n
  const domain = [lo, hi]
  const frames = [{ phase: 'start', activeLine: L('set low to 1'), lo, hi, mid: null, verdict: null, cost: null, message: `Binary string ${s} with ${numOps} operations. The longest run lies between ${lo} and ${hi}.` }]
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const cost = fewestFlips(mid)
    const verdict = cost <= numOps
    frames.push({ phase: 'probe', activeLine: L('if the flips needed are at most numOps'), lo, hi, mid, verdict, cost, message: `Longest run ${mid}: ${cost} flips needed, ${verdict ? 'within' : 'over'} the ${numOps} allowed.` })
    if (verdict) hi = mid
    else lo = mid + 1
  }
  frames.push({ phase: 'done', activeLine: L('return low'), lo, hi: lo, mid: null, verdict: true, cost: fewestFlips(lo), message: `Smallest possible longest identical run: ${lo}.` })
  return { input: { s, numOps }, bits, domain, result: lo, frames }
}

export const code = `smallest possible length of the longest run of identical characters
  set low to 1 and high to the length of s
  while low is less than high
    set mid to the middle value, rounded down
    if the flips needed are at most numOps then
      set high to mid
    else
      set low to mid plus 1
  return low

fewest flips so that no run is longer than the limit
  keep, for each last character and run length, the fewest flips so far
  for each next character, either start a new run after the other character
  or extend the current run when it is still within the limit
  add one flip when the new character differs from the original
  return the smallest count over all states at the end`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_identical_length(s, numOps):
    bits = [int(c) for c in s]
    n = len(bits)
    INF = float("inf")

    def fewest_flips(limit):
        best = [[INF] * (limit + 1) for _ in range(2)]
        best[0][1] = 0 if bits[0] == 0 else 1
        best[1][1] = 0 if bits[0] == 1 else 1
        for i in range(1, n):
            nxt = [[INF] * (limit + 1) for _ in range(2)]
            for c in range(2):
                cost = 0 if c == bits[i] else 1
                nxt[c][1] = min(best[1 - c]) + cost
                for r in range(2, limit + 1):
                    nxt[c][r] = best[c][r - 1] + cost
            best = nxt
        return min(min(best[0]), min(best[1]))

    low, high = 1, n
    while low < high:
        mid = (low + high) // 2
        if fewest_flips(mid) <= numOps:
            high = mid
        else:
            low = mid + 1
    return low
`
