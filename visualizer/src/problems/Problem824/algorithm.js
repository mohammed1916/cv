export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || !s.length || s.length > 150) throw new Error('Enter a JSON string of 1-150 characters (visualization cap).')
  if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(s)) throw new Error('Use words of English letters separated by single spaces, with no leading or trailing space.')
  return s
}
const VOWELS = 'aeiouAEIOU'
export function buildTrace(sentence) {
  const words = sentence.split(' ')
  const out = []
  const frames = [{ phase: 'start', index: -1, out: [], activeLine: L('split sentence'), message: `Split the sentence into ${words.length} word(s); each is rewritten independently.` }]
  words.forEach((w, k) => {
    const i = k + 1
    const vowel = VOWELS.includes(w[0])
    frames.push({ phase: 'classify', index: k, word: w, vowel, current: w, out: [...out], activeLine: L('if the first letter'),
      message: vowel ? `"${w}" starts with the vowel "${w[0]}", so it stays as is.` : `"${w}" starts with the consonant "${w[0]}", so it moves to the end.` })
    let cur = w
    if (!vowel) {
      cur = w.slice(1) + w[0]
      frames.push({ phase: 'rotate', index: k, word: w, vowel, current: cur, out: [...out], activeLine: L('otherwise, move'), message: `Move "${w[0]}" to the back: "${cur}".` })
    }
    const done = cur + 'ma' + 'a'.repeat(i)
    out.push(done)
    frames.push({ phase: 'append', index: k, word: w, vowel, current: done, out: [...out], activeLine: L('append w +'), message: `Append "ma" and ${i} letter a (the word is number ${i}): "${done}".` })
  })
  const result = out.join(' ')
  frames.push({ phase: 'done', index: words.length - 1, current: '', out: [...out], activeLine: L('return the words'), message: `Joined result: ${result}` })
  return { input: sentence, words, result, frames }
}
export const code = `split sentence into its words, and set out to an empty list
for each word w, numbered i from 1
  if the first letter of w is a vowel, leave w unchanged
  otherwise, move the first letter of w to the end of w
  append w + "ma" + i letters "a" to out
return the words in out joined by single spaces`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def to_goat_latin(sentence):
    out = []
    for i, w in enumerate(sentence.split(), 1):
        if w[0] not in 'aeiouAEIOU':
            w = w[1:] + w[0]
        out.append(w + 'ma' + 'a' * i)
    return ' '.join(out)
`
