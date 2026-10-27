export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 1000) throw new Error('Enter a JSON integer n with 1 <= n <= 1000 (visualization cap; LeetCode allows 10000).')
  return n
}
export function buildTrace(n) {
  const status = [] // 'good' | 'same' | 'invalid'
  const frames = [{ phase: 'start', activeLine: 1, x: 0, count: 0, digits: '', message: 'Examine 1..n. A number is good if every digit rotates to a digit and at least one digit changes.' }]
  let count = 0
  for (let x = 1; x <= n; x++) {
    let valid = true, changed = false
    const digits = String(x)
    for (const d of digits) {
      if ('347'.includes(d)) { valid = false; break }
      if ('2569'.includes(d)) changed = true
    }
    const kind = !valid ? 'invalid' : changed ? 'good' : 'same'
    status.push(kind)
    if (kind === 'good') count++
    const why = kind === 'invalid' ? `it has a digit from 3, 4, 7, which becomes invalid when rotated`
      : kind === 'good' ? `all digits rotate and at least one of 2, 5, 6, 9 changes it`
      : `every digit is 0, 1, or 8, so it rotates to itself`
    frames.push({ phase: kind, activeLine: kind === 'good' ? 8 : kind === 'invalid' ? 5 : 7, x, count, digits, message: `${x}: ${why}${kind === 'good' ? ' (counted).' : ' (not counted).'}` })
  }
  frames.push({ phase: 'done', activeLine: 9, x: n, count, digits: '', message: `${count} good numbers in 1..${n}.` })
  return { input: n, result: count, status, frames }
}
export const code = `set count to 0
for each x from 1 to n
  set valid to true and changed to false
  for each digit d of x
    if d is 3, 4 or 7 then set valid to false and stop reading digits
    if d is 2, 5, 6 or 9 then set changed to true
  if valid and changed is false then continue to the next x
  add 1 to count
return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def rotated_digits(n):
    count = 0
    for x in range(1, n + 1):
        valid = True
        changed = False
        for d in str(x):
            if d in "347":
                valid = False
                break
            if d in "2569":
                changed = True
        if valid and changed:
            count += 1
    return count
`
