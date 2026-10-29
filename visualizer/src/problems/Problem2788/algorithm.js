export const code = [
  { line: 1, text: "result = empty list" },
  { line: 2, text: "for each word in words" },
  { line: 3, text: "for each part of word split by separator" },
  { line: 4, text: "if part is not empty" },
  { line: 5, text: "append part to result" },
  { line: 6, text: "return result" },
]

export const python = `def splitWordsBySeparator(words, separator):
    result = []
    for word in words:
        for part in word.split(separator):
            if part != "":
                result.append(part)
    return result`

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.words) || typeof data.separator !== 'string') throw new Error('Use an object with a words array and a one-character separator, for example {"words":["one.two"],"separator":"."}.')
  if (data.words.length < 1 || data.words.length > 20) throw new Error('words must have 1 to 20 strings for this visualization.')
  if (data.words.some(w => typeof w !== 'string' || w.length > 30)) throw new Error('each word must be a string of at most 30 characters.')
  if (data.separator.length !== 1) throw new Error('separator must be exactly one character.')
  return { words: [...data.words], separator: data.separator }
}

export function buildTrace({ words, separator }) {
  const frames = []
  const result = []
  frames.push({ phase: 'setup', activeLine: 1, pythonLine: 2, word: -1, part: null, result: [], message: 'Start with an empty result list.' })
  for (let w = 0; w < words.length; w++) {
    frames.push({ phase: 'word', activeLine: 2, pythonLine: 3, word: w, part: null, result: [...result], message: `Take word ${w}: "${words[w]}".` })
    for (const part of words[w].split(separator)) {
      frames.push({ phase: 'part', activeLine: 3, pythonLine: 4, word: w, part, result: [...result], message: `Piece "${part}" after splitting.` })
      if (part === '') {
        frames.push({ phase: 'part', activeLine: 4, pythonLine: 5, word: w, part, result: [...result], message: 'The piece is empty, so skip it.' })
        continue
      }
      result.push(part)
      frames.push({ phase: 'keep', activeLine: 5, pythonLine: 6, word: w, part, result: [...result], message: `Keep "${part}".` })
    }
  }
  frames.push({ phase: 'done', activeLine: 6, pythonLine: 7, word: -1, part: null, result: [...result], message: `Return ${result.length} piece${result.length === 1 ? '' : 's'}.` })
  return { input: { words, separator }, result, frames }
}
