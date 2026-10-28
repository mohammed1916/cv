export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.words) || !Array.isArray(input.letters) || !Array.isArray(input.score)) throw new Error('Use an object with "words", "letters" and a 26-value "score".')
  const { words, letters, score } = input
  if (words.length < 1 || words.length > 8) throw new Error('words holds 1 to 8 words.')
  if (words.some(w => typeof w !== 'string' || w.length < 1 || w.length > 8 || !/^[a-z]+$/.test(w))) throw new Error('Each word is 1 to 8 lowercase letters.')
  if (letters.length < 1 || letters.length > 20 || letters.some(c => typeof c !== 'string' || !/^[a-z]$/.test(c))) throw new Error('letters holds 1 to 20 single lowercase letters.')
  if (score.length !== 26 || score.some(v => !Number.isInteger(v) || v < 0 || v > 10)) throw new Error('score holds 26 integers from 0 to 10, one per letter a to z.')
  return { words, letters, score }
}

const codeOf = ch => ch.charCodeAt(0) - 97

export function buildTrace(input) {
  const { words, letters, score } = input
  const available = new Array(26).fill(0)
  for (const letter of letters) available[codeOf(letter)]++
  const remaining = () => available.map((c, i) => String.fromCharCode(97 + i).repeat(c)).join('')
  const frames = [{ phase: 'start', activeLine: L('set best to zero'), index: -1, chosen: [], total: 0, best: 0, left: remaining(), message: 'Decide for each word in turn whether to use it.' }]
  let best = 0
  let bestChosen = []
  const chosen = []
  const choose = (index, total) => {
    if (index === words.length) {
      if (total > best) { best = total; bestChosen = [...chosen] }
      frames.push({ phase: 'record', activeLine: L('keep the score if it beats best'), index, chosen: [...chosen], total, best, left: remaining(), message: `Every word is decided. The score is ${total}.` })
      return
    }
    const word = words[index]
    const needed = new Array(26).fill(0)
    let gain = 0
    for (const ch of word) { needed[codeOf(ch)]++; gain += score[codeOf(ch)] }
    if (needed.every((n, c) => n <= available[c])) {
      needed.forEach((n, c) => { available[c] -= n })
      chosen.push(index)
      frames.push({ phase: 'take', activeLine: L('use those letters'), index, chosen: [...chosen], total: total + gain, best, left: remaining(), message: `Use "${word}" for ${gain} points.` })
      choose(index + 1, total + gain)
      chosen.pop()
      needed.forEach((n, c) => { available[c] += n })
    }
    frames.push({ phase: 'skip', activeLine: L('leave this word out'), index, chosen: [...chosen], total, best, left: remaining(), message: `Leave "${word}" out.` })
    choose(index + 1, total)
  }
  choose(0, 0)
  frames.push({ phase: 'done', activeLine: L('return best'), index: words.length, chosen: bestChosen, total: best, best, left: '', message: `The maximum score is ${best}.` })
  return { input, result: best, frames }
}

export const code = `largest score from a set of words the letters can form
  set best to zero
  call choose with word zero and score zero
  return best
choose(index, total)
  if every word has been decided then
    keep the score if it beats best and stop
  if the letters are enough for this word then
    use those letters, add the word score, choose the next word, then give the letters back
  leave this word out and choose the next word`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_score_words(words, letters, score):
    available = [0] * 26
    for letter in letters:
        available[ord(letter) - 97] += 1
    best = 0

    def choose(index, total):
        nonlocal best
        if index == len(words):
            best = max(best, total)
            return
        needed = [0] * 26
        for ch in words[index]:
            needed[ord(ch) - 97] += 1
        if all(needed[c] <= available[c] for c in range(26)):
            for c in range(26):
                available[c] -= needed[c]
            gain = sum(needed[c] * score[c] for c in range(26))
            choose(index + 1, total + gain)
            for c in range(26):
                available[c] += needed[c]
        choose(index + 1, total)

    choose(0, 0)
    return best
`
