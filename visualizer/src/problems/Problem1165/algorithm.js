export const phases = [
  { id: 'setup', label: 'Setup', description: 'Read the keyboard and place the finger at position 0.' },
  { id: 'map', label: 'Map keys', description: 'Record the position of every key along the single row.' },
  { id: 'walk', label: 'Walk', description: 'Move from the previous key to the next typed key and add the distance.' },
  { id: 'done', label: 'Result', description: 'Report the total finger travel.' },
]

const CODE_LINES = [
  'FUNCTION travelTime(keyboard, word)',
  '  pos <- position of each key in keyboard',
  '  current <- 0; total <- 0',
  '  FOR each letter c in word',
  '    total <- total + |pos[c] - current|',
  '    current <- pos[c]',
  '  RETURN total',
]

const PYTHON_LINES = [
  'def travelTime(keyboard, word):',
  '    pos = {ch: i for i, ch in enumerate(keyboard)}',
  '    current = 0',
  '    total = 0',
  '    for ch in word:',
  '        total += abs(pos[ch] - current)',
  '        current = pos[ch]',
  '    return total',
]

const py = text => PYTHON_LINES.findIndex(line => line.includes(text)) + 1

export const python = PYTHON_LINES.join('\n')
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
export const pythonLineMap = {
  1: py('def '), 2: py('pos = '), 3: py('current = 0'), 4: py('for ch'), 5: py('total +='), 6: py('current = pos'), 7: py('return total'),
}

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

export function buildTrace(text) {
  const { keyboard, word } = parseInput(text)
  const frames = []
  const pos = {}
  const base = { letter: '', position: -1, from: -1, letterIndex: -1, cost: 0, total: 0, positions: pos }
  const snap = (phase, activeLine, message, extra = {}) => frames.push({
    phase, activeLine, message, snapshot: { ...base, positions: { ...pos }, ...extra },
  })

  snap('setup', 1, `The keyboard is ${keyboard}. The finger starts at position 0, the first key.`)
  for (let i = 0; i < keyboard.length; i++) {
    pos[keyboard[i]] = i
    snap('map', 2, `${keyboard[i]} is at position ${i}.`, { letter: keyboard[i], position: i })
  }

  let current = 0
  let total = 0
  snap('walk', 3, 'The finger is at position 0 and the total travel is 0.', { from: 0, position: 0 })
  for (let k = 0; k < word.length; k++) {
    const letter = word[k]
    const p = pos[letter]
    const cost = Math.abs(p - current)
    const from = current
    total += cost
    snap('walk', 5, `Move from position ${from} to ${letter} at ${p}: ${cost} steps, total ${total}.`, {
      letter, position: p, from, letterIndex: k, cost, total,
    })
    current = p
    snap('walk', 6, `The finger now rests on ${letter}.`, { letter, position: p, from, letterIndex: k, cost, total })
  }

  snap('done', 7, `Report the total travel: ${total}.`, { total, position: current, letterIndex: word.length - 1, cost: 0 })
  return { input: { keyboard, word }, result: total, frames }
}
