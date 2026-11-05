export const phases = [
  { id: 'build', label: 'Store words', description: 'Insert each word backwards into a trie, so a word ending is found by reading the newest letters first.' },
  { id: 'read', label: 'New letter', description: 'Append the new letter to the history of everything streamed so far.' },
  { id: 'walk', label: 'Walk back', description: 'Follow the newest letter, then the one before it, down the reversed trie until a word ends or no edge exists.' },
  { id: 'answer', label: 'Answer', description: 'Report whether a stored word ended at the current position of the walk.' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.words) || typeof data.letters !== 'string') throw new Error('Enter {"words": [...], "letters": "..."}.')
  if (data.words.length < 1 || data.words.length > 20) throw new Error('Use 1–20 words.')
  if (data.words.some(w => typeof w !== 'string' || !/^[a-z]{1,8}$/.test(w))) throw new Error('Each word must be 1–8 lowercase letters.')
  if (!/^[a-z]{1,40}$/.test(data.letters)) throw new Error('Letters must be 1–40 lowercase letters.')
  return { words: data.words, letters: data.letters }
}

// Each trie node is an object: letter keys lead to children, and `end` marks a stored word.
const toTree = (node, label) => ({
  label, end: Boolean(node.end),
  kids: Object.keys(node).filter(k => k !== 'end').sort().map(k => toTree(node[k], k)),
})

export function buildTrace({ words, letters }) {
  const root = {}
  const frames = []
  const stored = []
  const answers = []
  let history = ''
  const snap = (extra = {}) => ({ stored: stored.slice(), history, answers: answers.slice(), walk: '', hit: null, tree: toTree(root, 'root'), ...extra })
  const PY = s => python.split('\n').findIndex(l => l.includes(s)) + 1
  const CL = s => code.findIndex(c => c.text.includes(s)) + 1

  for (const word of words) {
    const reversed = [...word].reverse().join('')
    let node = root
    for (const ch of reversed) {
      node[ch] ??= {}
      node = node[ch]
    }
    node.end = true
    stored.push(reversed)
    frames.push({ phase: 'build', activeLine: CL('node[ch] ??= {}'), pythonLine: PY('node = node.setdefault'), message: `Store "${word}" as "${reversed}" in the reversed trie. Reading the stored form from its start follows the word's last letter first.`, snapshot: snap() })
  }

  for (const letter of letters) {
    history += letter
    frames.push({ phase: 'read', activeLine: CL('history.push(letter)'), pythonLine: PY('history.append(letter)'), message: `Stream letter "${letter}". The history is now "${history}".`, snapshot: snap({ letter }) })
    let node = root
    let walk = ''
    let hit = false
    for (let k = history.length - 1; k >= 0; k--) {
      const ch = history[k]
      const child = node[ch]
      if (!child) {
        frames.push({ phase: 'walk', activeLine: CL('if (!node) break'), pythonLine: PY('if node is None'), message: `No edge for "${ch}" from "${walk}". Stop walking.`, snapshot: snap({ letter, walk, hit: null }) })
        break
      }
      node = child
      walk += ch
      if (node.end) {
        hit = true
        frames.push({ phase: 'walk', activeLine: CL('if (node.end) {'), pythonLine: PY('if "#" in node'), message: `"${walk}" reaches the end of a stored word, so the stream ends with a dictionary word.`, snapshot: snap({ letter, walk, hit: true }) })
        break
      }
      frames.push({ phase: 'walk', activeLine: CL('if (node.end) {'), pythonLine: PY('if "#" in node'), message: `Follow "${ch}" to reach "${walk}". No word ends here yet, so keep walking.`, snapshot: snap({ letter, walk, hit: null }) })
    }
    answers.push(hit)
    frames.push({ phase: 'answer', activeLine: CL('answers.push(hit)'), pythonLine: PY('answers.append(hit)'), message: hit ? 'Answer true for this letter.' : 'Answer false for this letter.', snapshot: snap({ letter, walk, hit }) })
  }
  frames.push({ phase: 'answer', activeLine: CL('return answers'), pythonLine: PY('return answers'), message: `All ${letters.length} answers are ready.`, snapshot: snap() })
  return { input: { words, letters }, result: answers, frames }
}

export const code = `function streamAnswers(words, letters) {
  const root = {}
  for (const word of words) {
    let node = root
    for (const ch of [...word].reverse()) {
      node[ch] ??= {}
      node = node[ch]
    }
    node.end = true
  }
  const history = []
  const answers = []
  for (const letter of letters) {
    history.push(letter)
    let node = root
    let hit = false
    for (let k = history.length - 1; k >= 0; k--) {
      node = node[history[k]]
      if (!node) break
      if (node.end) {
        hit = true
        break
      }
    }
    answers.push(hit)
  }
  return answers
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def stream_answers(words, letters):
    root = {}
    for word in words:
        node = root
        for ch in reversed(word):
            node = node.setdefault(ch, {})
        node["#"] = True
    history = []
    answers = []
    for letter in letters:
        history.append(letter)
        node = root
        hit = False
        for ch in reversed(history):
            node = node.get(ch)
            if node is None:
                break
            if "#" in node:
                hit = True
                break
        answers.append(hit)
    return answers`

export const pythonLineMap = {}
