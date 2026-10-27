export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with word.')
  const { word } = data
  if (typeof word !== 'string' || word.length < 1 || word.length > 30) throw new Error('word is a string of 1 to 30 capital letters.')
  if (!/^[A-Z]+$/.test(word)) throw new Error('word may contain only capital letters A to Z.')
  return { word }
}

// Letters sit on a keyboard with six columns: A B C D E F / G H ... / Y Z.
const dist = (a, b) => Math.abs(Math.floor(a / 6) - Math.floor(b / 6)) + Math.abs((a % 6) - (b % 6))
const label = k => (k < 0 ? '(none)' : String.fromCharCode(65 + k))

export function buildTrace(input) {
  const { word } = input
  const letters = [...word].map(ch => ch.charCodeAt(0) - 65)
  const n = letters.length
  const memo = new Map()
  const entries = []
  const snapshot = () => entries.map(e => ({ ...e }))
  const frames = [{ phase: 'start', activeLine: L('put the first letter'), index: 1, other: -1, memo: [], message: 'The first letter goes on a free finger at no cost. The other finger is unused.' }]

  const best = (i, other) => {
    if (i >= n) return 0
    const key = `${i}:${other}`
    if (memo.has(key)) {
      const value = memo.get(key)
      frames.push({ phase: 'reuse', activeLine: L('if memo already holds'), index: i, other, memo: snapshot(), message: `Typing from letter ${i} with the other finger on ${label(other)} is already known to cost ${value}.` })
      return value
    }
    const previous = letters[i - 1]
    frames.push({ phase: 'visit', activeLine: L('set one to'), index: i, other, memo: snapshot(), message: `Letter ${i} is ${label(letters[i])}. The finger on ${label(previous)} or the other finger (${label(other)}) types it.` })
    const one = dist(previous, letters[i]) + best(i + 1, other)
    const two = (other < 0 ? 0 : dist(other, letters[i])) + best(i + 1, previous)
    const value = Math.min(one, two)
    memo.set(key, value)
    entries.push({ index: i, other, value })
    frames.push({ phase: 'store', activeLine: L('store the smaller'), index: i, other, memo: snapshot(), message: `Best cost from letter ${i} is ${value}.` })
    return value
  }

  const result = best(1, -1)
  frames.push({ phase: 'done', activeLine: L('return the best from'), index: null, other: -1, memo: snapshot(), message: `Minimum distance to type ${word}: ${result}.` })
  return { input, result, frames }
}

export const code = `minimum distance to type the word with two fingers
  put the first letter on a finger, which costs nothing
  return the best from index 1 with the other finger unused

best(i, other)
  if i is past the end of the word then return 0
  if memo already holds (i, other) then return it
  set one to the distance from the previous letter to letter i, plus best(i + 1, other)
  set two to the distance from the other finger to letter i, free if unused, plus best(i + 1, previous letter)
  store the smaller of one and two, then return it`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_distance(word):
    def dist(a, b):
        ra, ca = divmod(a, 6)
        rb, cb = divmod(b, 6)
        return abs(ra - rb) + abs(ca - cb)

    letters = [ord(ch) - 65 for ch in word]
    n = len(letters)
    memo = {}

    def best(i, other):
        if i >= n:
            return 0
        if (i, other) in memo:
            return memo[(i, other)]
        previous = letters[i - 1]
        one = dist(previous, letters[i]) + best(i + 1, other)
        two = (0 if other < 0 else dist(other, letters[i])) + best(i + 1, previous)
        memo[(i, other)] = min(one, two)
        return memo[(i, other)]

    return best(1, -1)
`
