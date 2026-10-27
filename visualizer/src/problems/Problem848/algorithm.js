export function parseInput(text) {
  const p = JSON.parse(text)
  if (!p || typeof p !== 'object' || typeof p.s !== 'string' || !Array.isArray(p.shifts)) throw new Error('Enter JSON like {"s":"abc","shifts":[3,5,9]}.')
  const { s, shifts } = p
  if (!/^[a-z]{1,40}$/.test(s)) throw new Error('s must be 1-40 lowercase letters (visualization cap: 40).')
  if (shifts.length !== s.length || shifts.some(v => !Number.isInteger(v) || v < 0 || v > 1000000000)) throw new Error('shifts must have the same length as s, with integers from 0 to 1,000,000,000.')
  return { s, shifts }
}
export function buildTrace({ s, shifts }) {
  const n = s.length
  const res = s.split('')
  const frames = [{ phase: 'start', activeLine: 3, index: -1, total: 0, res: [...res], message: 'shifts[i] rotates letters 0..i, so letter i is rotated by the sum of shifts[i..n-1]. Sweep from the right keeping that suffix sum mod 26.' }]
  let total = 0
  for (let i = n - 1; i >= 0; i--) {
    const prev = total
    total = (total + shifts[i]) % 26
    frames.push({ phase: 'sum', activeLine: 5, index: i, total, res: [...res], message: `Suffix sum: (${prev} + shifts[${i}] = ${shifts[i]}) mod 26 = ${total}. Letter ${i} will rotate ${total} places.` })
    const c = String.fromCharCode(((s.charCodeAt(i) - 97 + total) % 26) + 97)
    res[i] = c
    frames.push({ phase: 'shift', activeLine: 6, index: i, total, res: [...res], message: `'${s[i]}' (${s.charCodeAt(i) - 97}) + ${total}, wrapped mod 26, becomes '${c}'.` })
  }
  const out = res.join('')
  frames.push({ phase: 'done', activeLine: 7, index: -1, total, res: [...res], message: `Result: "${out}".` })
  return { input: { s, shifts }, result: out, frames }
}
export const code = `function shiftingLetters(s, shifts)
  set res to a list holding the letters of s
  set total to 0
  for i from n - 1 down to 0, scanning right to left
    set total to (total + shifts[i]) mod 26
    set res[i] to the letter s[i] moved forward by total, wrapping mod 26
  return res joined into a string`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def shifting_letters(s, shifts):
    res = list(s)
    total = 0
    for i in range(len(s) - 1, -1, -1):
        total = (total + shifts[i]) % 26
        res[i] = chr((ord(s[i]) - 97 + total) % 26 + 97)
    return ''.join(res)
`
