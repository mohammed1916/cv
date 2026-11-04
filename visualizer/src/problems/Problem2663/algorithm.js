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
  const frames = [{ phase: 'start', activeLine: L('let a be the letters'), pythonLine: P('a = [ord(ch) - 97 for ch in s]'), index: -1, text: s, message: `Find the smallest beautiful string of length ${n} above ${s}.` }]
  for (let i = n - 1; i >= 0; i--) {
    frames.push({ phase: 'scan', activeLine: L('for i from n - 1'), pythonLine: P('for i in range(n - 1, -1, -1)'), index: i, text: str(a), message: `Try to raise position ${i}.` })
    for (let c = a[i] + 1; c < k; c++) {
      if ((i >= 1 && c === a[i - 1]) || (i >= 2 && c === a[i - 2])) continue
      a[i] = c
      frames.push({ phase: 'place', activeLine: L('set a[i] to c'), pythonLine: P('a[i] = c'), index: i, text: str(a), message: `Raise position ${i} to ${String.fromCharCode(97 + c)}. It avoids the two letters before it.` })
      for (let j = i + 1; j < n; j++) {
        let d = 0
        while ((j >= 1 && d === a[j - 1]) || (j >= 2 && d === a[j - 2])) d++
        a[j] = d
      }
      const result = str(a)
      frames.push({ phase: 'fill', activeLine: L('fill each later'), pythonLine: P('for j in range(i + 1, n)'), index: i, text: result, message: `Fill the later positions with the smallest safe letters.` })
      frames.push({ phase: 'done', activeLine: L('return the result'), pythonLine: P("return ''.join("), index: -1, text: result, message: `Smallest beautiful string: ${result}.` })
      return { input, s, k, result, frames }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the empty string'), pythonLine: python.split('\n').findIndex(l => l.trim() === "return ''") + 1, index: -1, text: '', message: 'No beautiful string is larger than s.' })
  return { input, s, k, result: '', frames }
}

const CODE = [
  'function smallestBeautiful(s, k) {',
  '  const a = [...s].map(ch => ch.charCodeAt(0) - 97) // let a be the letters of s as numbers',
  '  for (let i = a.length - 1; i >= 0; i--) { // for i from n - 1 down to 0',
  '    for (let c = a[i] + 1; c < k; c++) { // for each letter c above a[i] and below k',
  '      if (c !== a[i - 1] && c !== a[i - 2]) {',
  '        a[i] = c // set a[i] to c',
  '        for (let j = i + 1; j < a.length; j++) a[j] = smallestAvoiding(a, j) // fill each later position with the smallest letter that avoids the two letters before it',
  '        return a.map(x => String.fromCharCode(97 + x)).join("") // return the result',
  '      }',
  '    }',
  '  }',
  '  return "" // return the empty string',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = s => CODE.findIndex(c => c.includes(s)) + 1

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
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
