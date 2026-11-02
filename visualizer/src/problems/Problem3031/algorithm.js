export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with word and k.')
  const { word, k } = input
  if (typeof word !== 'string' || word.length < 1 || word.length > 40 || !/^[a-z]+$/.test(word)) throw new Error('word has 1 to 40 lowercase letters in this trace.')
  if (!Number.isInteger(k) || k < 1 || k > word.length) throw new Error('k is an integer from 1 to the word length.')
  return { word, k }
}

export function buildTrace({ word, k }) {
  const frames = []
  const n = word.length
  const z = Array(n).fill(0)
  z[0] = n
  let l = 0
  let r = 0
  frames.push({ pythonLine: 4, phase: 'start', activeLine: L('z[0] = n'), i: 0, z: [...z], t: null, message: `z[0] is ${n}, the whole word.` })
  for (let i = 1; i < n; i++) {
    if (i < r) z[i] = Math.min(r - i, z[i - l])
    while (i + z[i] < n && word[z[i]] === word[i + z[i]]) z[i] += 1
    frames.push({ pythonLine: 9, phase: 'z', activeLine: L('extend z[i] while the letters match'), i, z: [...z], t: null, message: `z[${i}] = ${z[i]}: the suffix at ${i} matches the start for ${z[i]} letters.` })
    if (i + z[i] > r) { l = i; r = i + z[i] }
  }
  frames.push({ pythonLine: 13, phase: 'start', activeLine: L('t = 1'), i: null, z: [...z], t: 1, message: 'Test each second t with one lookup.' })
  let t = 1
  for (;;) {
    if (t * k >= n) {
      frames.push({ pythonLine: 16, phase: 'free', activeLine: L('if t times k is at least n, return t'), i: null, z: [...z], t, message: `After ${t} seconds every letter was removed.` })
      return { input: { word, k }, result: t, frames }
    }
    if (z[t * k] >= n - t * k) {
      frames.push({ pythonLine: 16, phase: 'match', activeLine: L('if z at t times k covers'), i: null, z: [...z], t, message: `z[${t * k}] = ${z[t * k]} covers the remaining ${n - t * k} letters; ${t} seconds work.` })
      return { input: { word, k }, result: t, frames }
    }
    frames.push({ pythonLine: 17, phase: 'miss', activeLine: L('t = t plus 1'), i: null, z: [...z], t, message: `z[${t * k}] = ${z[t * k]} is too short; try ${t + 1}.` })
    t += 1
  }
}

export const code = `minimum seconds to revert the word using the Z-function
  n = length of word; z = list of n zeros; z[0] = n
  l = 0; r = 0
  for i from 1 to n minus 1
    if i is inside [l, r), start z[i] from the mirrored value
    extend z[i] while the letters match
    if i plus z[i] is past r, set l = i and r = i plus z[i]
  t = 1
  repeat
    if t times k is at least n, return t
    if z at t times k covers the rest of the word, return t
    t = t plus 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_time(word, k):
    n = len(word)
    z = [0] * n
    z[0] = n
    l = r = 0
    for i in range(1, n):
        if i < r:
            z[i] = min(r - i, z[i - l])
        while i + z[i] < n and word[z[i]] == word[i + z[i]]:
            z[i] += 1
        if i + z[i] > r:
            l, r = i, i + z[i]
    t = 1
    while True:
        if t * k >= n or z[t * k] >= n - t * k:
            return t
        t += 1
`
