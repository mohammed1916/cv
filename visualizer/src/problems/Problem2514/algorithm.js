const MOD = 1000000007n

export function parseInput(text) {
  const o = JSON.parse(text)
  if (!o || typeof o.s !== 'string') throw new Error('Use an object with a string field s.')
  const { s } = o
  if (!/^[a-z]+( [a-z]+)*$/.test(s)) throw new Error('s must be lowercase words separated by single spaces.')
  if (s.length > 40 || s.split(' ').length > 6) throw new Error('Use at most 6 words and 40 characters.')
  return { s }
}

const fact = n => {
  let r = 1n
  for (let i = 2n; i <= BigInt(n); i++) r *= i
  return r
}

export function buildTrace({ s }) {
  const words = s.split(' ')
  const factors = []
  const frames = [{ phase: 'start', activeLine: L('set answer to one'), word: -1, total: 1, message: 'Each word is rearranged on its own, and the choices multiply.' }]
  let answer = 1n
  words.forEach((word, i) => {
    const counts = {}
    for (const ch of word) counts[ch] = (counts[ch] || 0) + 1
    let ways = fact(word.length)
    for (const c of Object.values(counts)) ways /= fact(c)
    answer = (answer * ways) % MOD
    factors.push(String(ways))
    frames.push({ phase: 'word', activeLine: L('multiply answer by ways'), word: i, total: Number(answer), message: `"${word}" has ${ways} distinct arrangements.` })
  })
  const result = Number(answer)
  frames.push({ phase: 'done', activeLine: L('return answer'), word: words.length - 1, total: result, message: `Distinct anagrams: ${result}.` })
  return { input: { s }, result, frames, words, factors }
}

export const code = `count distinct strings made by rearranging the letters inside each word
  set answer to one
  for each word in the sentence
    count how many times each letter appears in the word
    set ways to the factorial of the word length
    divide ways by the factorial of each letter count
    multiply answer by ways, modulo 1000000007
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import factorial


def count_anagrams(s):
    MOD = 10 ** 9 + 7
    answer = 1
    for word in s.split(' '):
        counts = {}
        for ch in word:
            counts[ch] = counts.get(ch, 0) + 1
        ways = factorial(len(word))
        for c in counts.values():
            ways //= factorial(c)
        answer = answer * ways % MOD
    return answer
`
