export const phases = [
  { id: 'start', label: 'Start', description: 'Split the text into words and start an empty result list.' },
  { id: 'scan', label: 'Scan triple', description: 'Look at three consecutive words and test the first two against the phrase.' },
  { id: 'collect', label: 'Collect word', description: 'The phrase matched, so record the word that follows it.' },
  { id: 'done', label: 'Complete', description: 'Return every collected word in text order.' },
]

export const code = `following words (words, first, second):
  collected = []
  for i from 0 to len(words) - 3:
    if words[i] == first and words[i + 1] == second:
      collected.append(words[i + 2])
  return collected`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def following_words(words, first, second):
    collected = []
    for i in range(len(words) - 2):
        if words[i] == first and words[i + 1] == second:
            collected.append(words[i + 2])
    return collected
`

const codeLine = key => code.findIndex(line => line.text.includes(key)) + 1
const pythonLine = key => python.split('\n').findIndex(line => line.includes(key)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"text": "red blue red", "first": "red", "second": "blue"}.')
  const { first, second } = input
  const words = typeof input.text === 'string' ? input.text.split(' ') : null
  if (!words || words.length < 1 || words.length > 30 || !words.every(w => /^[a-z]+$/.test(w))) throw new Error('text must be 1 to 30 lowercase words separated by single spaces.')
  if (typeof first !== 'string' || !/^[a-z]+$/.test(first) || typeof second !== 'string' || !/^[a-z]+$/.test(second)) throw new Error('first and second must be lowercase words.')
  return { words, first, second }
}

export function buildTrace({ words, first, second }) {
  const frames = []
  const collected = []
  const push = (phase, key, message, extra = {}, pyKey = key) => frames.push({
    phase,
    activeLine: codeLine(key),
    pythonLine: pythonLine(pyKey),
    message,
    state: { words, first, second, index: null, window: [], collected: [...collected], ...extra },
  })

  push('start', 'collected = []', 'Start with an empty result and the full word list.', {}, 'collected = []')
  for (let i = 0; i + 2 < words.length; i++) {
    const window = words.slice(i, i + 3)
    const matched = window[0] === first && window[1] === second
    push('scan', 'if words[i] == first', `Window ${i}: "${window.join(' ')}". ${matched ? 'The phrase matches.' : 'The phrase does not match.'}`, { index: i, window })
    if (matched) {
      collected.push(window[2])
      push('collect', 'collected.append', `Record "${window[2]}", the word after the matched phrase.`, { index: i, window })
    }
  }
  push('done', 'return collected', collected.length ? `Result: ${collected.join(', ')}.` : 'No phrase match, so the result is empty.')
  return { input: { words, first, second }, result: [...collected], frames }
}
