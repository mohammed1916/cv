const VOWELS = new Set(['a', 'e', 'i', 'o', 'u'])

export function parseInput(text) {
  const input = JSON.parse(text)
  const { s, k } = input ?? {}
  if (typeof s !== 'string' || s.length < 1 || s.length > 20 || !/^[a-z]+$/.test(s)) throw new Error('s has 1 to 20 lowercase letters.')
  if (!Number.isInteger(k) || k < 1 || k > 1000) throw new Error('k is an integer from 1 to 1000.')
  return { s, k }
}

export function buildTrace({ s, k }) {
  const frames = []
  let m = 1
  while ((m * m) % k !== 0) m += 1
  const counts = new Map([['0,0', 1]])
  let v = 0
  let c = 0
  let answer = 0
  frames.push({ pythonLine: P('counts = {(0, 0): 1}'), phase: 'start', activeLine: L('remember the empty prefix'), at: -1, v, c, found: 0, answer, message: `Vowel count must be a multiple of ${m} to make the product divisible by ${k}.` })
  for (let i = 0; i < s.length; i++) {
    if (VOWELS.has(s[i])) v += 1
    else c += 1
    const key = `${v - c},${v % m}`
    const found = counts.get(key) ?? 0
    answer += found
    counts.set(key, (counts.get(key) ?? 0) + 1)
    frames.push({ pythonLine: P('answer += counts.get(key, 0)'), phase: 'scan', activeLine: L('count earlier prefixes'), at: i, v, c, found, answer, message: `Ends at ${s[i]}: ${found} earlier prefix${found === 1 ? '' : 'es'} balance this one, total ${answer}.` })
  }
  frames.push({ pythonLine: P('return answer'), phase: 'done', activeLine: L('return the answer'), at: -1, v, c, found: 0, answer, message: `${answer} beautiful substring${answer === 1 ? '' : 's'}.` })
  return { input: { s, k }, result: answer, frames }
}

export const code = `count beautiful substrings of s for a given k
  find the smallest m with m times m divisible by k
  start counts with the empty prefix balance (0, 0) seen once
  set v and c to the running vowel and consonant counts
  for each letter of s
    update v or c
    key is (v minus c, v modulo m)
    add the number of earlier prefixes with that key to answer
    record this key
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_beautiful_substrings(s, k):
    vowels = set("aeiou")
    m = 1
    while (m * m) % k != 0:
        m += 1
    counts = {(0, 0): 1}
    v = c = 0
    answer = 0
    for ch in s:
        if ch in vowels:
            v += 1
        else:
            c += 1
        key = (v - c, v % m)
        answer += counts.get(key, 0)
        counts[key] = counts.get(key, 0) + 1
    return answer
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
