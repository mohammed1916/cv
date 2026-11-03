export const code = `the fewest groups of words that are related by rotating their even-index and odd-index letters
  set keys to an empty set
  for each word
    split the word into even-index letters E and odd-index letters O
    set rE to the start of the smallest rotation of E, and rO to the same for O
    add the pair (rotation of E from rE, rotation of O from rO) to keys
  return the size of keys`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const at = code.findIndex(c => c.text.includes(text))
  if (at < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return at + 1
}

export const python = `def count_groups(words):
    def min_rotation(s):
        n = len(s)
        i, j, k = 0, 1, 0
        while i < n and j < n and k < n:
            a = s[(i + k) % n]
            b = s[(j + k) % n]
            if a == b:
                k += 1
            else:
                if a > b:
                    i += k + 1
                else:
                    j += k + 1
                if i == j:
                    j += 1
                k = 0
        return min(i, j)

    keys = set()
    for word in words:
        even = word[0::2]
        odd = word[1::2]
        re = min_rotation(even) if even else 0
        ro = min_rotation(odd) if odd else 0
        keys.add((even[re:] + even[:re], odd[ro:] + odd[:ro]))
    return len(keys)
`
const pyLines = python.split('\n')
const P = text => {
  const at = pyLines.findIndex(line => line.includes(text))
  if (at < 0) throw new Error(`Missing python line: ${text}`)
  return at + 1
}

export function minRotation(s) {
  const steps = []
  const n = s.length
  let i = 0, j = 1, k = 0
  if (n === 0) return { start: 0, steps }
  while (i < n && j < n && k < n) {
    const a = s[(i + k) % n]
    const b = s[(j + k) % n]
    if (a === b) {
      k += 1
    } else {
      if (a > b) i += k + 1
      else j += k + 1
      if (i === j) j += 1
      k = 0
    }
    steps.push({ i, j, k })
  }
  return { start: Math.min(i, j), steps }
}

const rotate = (s, r) => s.slice(r) + s.slice(0, r)

export function parseInput(text) {
  const words = JSON.parse(text)
  if (!Array.isArray(words) || words.length < 1 || words.length > 8) throw new Error('Use an array of 1 to 8 lowercase words.')
  if (!words.every(w => typeof w === 'string' && /^[a-z]{1,8}$/.test(w))) throw new Error('Each word is 1 to 8 lowercase letters.')
  return words
}

export function buildTrace(words) {
  const frames = []
  const keys = new Map()
  const groupOf = []
  frames.push({ pythonLine: P('keys = set()'), phase: 'start', activeLine: L('set keys to an empty set'), word: null, even: '', odd: '', pointers: null, key: null, groups: 0, message: `Group ${words.length} words by their rotation class.` })
  words.forEach((word, idx) => {
    const even = [...word].filter((_, p) => p % 2 === 0).join('')
    const odd = [...word].filter((_, p) => p % 2 === 1).join('')
    frames.push({ pythonLine: P('even = word[0::2]'), phase: 'split', activeLine: L('split the word into even-index'), word, idx, even, odd, pointers: null, key: null, groups: keys.size, message: `Word ${idx} "${word}": even letters ${even || '(none)'}, odd letters ${odd || '(none)'}.` })
    const me = minRotation(even)
    const mo = minRotation(odd)
    frames.push({ pythonLine: P('re = min_rotation(even)'), phase: 'rotate', activeLine: L('set rE to the start of the smallest rotation'), word, idx, even, odd, pointers: me.steps.at(-1) ?? { i: 0, j: 0, k: 0 }, rotated: [rotate(even, me.start), rotate(odd, mo.start)], key: null, groups: keys.size,
      message: `Smallest rotation of the even letters starts at ${me.start}, of the odd letters at ${mo.start}.` })
    const key = `${rotate(even, me.start)}|${rotate(odd, mo.start)}`
    const existing = keys.get(key)
    if (existing === undefined) keys.set(key, keys.size)
    groupOf.push(keys.get(key))
    frames.push({ pythonLine: P('keys.add('), phase: existing === undefined ? 'new' : 'join', activeLine: L('add the pair'), word, idx, even, odd, pointers: null, key, groups: keys.size, group: keys.get(key),
      message: existing === undefined ? `New class ${key.replace('|', ' / ')}; groups now ${keys.size}.` : `Same class as an earlier word; groups stay ${keys.size}.` })
  })
  const result = keys.size
  frames.push({ pythonLine: P('return len(keys)'), phase: 'done', activeLine: L('return the size of keys'), word: null, even: '', odd: '', pointers: null, key: null, groups: result, message: `${result} group${result === 1 ? '' : 's'} needed.` })
  return { input: words, result, frames, groupOf }
}
