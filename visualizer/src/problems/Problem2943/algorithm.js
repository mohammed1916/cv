export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Use an object with keys n, m, h_bars and v_bars.')
  const { n, m, h_bars, v_bars } = obj
  if (!Number.isInteger(n) || !Number.isInteger(m) || n < 1 || m < 1 || n > 8 || m > 8) throw new Error('n and m are integers from 1 to 8.')
  const check = (bars, top, name) => {
    if (!Array.isArray(bars) || bars.length > 6) throw new Error(`${name} is an array of at most 6 bars.`)
    if (bars.some(v => !Number.isInteger(v) || v < 2 || v > top + 1)) throw new Error(`${name} entries are bars from 2 to ${top + 1}.`)
    if (new Set(bars).size !== bars.length) throw new Error(`${name} entries are distinct.`)
  }
  check(h_bars, n, 'h_bars')
  check(v_bars, m, 'v_bars')
  return { n, m, h_bars, v_bars }
}

// Length of the longest run of consecutive bar positions, which is the number of removed bars in a row.
function longestRun(bars) {
  const ordered = [...bars].sort((a, b) => a - b)
  let best = 0
  let run = 0
  let prev = null
  for (const v of ordered) {
    run = prev !== null && v === prev + 1 ? run + 1 : 1
    prev = v
    best = Math.max(best, run)
  }
  return best
}

export function buildTrace(input) {
  const { n, m, h_bars, v_bars } = input
  const hRun = longestRun(h_bars)
  const vRun = longestRun(v_bars)
  const side = Math.min(hRun, vRun) + 1
  const frames = [
    { phase: 'horizontal', activeLine: L('set horizontal to'), index: -1, hRun, vRun, side: null, message: `Longest run of consecutive horizontal bars: ${hRun}, so a hole can be ${hRun + 1} rows tall.` },
    { phase: 'vertical', activeLine: L('set vertical to'), index: -1, hRun, vRun, side: null, message: `Longest run of consecutive vertical bars: ${vRun}, so a hole can be ${vRun + 1} columns wide.` },
    { phase: 'done', activeLine: L('return area'), index: -1, hRun, vRun, side, message: `The square side is ${side}, so the area is ${side * side}.` },
  ]
  return { input, n, m, result: side * side, frames }
}

export const code = `maximum area of a square hole
  set horizontal to the longest run of consecutive horizontal bars
  set vertical to the longest run of consecutive vertical bars
  set side to the smaller of horizontal and vertical, plus 1
  set area to side times side
  return area`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_square_hole_area(n, m, h_bars, v_bars):
    def longest_run(bars):
        best = 0
        run = 0
        prev = None
        for v in sorted(bars):
            run = run + 1 if prev is not None and v == prev + 1 else 1
            prev = v
            best = max(best, run)
        return best
    side = min(longest_run(h_bars), longest_run(v_bars)) + 1
    return side * side
`
