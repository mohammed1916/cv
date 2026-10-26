const isPal = x => { const s = String(x); return s === [...s].reverse().join('') }
export function parseInput(text) {
  const v = JSON.parse(text)
  if (!v || typeof v !== 'object' || typeof v.left !== 'string' || typeof v.right !== 'string' || !/^[1-9]\d{0,12}$/.test(v.left) || !/^[1-9]\d{0,12}$/.test(v.right)) throw new Error('Enter {"left": "4", "right": "1000"} with positive integer strings of up to 1,000,000,000,000 (capped for visualization).')
  if (Number(v.right) > 1e12) throw new Error('right must be at most 1,000,000,000,000 (capped for visualization).')
  if (Number(v.left) > Number(v.right)) throw new Error('left must not exceed right.')
  return { left: v.left, right: v.right }
}
export function buildTrace({ left, right }) {
  const L = Number(left), R = Number(right)
  const frames = [{ phase: 'start', activeLine: 2, count: 0, candidates: [], message: `Count x in [${L}, ${R}] with x and sqrt(x) both palindromes. Every palindromic root is built from a half, so only those roots are tried.` }]
  const candidates = []
  let count = 0
  for (let half = 1; half < 1000; half++) {
    const s = String(half)
    const roots = [Number(s + [...s].reverse().join('')), Number(s + [...s].reverse().slice(1).join(''))]
    for (const root of roots) {
      const sq = root * root
      if (sq > R) continue
      if (sq < L) { continue }
      const ok = isPal(sq)
      if (ok) count++
      candidates.push({ root, sq, ok })
      frames.push({ phase: ok ? 'accept' : 'reject', activeLine: ok ? 11 : 10, count, candidates: candidates.map(c => ({ ...c })).slice(-60), index: candidates.length - 1, half,
        message: ok ? `Root ${root} (from half ${half}): ${root}^2 = ${sq} is a palindrome, so it counts. Total ${count}.` : `Root ${root} (from half ${half}): ${root}^2 = ${sq} is not a palindrome.` })
    }
  }
  frames.push({ phase: 'done', activeLine: 12, count, candidates: candidates.slice(-60).map(c => ({ ...c })), index: -1, message: `${count} super-palindromes in [${L}, ${R}].` })
  return { input: { left, right }, result: count, frames }
}
export const code = `def superpalindromesInRange(left, right):
    L, R = int(left), int(right)
    def is_pal(x):
        s = str(x)
        return s == s[::-1]
    count = 0
    for half in range(1, 1000):
        s = str(half)
        for root in (int(s + s[::-1]), int(s + s[-2::-1])):
            if L <= root * root <= R:
                if is_pal(root * root):
                    count += 1
    return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
