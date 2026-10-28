const MOD = 1000000007

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || Array.isArray(value) || Object.keys(value).sort().join() !== 'h_fences,m,n,v_fences') throw new Error('Use an object with exactly the keys "m", "n", "h_fences" and "v_fences".')
  const { m, n, h_fences: hFences, v_fences: vFences } = value
  if (!Number.isInteger(m) || m < 3 || m > 10 || !Number.isInteger(n) || n < 3 || n > 10) throw new Error('m and n are integers from 3 to 10.')
  const check = (list, limit, name) => {
    if (!Array.isArray(list) || list.length > 4) throw new Error(`${name} holds up to 4 fences.`)
    if (list.some(v => !Number.isInteger(v) || v < 2 || v > limit - 1)) throw new Error(`${name} positions are integers from 2 to ${limit - 1}.`)
    if (new Set(list).size !== list.length) throw new Error(`${name} positions must be distinct.`)
  }
  check(hFences, m, 'h_fences')
  check(vFences, n, 'v_fences')
  return { m, n, h_fences: hFences, v_fences: vFences }
}

export function buildTrace({ m, n, h_fences: hFences, v_fences: vFences }) {
  const hLines = [1, m, ...hFences]
  const vLines = [1, n, ...vFences]
  const gapsOf = lines => {
    const gaps = new Set()
    for (const a of lines) for (const b of lines) if (a > b) gaps.add(a - b)
    return gaps
  }
  const hGaps = gapsOf(hLines)
  const vGaps = gapsOf(vLines)
  const candidates = [...hGaps].sort((a, b) => b - a)
  const frames = [{ phase: 'start', activeLine: L('set horizontal to 1'), active: -1, roles: {}, state: { horizontalGaps: candidates.join(', ') }, message: `Horizontal lines ${[...hLines].sort((a, b) => a - b).join(', ')}. Vertical lines ${[...vLines].sort((a, b) => a - b).join(', ')}.` }]
  let best = -1
  candidates.forEach((gap, i) => {
    const inVertical = vGaps.has(gap)
    frames.push({ phase: 'try', activeLine: L('if gap is in vertGaps'), active: i, roles: { [i]: inVertical ? 'match' : 'no match' }, state: { gap, inVertical }, message: `Side ${gap}: ${inVertical ? 'also a vertical gap, so a square of this side is possible.' : 'not a vertical gap.'}` })
    if (inVertical && best === -1) {
      best = gap
      frames.push({ phase: 'found', activeLine: L('set best to gap'), active: i, roles: { [i]: 'best' }, state: { side: gap }, message: `The largest common side is ${gap}.` })
    }
  })
  const result = best === -1 ? -1 : (best * best) % MOD
  frames.push({ phase: 'done', activeLine: L('return best times best'), active: -1, roles: {}, state: { result }, message: best === -1 ? 'No common side, so return -1.' : `Area ${best} squared, modulo 1000000007, is ${result}.` })
  return { input: { m, n, h_fences: hFences, v_fences: vFences }, result, items: candidates, frames }
}

export const code = `largest square area after removing fences
  set horizontal to 1, m, and the horizontal fences
  set vertical to 1, n, and the vertical fences
  set horizontalGaps to every difference between two horizontal lines
  set vertGaps to every difference between two vertical lines
  set best to -1
  for each gap in horizontalGaps from largest to smallest
    if gap is in vertGaps then
      set best to gap
      stop searching
  if best is -1 then return -1
  return best times best modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximize_square_area(m, n, h_fences, v_fences):
    h_lines = [1, m] + h_fences
    v_lines = [1, n] + v_fences
    h_gaps = {abs(a - b) for a in h_lines for b in h_lines if a != b}
    v_gaps = {abs(a - b) for a in v_lines for b in v_lines if a != b}
    common = h_gaps & v_gaps
    if not common:
        return -1
    side = max(common)
    return side * side % 1000000007
`
