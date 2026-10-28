export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || typeof obj.s !== 'string' || !Number.isInteger(obj.k)) throw new Error('Use a JSON object with a string s and an integer k.')
  const { s, k } = obj
  if (k < 4 || k > 26) throw new Error('k is an integer from 4 to 26.')
  if (s.length < 1 || s.length > 40) throw new Error('s must have 1 to 40 letters (visualization cap).')
  if (!/^[a-z]+$/.test(s)) throw new Error('s uses lowercase letters only.')
  const a = [...s].map(ch => ch.charCodeAt(0) - 97)
  if (a.some(v => v >= k)) throw new Error('s may use only the first k letters.')
  for (let i = 0; i < a.length; i++) {
    for (let j = i + 1; j < a.length; j++) {
      const sub = a.slice(i, j + 1)
      if (sub.every((v, idx) => v === sub[sub.length - 1 - idx])) throw new Error('s must not contain a palindromic substring of length 2 or more.')
    }
  }
  return { s, k }
}

const str = a => a.map(v => String.fromCharCode(97 + v)).join('')

export function buildTrace(input) {
  const { s, k } = input
  const a = [...s].map(ch => ch.charCodeAt(0) - 97)
  const n = a.length
  const frames = [{ phase: 'start', activeLine: L('let a be the letters'), index: -1, text: s, message: `Find the smallest beautiful string of length ${n} above ${s}.` }]
  for (let i = n - 1; i >= 0; i--) {
    frames.push({ phase: 'scan', activeLine: L('for i from n - 1'), index: i, text: str(a), message: `Try to raise position ${i}.` })
    for (let c = a[i] + 1; c < k; c++) {
      if ((i >= 1 && c === a[i - 1]) || (i >= 2 && c === a[i - 2])) continue
      a[i] = c
      frames.push({ phase: 'place', activeLine: L('set a[i] to c'), index: i, text: str(a), message: `Raise position ${i} to ${String.fromCharCode(97 + c)}. It avoids the two letters before it.` })
      for (let j = i + 1; j < n; j++) {
        let d = 0
        while ((j >= 1 && d === a[j - 1]) || (j >= 2 && d === a[j - 2])) d++
        a[j] = d
      }
      const result = str(a)
      frames.push({ phase: 'fill', activeLine: L('fill each later'), index: i, text: result, message: `Fill the later positions with the smallest safe letters.` })
      frames.push({ phase: 'done', activeLine: L('return the result'), index: -1, text: result, message: `Smallest beautiful string: ${result}.` })
      return { input, s, k, result, frames }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the empty string'), index: -1, text: '', message: 'No beautiful string is larger than s.' })
  return { input, s, k, result: '', frames }
}

export const code = `smallest beautiful string of length n that is larger than s
  let a be the letters of s as numbers
  for i from n - 1 down to 0 do
    for each letter c above a[i] and below k, in order, do
      if c is not a[i-1] and c is not a[i-2] then
        set a[i] to c
        fill each later position with the smallest letter that avoids the two letters before it
        return the result
  return the empty string`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_beautiful(s, k):
    a = [ord(ch) - 97 for ch in s]
    n = len(a)
    for i in range(n - 1, -1, -1):
        for c in range(a[i] + 1, k):
            if i >= 1 and c == a[i - 1]:
                continue
            if i >= 2 and c == a[i - 2]:
                continue
            a[i] = c
            for j in range(i + 1, n):
                d = 0
                while (j >= 1 and d == a[j - 1]) or (j >= 2 and d == a[j - 2]):
                    d += 1
                a[j] = d
            return ''.join(chr(97 + x) for x in a)
    return ''
`
