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
  const frames = [{ phase: 'start', index: -1, out: [], activeLine: 2, message: `Split the sentence into ${words.length} word(s); each is rewritten independently.` }]
  words.forEach((w, k) => {
    const i = k + 1
    const vowel = VOWELS.includes(w[0])
    frames.push({ phase: 'classify', index: k, word: w, vowel, current: w, out: [...out], activeLine: 4,
      message: vowel ? `"${w}" starts with the vowel "${w[0]}", so it stays as is.` : `"${w}" starts with the consonant "${w[0]}", so it moves to the end.` })
    let cur = w
    if (!vowel) {
      cur = w.slice(1) + w[0]
      frames.push({ phase: 'rotate', index: k, word: w, vowel, current: cur, out: [...out], activeLine: 5, message: `Move "${w[0]}" to the back: "${cur}".` })
    }
    const done = cur + 'ma' + 'a'.repeat(i)
    out.push(done)
    frames.push({ phase: 'append', index: k, word: w, vowel, current: done, out: [...out], activeLine: 6, message: `Append "ma" and ${i} letter a (the word is number ${i}): "${done}".` })
  })
  const result = out.join(' ')
  frames.push({ phase: 'done', index: words.length - 1, current: '', out: [...out], activeLine: 7, message: `Joined result: ${result}` })
  return { input: sentence, words, result, frames }
}
export const code = `def toGoatLatin(sentence):
    out = []
    for i, w in enumerate(sentence.split(), 1):
        if w[0] not in 'aeiouAEIOU':
            w = w[1:] + w[0]
        out.append(w + 'ma' + 'a' * i)
    return ' '.join(out)`.split('\n').map((text, index) => ({ line: index + 1, text }))
