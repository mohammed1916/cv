export const phases = [
  { id: 'start', label: 'Start', description: 'Count the supply of every letter in the given characters.' },
  { id: 'inspect', label: 'Check letters', description: 'Compare each letter the word needs against a fresh supply.' },
  { id: 'update', label: 'Accept or reject', description: 'Add the word length when every needed letter fits; otherwise skip the word.' },
  { id: 'done', label: 'Result', description: 'The total length of accepted words is the answer.' },
]

export const code = `function countFormable(words, chars) {
  const supply = {}; for (const ch of chars) supply[ch] = (supply[ch] ?? 0) + 1; let total = 0
  for (const word of words) {
    const used = {}; let ok = true
    for (const x of word) { used[x] = (used[x] ?? 0) + 1; if (used[x] > (supply[x] ?? 0)) { ok = false; break } }
    if (ok) total += word.length
  }
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_formable(words, chars):
    supply = Counter(chars)
    total = 0
    for word in words:
        used = Counter()
        ok = True
        for x in word:
            used[x] += 1
            if used[x] > supply[x]:
                ok = False
                break
        if ok:
            total += len(word)
    return total`

// Line numbers in the JavaScript code and in the Python version of each step.
const L = { supply: 2, total: 2, loop: 3, used: 4, scan: 5, fail: 5, add: 6, ret: 8 }
const PL = { supply: 2, total: 3, loop: 4, used: 5, scan: 8, fail: 10, add: 13, ret: 14 }

const LETTER = /^[a-z]+$/
export function parseInput(text) {
  let value
  try { value = JSON.parse(text) } catch { throw new Error('Enter JSON like {"words":["ab"],"chars":"abc"}.') }
  if (!value || !Array.isArray(value.words) || typeof value.chars !== 'string') throw new Error('Provide a words array and a chars string.')
  if (value.words.length < 1 || value.words.length > 6) throw new Error('Use 1 to 6 words for the trace.')
  if (!value.words.every(w => typeof w === 'string' && w.length >= 1 && w.length <= 6 && LETTER.test(w))) throw new Error('Each word must be 1 to 6 lowercase letters.')
  if (!(value.chars.length >= 1 && value.chars.length <= 20 && LETTER.test(value.chars))) throw new Error('chars must be 1 to 20 lowercase letters.')
  return { words: value.words, chars: value.chars }
}

const counts = text => { const out = {}; for (const ch of text) out[ch] = (out[ch] || 0) + 1; return out }

export function buildTrace({ words, chars }) {
  const frames = []
  const supply = counts(chars)
  let total = 0
  const verdicts = []
  const snap = (extra = {}) => ({ words, chars, supply, wordIndex: -1, used: {}, position: -1, verdicts: [...verdicts], total, ...extra })
  frames.push({ phase: 'start', activeLine: L.supply, pythonLine: PL.supply, message: `Supply: ${Object.keys(supply).sort().map(c => `${c}×${supply[c]}`).join(', ')}. Each word gets the whole supply.`, snapshot: snap() })

  words.forEach((word, wi) => {
    const used = {}
    let failedAt = -1
    for (let p = 0; p < word.length; p++) {
      const x = word[p]
      used[x] = (used[x] || 0) + 1
      if (used[x] > (supply[x] || 0)) {
        failedAt = p
        frames.push({
          phase: 'inspect', activeLine: L.fail, pythonLine: PL.fail,
          message: `Word ${wi + 1} "${word}" needs ${used[x]} copies of ${x}, but the supply has ${supply[x] || 0}. It fails.`,
          snapshot: snap({ wordIndex: wi, used: { ...used }, position: p }),
        })
        break
      }
      frames.push({
        phase: 'inspect', activeLine: L.scan, pythonLine: PL.scan,
        message: `Word ${wi + 1} "${word}": letter ${x} is used ${used[x]} time${used[x] === 1 ? '' : 's'}, within the supply of ${supply[x]}.`,
        snapshot: snap({ wordIndex: wi, used: { ...used }, position: p }),
      })
    }
    if (failedAt === -1) {
      total += word.length
      verdicts.push({ word, ok: true })
      frames.push({
        phase: 'update', activeLine: L.add, pythonLine: PL.add,
        message: `Word ${wi + 1} "${word}" fits. Add its length ${word.length}; the total is ${total}.`,
        snapshot: snap({ wordIndex: wi, used: { ...used }, position: word.length - 1 }),
      })
    } else {
      verdicts.push({ word, ok: false })
      frames.push({
        phase: 'update', activeLine: L.add, pythonLine: PL.add,
        message: `Word ${wi + 1} "${word}" is skipped, so the total stays ${total}.`,
        snapshot: snap({ wordIndex: wi, used: { ...used }, position: failedAt }),
      })
    }
  })
  frames.push({ phase: 'done', activeLine: L.ret, pythonLine: PL.ret, message: `Accepted words add up to a total length of ${total}.`, snapshot: snap({ wordIndex: words.length - 1 }) })
  return { input: { words, chars }, result: total, frames }
}
