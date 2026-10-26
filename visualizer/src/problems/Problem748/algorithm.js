export const code = `def shortestCompletingWord(licensePlate, words):
    need = Counter(c.lower() for c in licensePlate if c.isalpha())
    best = None
    for word in words:
        have = Counter(word)
        if all(have[c] >= k for c, k in need.items()):
            if best is None or len(word) < len(best):
                best = word
    return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function parseInput(text) {
  const v = JSON.parse(text)
  if (!v || typeof v.licensePlate !== 'string' || !Array.isArray(v.words)) throw new Error('Enter JSON like {"licensePlate": "1s3 PSt", "words": ["step", "steps"]}.')
  if (v.licensePlate.length < 1 || v.licensePlate.length > 7 || !/^[0-9a-zA-Z ]+$/.test(v.licensePlate) || !/[a-zA-Z]/.test(v.licensePlate)) throw new Error('licensePlate must have 1-7 characters (digits, letters, spaces) and at least one letter.')
  if (v.words.length < 1 || v.words.length > 40 || v.words.some(w => typeof w !== 'string' || !/^[a-z]{1,15}$/.test(w))) throw new Error('words must be 1-40 lowercase words of 1-15 letters (visualization cap of 40 words).')
  return { licensePlate: v.licensePlate, words: v.words }
}

export function buildTrace({ licensePlate, words }) {
  const need = {}
  for (const c of licensePlate) if (/[a-zA-Z]/.test(c)) need[c.toLowerCase()] = (need[c.toLowerCase()] || 0) + 1
  const needList = Object.entries(need).sort()
  const frames = [{ phase: 'start', activeLine: L('need ='), index: -1, best: -1, need: needList, missing: [], message: `Only letters of the plate matter, case ignored: ${needList.map(([c, k]) => `${c}x${k}`).join(', ')}. Digits and spaces are skipped.` }]
  let best = -1
  words.forEach((word, index) => {
    const have = {}
    for (const c of word) have[c] = (have[c] || 0) + 1
    frames.push({ phase: 'count', activeLine: L('have ='), index, best, need: needList, missing: [], message: `Count the letters of "${word}".` })
    const missing = needList.filter(([c, k]) => (have[c] || 0) < k).map(([c, k]) => `${c}: have ${have[c] || 0}, need ${k}`)
    const complete = missing.length === 0
    frames.push({ phase: 'check', activeLine: L('all('), index, best, need: needList, missing, complete,
      message: complete ? `"${word}" has every needed letter often enough: it is a completing word.` : `"${word}" is not completing (${missing.join('; ')}).` })
    if (complete) {
      const better = best < 0 || word.length < words[best].length
      if (better) best = index
      frames.push({ phase: 'best', activeLine: L('best = word'), index, best, need: needList, missing: [], complete,
        message: better ? `"${word}" (length ${word.length}) is shorter than the current best, so it becomes the best.` : `"${word}" is not strictly shorter than "${words[best]}", so the earlier word stays (ties go to the first).` })
    }
  })
  frames.push({ phase: 'done', activeLine: L('return best'), index: words.length - 1, best, need: needList, missing: [], message: `Answer: "${words[best]}". The problem guarantees a completing word exists.` })
  return { input: { licensePlate, words }, result: words[best], frames }
}
