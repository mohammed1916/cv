export function parseInput(text) {
  const o = JSON.parse(text)
  if (!o || typeof o.word !== 'string' || !Number.isInteger(o.m)) throw new Error('Use an object with a digit string word and an integer m.')
  if (!/^\d{1,30}$/.test(o.word)) throw new Error('word must be 1 to 30 digits.')
  if (o.m < 1 || o.m > 1000) throw new Error('m must be an integer from 1 to 1000.')
  return { word: o.word, m: o.m }
}

export function buildTrace({ word, m }) {
  const answer = []
  let remainder = 0
  const frames = [{ phase: 'start', activeLine: L('set remainder to zero'), index: -1, remainder, answer: [], message: `Track the remainder of each prefix of ${word} modulo ${m}.` }]
  for (let i = 0; i < word.length; i++) {
    remainder = (remainder * 10 + Number(word[i])) % m
    answer.push(remainder === 0 ? 1 : 0)
    frames.push({ phase: 'digit', activeLine: L('set remainder to (remainder'), index: i, remainder, answer: [...answer], message: `Prefix ${word.slice(0, i + 1)} leaves remainder ${remainder}, so the entry is ${answer[i]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the answer list'), index: word.length - 1, remainder, answer: [...answer], message: `Divisibility array: [${answer.join(', ')}].` })
  return { input: { word, m }, result: answer, frames }
}

export const code = `divisibility array of a digit string for divisor m
  set remainder to zero
  create an empty answer list
  for each digit from left to right
    set remainder to (remainder times ten plus the digit) modulo m
    append 1 if remainder is zero, otherwise append 0
  return the answer list`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def divisibility_array(word, m):
    answer = []
    remainder = 0
    for digit in word:
        remainder = (remainder * 10 + int(digit)) % m
        answer.append(1 if remainder == 0 else 0)
    return answer
`
