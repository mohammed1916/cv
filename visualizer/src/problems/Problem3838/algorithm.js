export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with words and weights.')
  const { words, weights } = input
  if (!Array.isArray(words) || words.length < 1 || words.length > 10) throw new Error('words has 1 to 10 entries.')
  if (!words.every(w => typeof w === 'string' && /^[a-z]{1,10}$/.test(w))) throw new Error('Each word has 1 to 10 lowercase letters.')
  if (!Array.isArray(weights) || weights.length !== 26) throw new Error('weights has exactly 26 integers, one per letter a to z.')
  if (!weights.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each weight is an integer from 1 to 100.')
  return { words, weights }
}

// Every frame carries the state the visual needs: the active letter weight, the running total,
// the modulo residue, the reverse-alphabet letter and a snapshot of the output built so far.
export function buildTrace({ words, weights }) {
  const frames = []
  const out = []
  let total = 0
  let value = 0
  let mapped = ''
  const snapshot = () => out.join('')
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('start with an empty result'), word: -1, letter: -1, total: 0, weight: 0, value: undefined, mapped: '', output: '', message: 'Start with an empty result string.' })
  for (let w = 0; w < words.length; w++) {
    const word = words[w]
    total = 0
    frames.push({ pythonLine: 3, phase: 'word', activeLine: L('for each word'), word: w, letter: -1, total, weight: 0, value: undefined, mapped: '', output: snapshot(), message: `Word ${w + 1} is "${word}". Reset total to 0.` })
    for (let c = 0; c < word.length; c++) {
      const weight = weights[word.charCodeAt(c) - 97]
      total += weight
      frames.push({ pythonLine: 6, phase: 'sum', activeLine: L('add the weight'), word: w, letter: c, total, weight, value: undefined, mapped: '', output: snapshot(), message: `Add the weight ${weight} of ${word[c]} to reach ${total}.` })
    }
    value = total % 26
    frames.push({ pythonLine: 7, phase: 'mod', activeLine: L('take the total modulo 26'), word: w, letter: -1, total, weight: 0, value, mapped: '', output: snapshot(), message: `${total} mod 26 = ${value}.` })
    mapped = String.fromCharCode(122 - value)
    out.push(mapped)
    frames.push({ pythonLine: 8, phase: 'emit', activeLine: L('append the letter at position 122 minus value'), word: w, letter: -1, total, weight: 0, value, mapped, output: snapshot(), message: `Reverse alphabet: 122 - ${value} = ${122 - value}, which is ${mapped}. Append it.` })
  }
  const result = out.join('')
  frames.push({ pythonLine: 9, phase: 'done', activeLine: L('return the result'), word: -1, letter: -1, total, weight: 0, value, mapped, output: result, message: `The mapped string is "${result}".` })
  return { input: { words, weights }, result, frames }
}

export const code = `weighted word mapping
  start with an empty result
  for each word in order
    set total to 0
    for each letter in the word
      add the weight of that letter to total
    take the total modulo 26 as value
    append the letter at position 122 minus value to the result
  return the result`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Throws when a pseudocode phrase is missing, so a wrong mapping fails in tests instead of silently using line 0.
function L(phrase) {
  const index = code.findIndex(c => c.text.includes(phrase))
  if (index < 0) throw new Error(`Missing pseudocode line: "${phrase}"`)
  return index + 1
}

export const python = `def weighted_word_mapping(words, weights):
    result = []
    for word in words:
        total = 0
        for ch in word:
            total += weights[ord(ch) - ord('a')]
        value = total % 26
        result.append(chr(ord('z') - value))
    return ''.join(result)
`
