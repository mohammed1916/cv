export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).sort().join() !== 'discount,sentence') throw new Error('Use a JSON object with exactly the keys sentence and discount.')
  const { sentence, discount } = input
  if (typeof sentence !== 'string' || sentence.length < 1 || sentence.length > 80) throw new Error('sentence must be a string of 1 to 80 characters.')
  if (!/^[a-z0-9$]+( [a-z0-9$]+)*$/.test(sentence)) throw new Error('sentence must be words of lowercase letters, digits and $, separated by single spaces.')
  if (!Number.isInteger(discount) || discount < 0 || discount > 100) throw new Error('discount must be an integer from 0 to 100.')
  return { sentence, discount }
}

const isPrice = w => /^\$[0-9]+$/.test(w)

export function buildTrace({ sentence, discount }) {
  const words = sentence.split(' ')
  const hundred = BigInt(100)
  const out = []
  const frames = [{ phase: 'start', activeLine: L('split the sentence'), index: -1, word: '', priced: [...out], message: `Apply a ${discount}% discount to each price.` }]
  words.forEach((w, i) => {
    if (isPrice(w)) {
      // A price of P dollars becomes P times (100 minus discount) cents, so integer arithmetic is exact.
      const cents = BigInt(w.slice(1)) * BigInt(100 - discount)
      const text = `$${cents / hundred}.${String(cents % hundred).padStart(2, '0')}`
      out.push(text)
      frames.push({ phase: 'price', activeLine: L('replace the word'), index: i, word: w, priced: [...out], message: `${w} becomes ${text}.` })
    } else {
      out.push(w)
      frames.push({ phase: 'keep', activeLine: L('otherwise keep the word'), index: i, word: w, priced: [...out], message: `${w} is not a price, so it stays.` })
    }
  })
  const result = out.join(' ')
  frames.push({ phase: 'done', activeLine: L('return the sentence'), index: -1, word: '', priced: [...out], message: `Result: ${result}.` })
  return { input: { sentence, discount }, result, frames }
}

export const code = `sentence with discounted prices:
  split the sentence into words at spaces
  for each word
    if the word is a dollar sign followed only by digits then
      replace the word with its price times (100 minus discount) / 100, written with two decimals
    otherwise keep the word
  join the words with single spaces
  return the sentence`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def apply_discount(sentence, discount):
    out = []
    for word in sentence.split(' '):
        if len(word) > 1 and word[0] == '$' and word[1:].isdigit():
            cents = int(word[1:]) * (100 - discount)
            out.append('$%d.%02d' % (cents // 100, cents % 100))
        else:
            out.append(word)
    return ' '.join(out)
`
