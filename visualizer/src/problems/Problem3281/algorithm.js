export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with start (an array) and d.')
  const { start, d } = data
  if (!Array.isArray(start) || start.length < 2 || start.length > 8) throw new Error('start needs 2 to 8 integers.')
  if (start.some(v => !Number.isInteger(v) || v < 0 || v > 30)) throw new Error('Each start is an integer from 0 to 30.')
  if (!Number.isInteger(d) || d < 0 || d > 10) throw new Error('d is an integer from 0 to 10.')
  return { start, d }
}

export function buildTrace({ start, d }) {
  const starts = [...start].sort((a, b) => a - b)
  // Place each number as early as the gap allows inside its range [start, start + d].
  const place = score => {
    const positions = [starts[0]]
    for (let i = 1; i < starts.length; i++) {
      const at = Math.max(starts[i], positions[i - 1] + score)
      if (at > starts[i] + d) return { positions, ok: false }
      positions.push(at)
    }
    return { positions, ok: true }
  }
  let lo = 0
  let hi = starts[starts.length - 1] + d - starts[0]
  const domain = [lo, hi]
  const frames = [{ phase: 'start', activeLine: L('set low to 0'), lo, hi, mid: null, verdict: null, positions: [], message: `Sorted ranges start at ${starts.join(', ')}, each of length ${d}. The score lies between ${lo} and ${hi}.` }]
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    const { positions, ok } = place(mid)
    frames.push({ phase: 'probe', activeLine: L('if every number can be placed with the gap'), lo, hi, mid, verdict: ok, positions, message: `Score ${mid}: ${ok ? 'every number fits in its range' : 'a number has no room left in its range'}.` })
    if (ok) lo = mid
    else hi = mid - 1
  }
  frames.push({ phase: 'done', activeLine: L('return low'), lo, hi: lo, mid: null, verdict: null, positions: place(lo).positions, message: `Largest achievable score: ${lo}.` })
  return { input: { start, d }, sorted: starts, domain, result: lo, frames }
}

export const code = `largest achievable minimum gap between chosen numbers
  sort the starts
  set low to 0 and high to the last start plus d minus the first start
  while low is less than high
    set mid to the middle value, rounded up
    if every number can be placed with the gap mid then
      set low to mid
    else
      set high to mid minus 1
  return low

placing numbers with a gap
  place the first number at its start
  for each next range, place the number at the later of its start and the previous number plus the gap
  if that spot is past the end of the range then
    report that the gap cannot be kept
  otherwise keep the spot`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximize_score_in_ranges(start, d):
    starts = sorted(start)

    def fits(score):
        position = starts[0]
        for value in starts[1:]:
            position = max(value, position + score)
            if position > value + d:
                return False
        return True

    low, high = 0, starts[-1] + d - starts[0]
    while low < high:
        mid = (low + high + 1) // 2
        if fits(mid):
            low = mid
        else:
            high = mid - 1
    return low
`
