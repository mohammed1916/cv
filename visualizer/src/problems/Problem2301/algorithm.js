const LETTER = /^[a-z]$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s, sub and mappings.')
  const { s, sub, mappings } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 20 || !/^[a-z]+$/.test(s)) throw new Error('s has 1 to 20 lowercase letters.')
  if (typeof sub !== 'string' || sub.length < 1 || sub.length > 8 || !/^[a-z]+$/.test(sub)) throw new Error('sub has 1 to 8 lowercase letters.')
  if (!Array.isArray(mappings) || mappings.length > 10) throw new Error('mappings is a list of at most 10 pairs.')
  for (const pair of mappings) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(c => typeof c === 'string' && LETTER.test(c))) throw new Error('Each mapping is a pair of single lowercase letters.')
  }
  return { s, sub, mappings }
}

export function buildTrace({ s, sub, mappings }) {
  const allowed = new Set(mappings.map(([from, to]) => `${from}>${to}`))
  const frames = []
  frames.push({ phase: 'start', activeLine: L('build a set'), start: -1, at: -1, ok: null, message: `Allow ${allowed.size} replacement${allowed.size === 1 ? '' : 's'} on sub.` })
  let result = false
  for (let i = 0; i + sub.length <= s.length && !result; i++) {
    let ok = true
    frames.push({ phase: 'window', activeLine: L('for each start index'), start: i, at: -1, ok, message: `Try sub at index ${i}.` })
    for (let j = 0; j < sub.length; j++) {
      if (sub[j] === s[i + j]) {
        frames.push({ phase: 'match', activeLine: L('if sub at j equals'), start: i, at: i + j, ok, message: `${sub[j]} equals ${s[i + j]} directly.` })
        continue
      }
      if (allowed.has(`${sub[j]}>${s[i + j]}`)) {
        frames.push({ phase: 'replace', activeLine: L('if the replacement'), start: i, at: i + j, ok, message: `${sub[j]} may be replaced by ${s[i + j]}.` })
        continue
      }
      ok = false
      frames.push({ phase: 'fail', activeLine: L('set ok to false'), start: i, at: i + j, ok, message: `${sub[j]} cannot become ${s[i + j]}; index ${i} fails.` })
      break
    }
    if (ok) {
      result = true
      frames.push({ phase: 'found', activeLine: L('if ok then return true'), start: i, at: -1, ok, message: `Every position of sub fits at index ${i}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return false'), start: -1, at: -1, ok: result, message: result ? 'A match exists.' : 'No start index works.' })
  return { input: { s, sub, mappings }, result, frames }
}

export const code = `can sub be made a substring of s with the replacements
  build a set of allowed replacements from the mappings
  for each start index i from 0 to len(s) minus len(sub)
    set ok to true
    for each position j in sub
      if sub at j equals s at i plus j then continue
      if the replacement from sub at j to s at i plus j is allowed then continue
      set ok to false and stop checking this start
    if ok then return true
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def match_after_replacement(s, sub, mappings):
    allowed = set()
    for old, new in mappings:
        allowed.add((old, new))
    for i in range(len(s) - len(sub) + 1):
        ok = True
        for j in range(len(sub)):
            if sub[j] == s[i + j]:
                continue
            if (sub[j], s[i + j]) in allowed:
                continue
            ok = False
            break
        if ok:
            return True
    return False
`
