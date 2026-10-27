export function parseInput(text) {
  const spec = JSON.parse(text)
  if (!Array.isArray(spec.bulbs) || spec.bulbs.length < 1 || spec.bulbs.length > 30) throw new Error('Use 1 to 30 bulbs.')
  const n = spec.bulbs.length
  if (new Set(spec.bulbs).size !== n || spec.bulbs.some(v => !Number.isInteger(v) || v < 1 || v > n)) throw new Error(`bulbs must list each position from 1 to ${n} exactly once.`)
  if (!Number.isInteger(spec.k) || spec.k < 0 || spec.k > n) throw new Error(`k must be from 0 to ${n}.`)
  return spec
}

export function buildTrace(spec) {
  const { bulbs, k } = spec
  const n = bulbs.length
  // on[p] for positions 1..n; the padding at 0 and n + 1 is always dark.
  const on = Array(n + 2).fill(false)
  const lit = () => on.slice(1, n + 1)
  const frames = [{ phase: 'start', activeLine: L('on = [False]'), day: 0, position: null, lit: lit(), hit: null, result: null, message: `Bulbs come on one per day. Look for two lit bulbs with exactly ${k} dark bulbs between them.` }]
  let answer = -1
  for (let day = 1; day <= n; day++) {
    const position = bulbs[day - 1]
    on[position] = true
    // A bulb `k + 1` steps away with only dark bulbs in between completes the pattern.
    const between = (from, to) => { for (let p = from + 1; p < to; p++) if (on[p]) return false; return true }
    const left = position - k - 1, right = position + k + 1
    const leftHit = left >= 1 && on[left] && between(left, position)
    const rightHit = right <= n && on[right] && between(position, right)
    const hit = leftHit || rightHit
    frames.push({ phase: 'light', activeLine: L('on[pos] = True'), day, position, lit: lit(), hit: hit ? (leftHit ? left : right) : null, result: null, message: hit ? `Day ${day}: bulb ${position} lights, and bulb ${leftHit ? left : right} has exactly ${k} dark bulbs between them.` : `Day ${day}: bulb ${position} lights. No lit pair fits the gap yet.` })
    if (hit) {
      answer = day
      frames.push({ phase: 'match', activeLine: L('return day'), day, position, lit: lit(), hit: leftHit ? left : right, result: day, message: `The first day with the pattern is day ${day}.` })
      break
    }
  }
  if (answer === -1) frames.push({ phase: 'done', activeLine: L('return -1'), day: n, position: null, lit: lit(), hit: null, result: -1, message: 'No day produces the pattern.' })
  return { input: spec, result: answer, frames }
}

export const code = `def kEmptySlots(bulbs, k):
    n = len(bulbs)
    on = [False] * (n + 2)
    for day, pos in enumerate(bulbs, 1):
        on[pos] = True
        left, right = pos - k - 1, pos + k + 1
        if left >= 1 and on[left] and not any(on[left + 1:pos]):
            return day
        if right <= n and on[right] and not any(on[pos + 1:right]):
            return day
    return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
