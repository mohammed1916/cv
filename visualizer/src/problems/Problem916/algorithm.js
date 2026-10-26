export function parseInput(text) {
  const v = JSON.parse(text)
  if (!v || typeof v !== 'object' || !Array.isArray(v.words1) || !Array.isArray(v.words2)) throw new Error('Enter {"words1": ["amazon","apple"], "words2": ["e","o"]}.')
  for (const [name, list] of [['words1', v.words1], ['words2', v.words2]]) {
    if (!list.length || list.length > 30 || list.some(w => typeof w !== 'string' || !/^[a-z]{1,10}$/.test(w))) throw new Error(`${name} must hold 1-30 lowercase words of 1-10 letters (capped for visualization).`)
  }
  return { words1: [...v.words1], words2: [...v.words2] }
}
const at = s => code.findIndex(c => c.text.includes(s)) + 1
const count = (w, ch) => [...w].filter(x => x === ch).length
export function buildTrace({ words1, words2 }) {
  const need = {}
  const snapNeed = () => Object.entries(need).sort().map(([ch, n]) => ({ ch, n }))
  const frames = [{ phase: 'start', activeLine: at('need = {}'), need: [], word: -1, b: -1, passed: [], failed: [], message: 'Every word in words2 must be a subset of a universal word, so only the maximum count of each letter across words2 matters.' }]
  words2.forEach((b, bi) => {
    const changed = []
    for (const ch of new Set(b)) {
      const c = count(b, ch)
      if (c > (need[ch] ?? 0)) { need[ch] = c; changed.push(`${ch}:${c}`) }
    }
    frames.push({ phase: 'need', activeLine: at('need[ch] = max'), need: snapNeed(), word: -1, b: bi, passed: [], failed: [], message: `"${b}" ${changed.length ? `raises the requirement to ${changed.join(', ')}` : 'does not raise any requirement'}.` })
  })
  const passed = [], failed = []
  words1.forEach((a, ai) => {
    const bad = Object.entries(need).find(([ch, n]) => count(a, ch) < n)
    if (bad) failed.push(ai); else passed.push(ai)
    frames.push({ phase: bad ? 'reject' : 'accept', activeLine: at('if all('), need: snapNeed(), word: ai, b: -1, passed: [...passed], failed: [...failed],
      message: bad ? `"${a}" has ${count(a, bad[0])} of '${bad[0]}' but ${bad[1]} are required: not universal.` : `"${a}" meets every required letter count: universal.` })
  })
  const result = passed.map(i => words1[i])
  frames.push({ phase: 'done', activeLine: at('return ans'), need: snapNeed(), word: -1, b: -1, passed: [...passed], failed: [...failed], message: `Universal words: [${result.join(', ')}].` })
  return { input: { words1, words2 }, result, frames }
}
export const code = `def wordSubsets(words1, words2):
    need = {}
    for b in words2:
        for ch in set(b):
            need[ch] = max(need.get(ch, 0), b.count(ch))
    ans = []
    for a in words1:
        if all(a.count(ch) >= n for ch, n in need.items()):
            ans.append(a)
    return ans`.split('\n').map((text, index) => ({ line: index + 1, text }))
