export function parseInput(text) {
  const arr = JSON.parse(text)
  if (!Array.isArray(arr) || arr.length !== 4 || arr.some(d => !Number.isInteger(d) || d < 0 || d > 9)) throw new Error('Enter a JSON array of exactly 4 digits, each 0 to 9.')
  return arr
}

function permutations(arr) {
  const out = []
  const used = Array(4).fill(false), cur = []
  const go = () => {
    if (cur.length === 4) { out.push([...cur]); return }
    for (let i = 0; i < 4; i++) {
      if (used[i]) continue
      used[i] = true; cur.push(arr[i]); go(); cur.pop(); used[i] = false
    }
  }
  go()
  return out
}
const fmt = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

export function buildTrace(arr) {
  const frames = [{ phase: 'start', activeLine: L('Set best to -1'), pythonLine: 4, perm: [...arr], best: -1, bestText: '', message: 'Only 4! = 24 orderings exist, so try them all and keep the maximum valid minute count.' }]
  let best = -1
  let bestPerm = null
  permutations(arr).forEach((perm, idx) => {
    const [h1, h2, m1, m2] = perm
    const hours = h1 * 10 + h2, mins = m1 * 10 + m2
    const valid = hours < 24 && mins < 60
    let improved = false
    if (valid && hours * 60 + mins > best) { best = hours * 60 + mins; bestPerm = perm; improved = true }
    frames.push({ phase: valid ? (improved ? 'better' : 'valid') : 'invalid', activeLine: valid ? L('set best to the larger of') : L('if hours is less than 24'), pythonLine: valid ? 9 : 8, perm, idx: idx + 1, valid, best, bestPerm, bestText: best < 0 ? '' : fmt(best),
      message: !valid ? `${h1}${h2}:${m1}${m2} is not a time (${hours >= 24 ? `hours ${hours} >= 24` : `minutes ${mins} >= 60`}).` : improved ? `${h1}${h2}:${m1}${m2} is valid and later than the previous best: new best ${fmt(best)}.` : `${h1}${h2}:${m1}${m2} is valid but not later than ${fmt(best)}.` })
  })
  const result = best < 0 ? '' : fmt(best)
  frames.push({ phase: 'done', activeLine: best < 0 ? L('return the empty string') : L('return best as HH:MM'), pythonLine: best < 0 ? 11 : 12, perm: bestPerm || [...arr], best, bestPerm, bestText: result, message: result ? `Latest time: ${result}.` : 'No ordering forms a valid time: return the empty string.' })
  return { input: [...arr], result, frames }
}

export const code = `Set best to -1 (no valid time found yet)
for each of the 24 orderings (h1, h2, m1, m2) of the four digits
  let hours be h1 * 10 + h2, and mins be m1 * 10 + m2
  if hours is less than 24 and mins is less than 60
    set best to the larger of best and hours * 60 + mins
if best is less than 0, return the empty string
return best as HH:MM`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from itertools import permutations

def largest_time_from_digits(arr):
    best = -1
    for h1, h2, m1, m2 in permutations(arr):
        hours = h1 * 10 + h2
        mins = m1 * 10 + m2
        if hours < 24 and mins < 60:
            best = max(best, hours * 60 + mins)
    if best < 0:
        return ""
    return "%02d:%02d" % (best // 60, best % 60)`
