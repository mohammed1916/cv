export const phases = [
  { id: 'setup', label: 'Setup', description: 'Read the keyboard and place the finger at position 0.' },
  { id: 'map', label: 'Map keys', description: 'Record the position of every key along the single row.' },
  { id: 'walk', label: 'Walk', description: 'Move from the previous key to the next typed key and add the distance.' },
  { id: 'done', label: 'Result', description: 'Report the total finger travel.' },
]

const WORD_LIMIT = 200

export function parseInput(text) {
  let obj
  try {
    obj = typeof text === 'string' ? JSON.parse(text) : text
  } catch {
    throw new Error('Input must be JSON such as {"keyboard":"...","word":"..."}')
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Input must be a JSON object with keyboard and word keys')
  const { keyboard, word } = obj
  if (typeof keyboard !== 'string' || !/^[a-z]{26}$/.test(keyboard) || new Set(keyboard).size !== 26) {
    throw new Error('keyboard must be a string of 26 different lowercase letters')
  }
  if (typeof word !== 'string' || word.length < 1 || word.length > WORD_LIMIT || !/^[a-z]+$/.test(word)) {
    throw new Error(`word must be 1-${WORD_LIMIT} lowercase letters for this visualization`)
  }
  return { keyboard, word }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function travelTime(keyboard, word) {', 'def travel_time(keyboard, word):'],
  ['  const pos = {}', '    pos = {}'],
  ['  for (let i = 0; i < keyboard.length; i++) pos[keyboard[i]] = i', '    for i, ch in enumerate(keyboard): pos[ch] = i'],
  ['  let current = 0, total = 0', '    current = total = 0'],
  ['  for (const c of word) { total += Math.abs(pos[c] - current); current = pos[c] }', '    for ch in word: total += abs(pos[ch] - current); current = pos[ch]'],
  ['  return total', '    return total'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
export const pythonLineMap = Object.fromEntries(code.map(({ line }) => [line, line]))

export function buildTrace(text) {
  const { keyboard, word } = parseInput(text)
  const frames = []
  const pos = {}
  const base = { letter: '', position: -1, from: -1, letterIndex: -1, cost: 0, total: 0, positions: pos }
  const snap = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, snapshot: { ...base, positions: { ...pos }, ...extra },
  })

  snap('setup', L('const pos = {}'), P('pos = {}'), `The keyboard is ${keyboard}. The finger starts at position 0, the first key.`)
  for (let i = 0; i < keyboard.length; i++) {
    pos[keyboard[i]] = i
    snap('map', L('pos[keyboard[i]] = i'), P('for i, ch in enumerate'), `${keyboard[i]} is at position ${i}.`, { letter: keyboard[i], position: i })
  }

  let current = 0
  let total = 0
  snap('walk', L('let current = 0'), P('current = total'), 'The finger is at position 0 and the total travel is 0.', { from: 0, position: 0 })
  for (let k = 0; k < word.length; k++) {
    const letter = word[k]
    const p = pos[letter]
    const cost = Math.abs(p - current)
    const from = current
    total += cost
    snap('walk', L('total += Math.abs'), P('total += abs'), `Move from position ${from} to ${letter} at ${p}: ${cost} steps, total ${total}.`, {
      letter, position: p, from, letterIndex: k, cost, total,
    })
    current = p
    snap('walk', L('current = pos[c]'), P('current = pos[ch]'), `The finger now rests on ${letter}.`, { letter, position: p, from, letterIndex: k, cost, total })
  }

  snap('done', L('return total'), P('return total'), `Report the total travel: ${total}.`, { total, position: current, letterIndex: word.length - 1, cost: 0 })
  return { input: { keyboard, word }, result: total, frames }
}
