export const DIGIT_NAMES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']

export function parseInput(text) {
  const digits = String(text).trim()
  if (!/^(0|[1-9]\d{0,8})$/.test(digits)) throw new Error('Enter a whole number from 0 to 999999999 without leading zeros.')
  return { num: digits }
}

export function buildTrace({ num }) {
  const odd = Array(26).fill(false)
  const frames = []
  const frame = fields => frames.push({ odd: [...odd], ...fields })
  frame({ pythonLine: P('odd = [False]'), phase: 'start', activeLine: L('set every letter parity to even'), digit: -1, word: '', letter: '', message: `Write the digits of ${num} as words, then track which letters appear an odd number of times.` })
  for (let p = 0; p < num.length; p++) {
    const d = Number(num[p])
    const word = DIGIT_NAMES[d]
    frame({ pythonLine: P('for digit in str(num)'), phase: 'digit', activeLine: L('for each digit of the number'), digit: p, word, letter: '', message: `Digit ${d} is written "${word}".` })
    for (const letter of word) {
      const index = letter.charCodeAt(0) - 97
      odd[index] = !odd[index]
      frame({ pythonLine: P('odd[index] = not odd[index]'), phase: 'letter', activeLine: L('flip the parity of that letter'), digit: p, word, letter, message: `${letter} is toggled; it is now ${odd[index] ? 'odd' : 'even'}.` })
    }
  }
  const count = odd.filter(Boolean).length
  frame({ pythonLine: P('return sum(odd)'), phase: 'done', activeLine: L('return the number of odd letters'), digit: -1, word: '', letter: '', message: `${count} letter${count === 1 ? ' has' : 's have'} an odd total count.` })
  return { input: { num }, result: count, frames }
}

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const code = `count letters with an odd total count in the digit words
  set every letter parity to even
  for each digit of the number from left to right
    for each letter in the English name of that digit
      flip the parity of that letter
  return the number of odd letters`.split('\n').map((text, index) => ({ line: index + 1, text: text.trimEnd() }))

export const python = `DIGIT_NAMES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]

def count_odd_letters(num):
    odd = [False] * 26
    for digit in str(num):
        for letter in DIGIT_NAMES[int(digit)]:
            index = ord(letter) - ord("a")
            odd[index] = not odd[index]
    return sum(odd)
`
