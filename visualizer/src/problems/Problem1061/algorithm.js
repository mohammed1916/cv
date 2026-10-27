const LOWER = /^[a-z]+$/

export function parseInput(text) {
  const data = JSON.parse(text)
  const { s1, s2, baseStr } = data ?? {}
  if (typeof s1 !== 'string' || typeof s2 !== 'string' || s1.length < 1 || s1.length > 8 || s1.length !== s2.length || !LOWER.test(s1) || !LOWER.test(s2)) throw new Error('s1 and s2 are lowercase strings of the same length, from 1 to 8.')
  if (typeof baseStr !== 'string' || baseStr.length < 1 || baseStr.length > 10 || !LOWER.test(baseStr)) throw new Error('baseStr is a lowercase string of 1 to 10 letters.')
  return { s1, s2, baseStr }
}

export function buildTrace({ s1, s2, baseStr }) {
  const parent = Array.from({ length: 26 }, (_, i) => i)
  const find = x => { while (parent[x] !== x) x = parent[x]; return x }
  const letter = i => String.fromCharCode(97 + i)
  const roots = () => Array.from({ length: 26 }, (_, i) => letter(find(i)))
  const frames = [{ phase: 'start', activeLine: L('give each letter its own set'), pair: null, roots: roots(), message: 'Every letter starts as its own group.' }]
  for (let i = 0; i < s1.length; i++) {
    const a = s1.charCodeAt(i) - 97
    const b = s2.charCodeAt(i) - 97
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) { if (ra < rb) parent[rb] = ra; else parent[ra] = rb }
    frames.push({ phase: 'merge', activeLine: L('merge the set of s1'), pair: [s1[i], s2[i]], roots: roots(), message: `Join ${s1[i]} and ${s2[i]}; the smaller letter is the representative.` })
  }
  const result = [...baseStr].map(c => letter(find(c.charCodeAt(0) - 97))).join('')
  frames.push({ phase: 'done', activeLine: L('return the new string'), pair: null, roots: roots(), message: `Mapped base string: ${result}.` })
  return { input: { s1, s2, baseStr }, result, frames }
}

export const code = `lexicographically smallest equivalent of baseStr, given s1 and s2
  give each letter its own set, whose representative is the letter itself
  for each position i
    merge the set of s1[i] with the set of s2[i], keeping the smaller letter as representative
  replace each letter of baseStr with the representative of its set
  return the new string`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_equivalent(s1, s2, baseStr):
    parent = list(range(26))

    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x

    for a, b in zip(s1, s2):
        ra, rb = find(ord(a) - 97), find(ord(b) - 97)
        if ra != rb:
            if ra < rb:
                parent[rb] = ra
            else:
                parent[ra] = rb
    return ''.join(chr(find(ord(c) - 97) + 97) for c in baseStr)
`
