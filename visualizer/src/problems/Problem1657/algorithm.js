export const phases = [
  { id: 'start', label: 'Start', description: 'Read both words. Two moves are allowed: swap any two positions, or exchange every copy of two letters that both appear.' },
  { id: 'tally', label: 'Tally letters', description: 'Count how often each letter occurs in each word.' },
  { id: 'letters', label: 'Compare letter sets', description: 'The words must use exactly the same distinct letters, because neither move introduces a new letter.' },
  { id: 'frequencies', label: 'Compare frequencies', description: 'Sorted letter counts must match, so the counts can be redistributed among letters but not changed.' },
  { id: 'done', label: 'Decide', description: 'Return true only when both checks pass.' },
]

const codeText = `close strings (word1, word2):
  tally the letters of word1 and word2
  if the sets of distinct letters differ:
    return false
  if the sorted tally values differ:
    return false
  return true`

export const code = codeText.split('\n').map((text, index) => ({ line: index + 1, text }))

const pythonText = `from collections import Counter

def close_strings(word1, word2):
    count1 = Counter(word1)
    count2 = Counter(word2)
    if set(count1) != set(count2):
        return False
    return sorted(count1.values()) == sorted(count2.values())
`

export const python = pythonText
const L = s => codeText.split('\n').findIndex(line => line.includes(s)) + 1
const P = s => pythonText.split('\n').findIndex(line => line.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"word1": "abc", "word2": "bca"}.')
  const { word1, word2 } = input
  const valid = word => typeof word === 'string' && word.length >= 1 && word.length <= 30 && /^[a-z]+$/.test(word)
  if (!valid(word1)) throw new Error('word1 is 1 to 30 lowercase letters.')
  if (!valid(word2)) throw new Error('word2 is 1 to 30 lowercase letters.')
  return { word1, word2 }
}

export function buildTrace({ word1, word2 }) {
  const tally = word => {
    const counts = {}
    for (const letter of word) counts[letter] = (counts[letter] || 0) + 1
    return counts
  }
  const c1 = tally(word1)
  const c2 = tally(word2)
  const letters1 = Object.keys(c1).sort()
  const letters2 = Object.keys(c2).sort()
  const freq1 = Object.values(c1).sort((a, b) => a - b)
  const freq2 = Object.values(c2).sort((a, b) => a - b)
  const sameLetters = letters1.join('') === letters2.join('')
  const sameFreq = freq1.join(',') === freq2.join(',')
  const union = [...new Set([...letters1, ...letters2])].sort()
  const table = union.map(letter => ({ letter, in1: c1[letter] || 0, in2: c2[letter] || 0 }))
  const snap = extra => ({ table: null, sameLetters: null, sameFreq: null, freq1: null, freq2: null, ...extra })

  const frames = [{
    phase: 'start', activeLine: L('close strings'), pythonLine: P('def close_strings'),
    snapshot: snap({}),
    message: `Compare "${word1}" and "${word2}". The answer depends on the letter set and on the sorted letter counts.`,
  }, {
    phase: 'tally', activeLine: L('tally the letters'), pythonLine: P('count1 = Counter'),
    snapshot: snap({ table }),
    message: `word1 uses ${letters1.length} distinct letters and word2 uses ${letters2.length}.`,
  }]

  if (!sameLetters) {
    frames.push({
      phase: 'letters', activeLine: L('if the sets'), pythonLine: P('if set(count1)'),
      snapshot: snap({ table, sameLetters: false }),
      message: `The letter sets differ, so no sequence of moves can connect these words.`,
    })
    frames.push({
      phase: 'done', activeLine: L('return false'), pythonLine: P('return False'),
      snapshot: snap({ table, sameLetters: false }),
      message: 'Return false.',
    })
    return { input: { word1, word2 }, result: false, frames }
  }

  frames.push({
    phase: 'letters', activeLine: L('if the sets'), pythonLine: P('if set(count1)'),
    snapshot: snap({ table, sameLetters: true }),
    message: 'Both words use the same distinct letters, so the letter check passes.',
  })
  frames.push({
    phase: 'frequencies', activeLine: L('if the sorted'), pythonLine: P('return sorted'),
    snapshot: snap({ table, sameLetters: true, freq1, freq2, sameFreq }),
    message: sameFreq
      ? `Sorted counts are [${freq1.join(', ')}] in both words, so the frequency check passes.`
      : `Sorted counts [${freq1.join(', ')}] and [${freq2.join(', ')}] differ, so the answer is false.`,
  })
  frames.push({
    phase: 'done', activeLine: L(sameFreq ? 'return true' : 'return false'), pythonLine: P('return sorted'),
    snapshot: snap({ table, sameLetters: true, freq1, freq2, sameFreq }),
    message: sameFreq ? 'Return true.' : 'Return false.',
  })
  return { input: { word1, word2 }, result: sameFreq, frames }
}
