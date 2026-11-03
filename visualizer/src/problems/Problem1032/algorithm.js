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

const END = '#'
const newNode = () => ({ next: new Map(), end: false })

export function buildTrace({ words, letters }) {
  const root = newNode()
  const frames = []
  const stored = []
  const answers = []
  let history = ''
  const snap = (extra = {}) => ({ stored: stored.slice(), history, answers: answers.slice(), walk: '', hit: null, ...extra })

  for (const word of words) {
    const reversed = [...word].reverse().join('')
    let node = root
    for (const ch of reversed) {
      if (!node.next.has(ch)) node.next.set(ch, newNode())
      node = node.next.get(ch)
    }
    node.end = true
    stored.push(reversed)
    frames.push({ phase: 'build', activeLine: 7, message: `Store "${word}" as "${reversed}" in the reversed trie. Reading the stored form from its start follows the word's last letter first.`, snapshot: snap() })
  }

  for (const letter of letters) {
    history += letter
    frames.push({ phase: 'read', activeLine: 10, message: `Stream letter "${letter}". The history is now "${history}".`, snapshot: snap({ letter }) })
    let node = root
    let walk = ''
    let hit = false
    for (let k = history.length - 1; k >= 0; k--) {
      const ch = history[k]
      const child = node.next.get(ch)
      if (!child) {
        frames.push({ phase: 'walk', activeLine: 13, message: `No edge for "${ch}" from "${walk}". Stop walking.`, snapshot: snap({ letter, walk, hit: null }) })
        break
      }
      node = child
      walk += ch
      if (node.end) {
        hit = true
        frames.push({ phase: 'walk', activeLine: 14, message: `"${walk}" reaches the end of a stored word, so the stream ends with a dictionary word.`, snapshot: snap({ letter, walk, hit: true }) })
        break
      }
      frames.push({ phase: 'walk', activeLine: 13, message: `Follow "${ch}" to reach "${walk}". No word ends here yet, so keep walking.`, snapshot: snap({ letter, walk, hit: null }) })
    }
    answers.push(hit)
    frames.push({ phase: 'answer', activeLine: 15, message: hit ? `Answer true for this letter.` : `Answer false for this letter.`, snapshot: snap({ letter, walk, hit }) })
  }
  frames.push({ phase: 'answer', activeLine: 16, message: `All ${letters.length} answers are ready.`, snapshot: snap() })
  return { input: { words, letters }, result: answers, frames }
}

export const code = [
  'FUNCTION streamAnswers(words, letters)',
  '    root ← empty trie node',
  '    FOR EACH word IN words',
  '        node ← root',
  '        FOR EACH character ch of word, read backwards',
  '            node ← child of node for ch (create if missing)',
  '        mark node as the end of a word',
  '    history ← empty ; answers ← empty',
  '    FOR EACH letter IN letters',
  '        append letter to history',
  '        node ← root ; hit ← false',
  '        FOR k FROM newest position DOWN TO 0',
  '            node ← child of node for history[k] (stop if missing)',
  '            IF node is a word end THEN hit ← true ; stop',
  '        append hit to answers',
  '    RETURN answers',
]

export const python = `def stream_answers(words, letters):
    root = {}
    for word in words:
        node = root
        for ch in reversed(word):
            node = node.setdefault(ch, {})
        node[END] = True
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
            if END in node:
                hit = True
                break
        answers.append(hit)
    return answers`

export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 10, 10: 11, 11: 12, 12: 14, 13: 15, 14: 18, 15: 21, 16: 22 }
