export function parseInput(text) {
  const data = JSON.parse(text)
  const { n, k } = data ?? {}
  if (!Number.isInteger(n) || n < 1 || n > 10000) throw new Error('n must be an integer from 1 to 10,000.')
  if (!Number.isInteger(k) || k < 1 || k >= n) throw new Error('k must be an integer with 1 ≤ k < n.')
  return { n, k }
}

// Zig-zag from both ends: 1, k+1, 2, k, … uses differences k, k−1, …, 1, which gives exactly k distinct values.
export function buildTrace({ n, k }) {
  const out = []
  let lo = 1, hi = k + 1
  const frames = [{ phase: 'start', perm: [], diffs: [], activeLine: L('set out to an empty list'), message: `Alternate between the low end and the high end of 1…${k + 1}.` }]
  let turnLow = true
  while (out.length < k + 1) {
    out.push(turnLow ? lo++ : hi--)
    turnLow = !turnLow
    frames.push({ phase: 'place', perm: [...out], diffs: distinctDiffs(out), activeLine: L('append lo if turn'), message: `Place ${out.at(-1)}.` })
  }
  for (let v = k + 2; v <= n; v++) {
    out.push(v)
    frames.push({ phase: 'tail', perm: [...out], diffs: distinctDiffs(out), activeLine: L('append k+2 through n'), message: `Append ${v}: consecutive values give difference 1, already counted.` })
  }
  const result = out
  frames.push({ phase: 'done', perm: [...result], diffs: distinctDiffs(result), result, activeLine: L('return out'), message: `A permutation with ${distinctDiffs(result).length} distinct differences.` })
  return { input: { n, k }, result, frames }
}

function distinctDiffs(list) {
  return [...new Set(list.slice(1).map((v, i) => Math.abs(v - list[i])))].sort((a, b) => a - b)
}

export const code = `function constructArray(n, k):
  set out to an empty list, lo to 1, and hi to k + 1
  set turn to low
  while lo is at most hi:
    append lo if turn is low, otherwise append hi
    if turn is low, increase lo by 1; otherwise decrease hi by 1
    flip turn
  append k+2 through n to out, in order
  return out`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def construct_array(n, k):
    out, lo, hi = [], 1, k + 1
    turn_low = True
    while lo <= hi:
        out.append(lo if turn_low else hi)
        if turn_low:
            lo += 1
        else:
            hi -= 1
        turn_low = not turn_low
    out += range(k + 2, n + 1)
    return out
`
