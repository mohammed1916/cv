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

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function maxScoreWords(words, letters, score) {', 'def max_score_words(words, letters, score):'],
  ['  const available = new Array(26).fill(0)', '    available = [0] * 26'],
  ['  for (const letter of letters) available[letter.charCodeAt(0) - 97]++', '    for letter in letters: available[ord(letter) - 97] += 1'],
  ['  let best = 0', '    best = 0'],
  ['  const choose = (index, total) => {', '    def choose(index, total):'],
  ['    // best is shared with the caller', '        nonlocal best'],
  ['    if (index === words.length) { best = Math.max(best, total); return }', '        if index == len(words):'],
  ['      best = Math.max(best, total)', '            best = max(best, total)'],
  ['      return', '            return'],
  ['    }', ''],
  ['    const needed = new Array(26).fill(0)', '        needed = [0] * 26'],
  ['    for (const ch of words[index]) needed[ch.charCodeAt(0) - 97]++', '        for ch in words[index]: needed[ord(ch) - 97] += 1'],
  ['    if (needed.every((n, c) => n <= available[c])) {', '        if all(needed[c] <= available[c] for c in range(26)):'],
  ['      needed.forEach((n, c) => { available[c] -= n })', '            for c in range(26): available[c] -= needed[c]'],
  ['      const gain = needed.reduce((sum, n, c) => sum + n * score[c], 0)', '            gain = sum(needed[c] * score[c] for c in range(26))'],
  ['      choose(index + 1, total + gain)', '            choose(index + 1, total + gain)'],
  ['      needed.forEach((n, c) => { available[c] += n })', '            for c in range(26): available[c] += needed[c]'],
  ['    }', ''],
  ['    choose(index + 1, total)', '        choose(index + 1, total)'],
  ['  }', ''],
  ['  choose(0, 0)', '    choose(0, 0)'],
  ['  return best', '    return best'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(input) {
  const { words, letters, score } = input
  const available = new Array(26).fill(0)
  for (const letter of letters) available[codeOf(letter)]++
  const remaining = () => available.map((c, i) => String.fromCharCode(97 + i).repeat(c)).join('')
  const frames = [{ pythonLine: P('best = 0'), phase: 'start', activeLine: L('let best = 0'), index: -1, chosen: [], total: 0, best: 0, left: remaining(), message: 'Decide for each word in turn whether to use it.' }]
  let best = 0
  let bestChosen = []
  const chosen = []
  const choose = (index, total) => {
    if (index === words.length) {
      if (total > best) { best = total; bestChosen = [...chosen] }
      frames.push({ pythonLine: P('best = max(best, total)'), phase: 'record', activeLine: L('if (index === words.length)'), index, chosen: [...chosen], total, best, left: remaining(), message: `Every word is decided. The score is ${total}.` })
      return
    }
    const word = words[index]
    const needed = new Array(26).fill(0)
    let gain = 0
    for (const ch of word) { needed[codeOf(ch)]++; gain += score[codeOf(ch)] }
    if (needed.every((n, c) => n <= available[c])) {
      needed.forEach((n, c) => { available[c] -= n })
      chosen.push(index)
      frames.push({ pythonLine: P('choose(index + 1, total + gain)'), phase: 'take', activeLine: L('choose(index + 1, total + gain)'), index, chosen: [...chosen], total: total + gain, best, left: remaining(), message: `Use "${word}" for ${gain} points.` })
      choose(index + 1, total + gain)
      chosen.pop()
      needed.forEach((n, c) => { available[c] += n })
    }
    frames.push({ pythonLine: P('choose(index + 1, total)'), phase: 'skip', activeLine: L('choose(index + 1, total)'), index, chosen: [...chosen], total, best, left: remaining(), message: `Leave "${word}" out.` })
    choose(index + 1, total)
  }
  choose(0, 0)
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: L('return best'), index: words.length, chosen: bestChosen, total: best, best, left: '', message: `The maximum score is ${best}.` })
  return { input, result: best, frames }
}
