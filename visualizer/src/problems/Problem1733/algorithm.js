const pairsAt = (friendships, k) => friendships[k]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, languages and friendships.')
  const { n, languages, friendships } = input
  if (!Number.isInteger(n) || n < 1 || n > 10) throw new Error('n is an integer from 1 to 10.')
  if (!Array.isArray(languages) || languages.length < 2 || languages.length > 12) throw new Error('languages has 2 to 12 user rows.')
  if (!languages.every(row => Array.isArray(row) && row.length >= 1 && row.every(l => Number.isInteger(l) && l >= 1 && l <= n))) throw new Error('Each user row lists languages from 1 to n.')
  if (!Array.isArray(friendships) || friendships.length > 20) throw new Error('friendships has at most 20 pairs.')
  const m = languages.length
  for (const pair of friendships) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(u => Number.isInteger(u) && u >= 1 && u <= m) || pair[0] === pair[1]) throw new Error('Each friendship is two different 1-based user numbers.')
  }
  return { n, languages, friendships }
}

export function buildTrace({ n, languages, friendships }) {
  const known = languages.map(row => new Set(row))
  const frames = []
  const bad = []
  const need = new Set()
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('const known = languages'), at: -1, bad: [], need: 0, lang: null, count: null, result: null, message: `Read ${languages.length} users and ${friendships.length} friendships.` })
  for (let k = 0; k < friendships.length; k++) {
    const [a, b] = pairsAt(friendships, k)
    const shared = [...known[a - 1]].some(l => known[b - 1].has(l))
    if (shared) {
      frames.push({ pythonLine: 5, phase: 'share', activeLine: L('if (!shared)'), at: k, bad: [...bad], need: need.size, lang: null, count: null, result: null, message: `Users ${a} and ${b} already share a language.` })
    } else {
      bad.push(k)
      need.add(a - 1)
      need.add(b - 1)
      frames.push({ pythonLine: 7, phase: 'bad', activeLine: L('need.add'), at: k, bad: [...bad], need: need.size, lang: null, count: null, result: null, message: `Users ${a} and ${b} share nothing; both are in the needy set.` })
    }
  }
  if (need.size === 0) {
    frames.push({ pythonLine: 10, phase: 'done', activeLine: L('return 0'), at: -1, bad: [], need: 0, lang: null, count: null, result: 0, message: 'Every friendship already shares a language.' })
    return { input: { n, languages, friendships }, result: 0, frames }
  }
  let best = 0
  for (let lang = 1; lang <= n; lang++) {
    const count = [...need].filter(u => known[u].has(lang)).length
    best = Math.max(best, count)
    frames.push({ pythonLine: 14, phase: 'count', activeLine: L('best = Math.max(best, count)'), at: -1, bad: [...bad], need: need.size, lang, count, result: null, message: `Language ${lang} already covers ${count} of ${need.size} needy users.` })
  }
  const result = need.size - best
  frames.push({ pythonLine: 15, phase: 'done', activeLine: L('return need.size - best'), at: -1, bad: [...bad], need: need.size, lang: null, count: best, result, message: `Teach ${result} user${result === 1 ? '' : 's'}.` })
  return { input: { n, languages, friendships }, result, frames }
}

export const code = `function minimumTeachingUsers(n, languages, friendships) {
  const known = languages.map(row => new Set(row))
  const need = new Set()
  for (const [a, b] of friendships) {
    const shared = [...known[a - 1]].some(l => known[b - 1].has(l))
    if (!shared) {
      need.add(a - 1)
      need.add(b - 1)
    }
  }
  if (need.size === 0) return 0
  let best = 0
  for (let lang = 1; lang <= n; lang++) {
    const count = [...need].filter(u => known[u].has(lang)).length
    best = Math.max(best, count)
  }
  return need.size - best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_teaching_users(n, languages, friendships):
    known = [set(row) for row in languages]
    need = set()
    for a, b in friendships:
        shared = any(lang in known[b - 1] for lang in known[a - 1])
        if not shared:
            need.add(a - 1)
            need.add(b - 1)
    if not need:
        return 0
    best = 0
    for lang in range(1, n + 1):
        count = sum(1 for u in need if lang in known[u])
        best = max(best, count)
    return len(need) - best
`
