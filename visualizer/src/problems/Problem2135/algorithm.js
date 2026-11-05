// LeetCode 2135: Count Words Obtained After Adding a Letter.
// Each word has distinct letters, so it can be stored as a 26-bit mask. A target word is obtained from a
// start word exactly when removing one letter from the target leaves the start word's mask.
// Set bits are compared with XOR, so the test for each target letter is one lookup.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"startWords":["ant"],"targetWords":["tanx"]}.') }
  const { startWords, targetWords } = data ?? {}
  const ok = word => typeof word === 'string' && /^[a-z]{1,26}$/.test(word) && new Set(word).size === word.length
  if (!Array.isArray(startWords) || startWords.length < 1 || startWords.length > 12 || !startWords.every(ok)) {
    throw new Error('startWords: 1 to 12 words of lowercase letters, with no letter repeated inside a word.')
  }
  if (!Array.isArray(targetWords) || targetWords.length < 1 || targetWords.length > 12 || !targetWords.every(ok)) {
    throw new Error('targetWords: 1 to 12 words of lowercase letters, with no letter repeated inside a word.')
  }
  return { startWords, targetWords }
}

export const code = `function wordMask(word) {
  let mask = 0
  for (const ch of word) mask |= 1 << (ch.charCodeAt(0) - 97)
  return mask
}

function countWords(startWords, targetWords) {
  const starts = new Set(startWords.map(wordMask))
  let count = 0
  for (const target of targetWords) {
    const mask = wordMask(target)
    for (const ch of target) {
      if (starts.has(mask ^ (1 << (ch.charCodeAt(0) - 97)))) {
        count++
        break
      }
    }
  }
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: count_words
def word_mask(word):
    mask = 0
    for ch in word:
        mask |= 1 << (ord(ch) - 97)
    return mask

def count_words(startWords, targetWords):
    starts = set(word_mask(w) for w in startWords)
    count = 0
    for target in targetWords:
        mask = word_mask(target)
        for ch in target:
            if (mask ^ (1 << (ord(ch) - 97))) in starts:
                count += 1
                break
    return count
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'encode', label: 'Start masks', description: 'Each start word becomes a set of letters.' },
  { id: 'try', label: 'Remove a letter', description: 'Remove one letter from the target; does the rest match a start word?' },
  { id: 'match', label: 'Match', description: 'The target is obtained from a start word.' },
  { id: 'done', label: 'Result', description: 'How many targets are obtained.' },
]

const letters = word => [...word].sort().join('')

export function buildTrace({ startWords, targetWords }) {
  const frames = []
  const starts = new Set(startWords.map(w => letters(w)))
  const startList = [...starts]
  frames.push({ phase: 'encode', activeLine: L('const starts = new Set'), pythonLine: P('starts = set'), message: `Start words as letter sets: ${startList.join(', ')}.`, rows: targetWords.map(t => ({ target: t, removing: '–', result: '–' })), current: -1, count: 0 })
  let count = 0
  const rows = targetWords.map(t => ({ target: t, removing: '–', result: 'no' }))
  targetWords.forEach((target, i) => {
    let matched = false
    for (const ch of target) {
      const rest = letters(target.replace(ch, ''))
      rows[i].removing = ch
      frames.push({ phase: 'try', activeLine: L('for (const ch of target)'), pythonLine: P('for ch in target'), message: `Remove ${ch} from ${target}: ${rest || 'nothing'} ${starts.has(rest) ? 'is a start word' : 'is not a start word'}.`, rows: rows.map(r => ({ ...r })), current: i, count })
      if (starts.has(rest)) {
        matched = true
        count++
        rows[i].result = `yes (remove ${ch})`
        frames.push({ phase: 'match', activeLine: L('count++'), pythonLine: P('count += 1'), message: `${target} is obtained by adding ${ch}.`, rows: rows.map(r => ({ ...r })), current: i, count })
        break
      }
    }
    if (!matched) rows[i].removing = 'none works'
  })
  frames.push({ phase: 'done', activeLine: L('return count'), pythonLine: P('return count'), message: `${count} target words can be obtained.`, rows: rows.map(r => ({ ...r })), current: -1, count })
  return { input: { startWords, targetWords }, result: count, frames }
}
