export function zeros(x) { let z = 0; while (x) { x = Math.floor(x / 5); z += x } return z }
export function parseInput(text) {
  const k = JSON.parse(text)
  if (!Number.isInteger(k) || k < 0 || k > 1000000000) throw new Error('Enter a JSON integer k with 0 <= k <= 1,000,000,000.')
  return k
}
export function buildTrace(k) {
  let lo = 0, hi = 5 * (k + 1)
  const frames = [{ phase: 'start', activeLine: 2, lo, hi, mid: -1, z: -1, terms: [], message: `zeros(x) never decreases, and zeros(5(k+1)) is at least k+1. So the smallest x with zeros(x) >= k lies in [0, ${hi}].` }]
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const terms = []
    for (let p = Math.floor(mid / 5); p > 0; p = Math.floor(p / 5)) terms.push(p)
    const z = zeros(mid)
    frames.push({ phase: 'probe', activeLine: 5, lo, hi, mid, z, terms, message: `mid = ${mid}: trailing zeros of ${mid}! = ${terms.join(' + ') || '0'} = ${z}.` })
    if (z >= k) {
      hi = mid
      frames.push({ phase: 'shrink', activeLine: 6, lo, hi, mid, z, terms, message: `${z} >= ${k}: ${mid} is a candidate, so keep it and search lower (hi = ${mid}).` })
    } else {
      lo = mid + 1
      frames.push({ phase: 'raise', activeLine: 8, lo, hi, mid, z, terms, message: `${z} < ${k}: too few zeros, so the answer is above ${mid} (lo = ${lo}).` })
    }
  }
  const zl = zeros(lo)
  const result = zl === k ? 5 : 0
  frames.push({ phase: 'done', activeLine: 9, lo, hi, mid: lo, z: zl, terms: [], message: zl === k ? `zeros(${lo}) = ${k} exactly. zeros jumps only at multiples of 5, so x = ${lo}..${lo + 4} all give k zeros: answer 5.` : `zeros(${lo}) = ${zl}, which skips over ${k}: no x gives exactly ${k} zeros, answer 0.` })
  return { input: k, result, frames }
}
export const code = `define zeros(x) as the trailing zeros of x!, which is floor(x/5) + floor(x/25) + ...
set lo = 0 and hi = 5 * (k + 1)
while lo < hi
  set mid = (lo + hi) / 2, using integer division
  if zeros(mid) is at least k then
    set hi = mid
  otherwise
    set lo = mid + 1
if zeros(lo) equals k then return 5, otherwise return 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def preimage_size_fzf(k):
    def zeros(x):
        z = 0
        while x:
            x //= 5
            z += x
        return z
    lo, hi = 0, 5 * (k + 1)
    while lo < hi:
        mid = (lo + hi) // 2
        if zeros(mid) >= k:
            hi = mid
        else:
            lo = mid + 1
    return 5 if zeros(lo) == k else 0
`
