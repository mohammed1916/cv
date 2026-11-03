// Independently written teaching model. The sample words are invented for this visualizer.
export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with no words chosen and no letters used.' },
  { id: 'inspect', label: 'Decide', description: 'For each word, test whether taking it keeps every letter unique.' },
  { id: 'update', label: 'Record', description: 'A complete choice that beats the best total is recorded.' },
  { id: 'done', label: 'Result', description: 'Report the longest total length found.' },
]

export const inputLabel = 'JSON array of 1 to 10 lowercase words'
export const complexity = 'O(2^n * L) time for n words of length up to L, because each word is taken or skipped. The visualizer caps the list at 10 words.'
export const examples = [
  { label: 'Pairs', input: '["ab","cd","ea"]' },
  { label: 'Clash', input: '["ax","by","cz","aa"]' },
  { label: 'Repeats', input: '["aa","bb"]' },
]

export const code = `function maxUniqueLength(words):
  best = 0
  function explore(i, used, length):
    if i == count(words):
      best = max(best, length)
      return
    explore(i + 1, used, length)          # skip words[i]
    letters = set of words[i]
    if words[i] repeats or letters meets used: return
    explore(i + 1, used union letters, length + len(words[i]))   # take words[i]
  explore(0, empty, 0)
  return best`

export const python = `def max_unique_length(words):
    best = 0
    def explore(i, used, length):
        nonlocal best
        if i == len(words):
            best = max(best, length)
            return
        explore(i + 1, used, length)              # skip this word
        letters = set(words[i])
        if len(letters) < len(words[i]) or letters & used:
            return                                # word repeats or clashes
        explore(i + 1, used | letters, length + len(words[i]))  # take it
    explore(0, set(), 0)
    return best`

const at = (source, key) => {
  const index = source.split('\n').findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing solution line: ${key}`)
  return index + 1
}
const CODE_LINE = key => at(code, key)
const PY_LINE = key => at(python, key)

export function parseInput(text) {
  let words
  try { words = JSON.parse(text) } catch { throw new Error('Enter a JSON array of words.') }
  if (!Array.isArray(words) || words.length < 1 || words.length > 10) throw new Error('Use a JSON array of 1 to 10 words.')
  for (const word of words) {
    if (typeof word !== 'string' || !/^[a-z]{1,26}$/.test(word)) throw new Error('Each word must be 1 to 26 lowercase letters.')
  }
  return words
}

export function buildTrace(words) {
  const frames = []
  let best = 0
  let bestChoice = []
  const push = (phase, key, pyKey, message, state) => frames.push({
    phase, activeLine: CODE_LINE(key), pythonLine: PY_LINE(pyKey), message, words, best, bestChoice: [...bestChoice], ...state,
  })

  push('start', 'best = 0', 'best = 0', `Start with no words chosen. There are ${words.length} words to decide one by one.`, { index: -1, chosen: [], used: '', length: 0, verdict: null })

  const explore = (i, used, chosen, length) => {
    if (i === words.length) {
      if (length > best) {
        best = length
        bestChoice = [...chosen]
        push('update', 'best = max', 'best = max(best, length)', `Complete choice ${chosen.length ? chosen.map(j => words[j]).join(' + ') : '(nothing)'} has length ${length}. New best.`, { index: i, chosen: [...chosen], used: [...used].sort().join(''), length, verdict: 'leaf' })
      } else {
        push('inspect', 'if i == count', 'if i == len(words)', `Complete choice ${chosen.length ? chosen.map(j => words[j]).join(' + ') : '(nothing)'} has length ${length}, which does not beat ${best}.`, { index: i, chosen: [...chosen], used: [...used].sort().join(''), length, verdict: 'leaf' })
      }
      return
    }
    explore(i + 1, used, chosen, length)
    push('inspect', 'skip words[i]', 'skip this word', `Skip word ${i} (${words[i]}). The letters used stay as they are: ${[...used].sort().join('') || 'none'}.`, { index: i, chosen: [...chosen], used: [...used].sort().join(''), length, verdict: 'skip' })

    const word = words[i]
    const letters = new Set(word)
    const repeats = letters.size < word.length
    const clashes = [...letters].some(c => used.has(c))
    push('inspect', 'if words[i] repeats', 'if len(letters)', `Word ${word}: ${repeats ? 'it repeats a letter inside itself' : clashes ? 'it shares a letter with the chosen letters' : 'it is internally unique and disjoint from the chosen letters'}, so taking it is ${repeats || clashes ? 'illegal' : 'legal'}.`, { index: i, chosen: [...chosen], used: [...used].sort().join(''), length, verdict: repeats || clashes ? 'blocked' : 'free' })
    if (repeats || clashes) return
    const nextUsed = new Set([...used, ...letters])
    explore(i + 1, nextUsed, [...chosen, i], length + word.length)
  }

  explore(0, new Set(), [], 0)
  push('done', 'return best', 'return best', `The longest concatenation with unique letters has length ${best}.`, { index: words.length, chosen: [...bestChoice], used: bestChoice.map(j => words[j]).join('').split('').sort().join(''), length: best, verdict: 'result' })
  return { input: words, result: best, frames }
}
