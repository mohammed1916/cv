const MAX_LENGTH = 8

export function parseInput(text) {
  const data = JSON.parse(text)
  const s = data?.s
  const t = data?.t
  if (typeof s !== 'string' || typeof t !== 'string') throw new Error('Give s and t as digit strings.')
  if (s.length < 1 || s.length > MAX_LENGTH) throw new Error(`s must have 1 to ${MAX_LENGTH} digits.`)
  if (t.length !== s.length) throw new Error('s and t must have the same length.')
  if (![...s, ...t].every(ch => ch >= '0' && ch <= '9')) throw new Error('Use only the digits 0 to 9.')
  return { s, t }
}

export const code = `can transform(s, t):
  set pos to, for each digit 0 to 9, the list of indices where it sits in s
  for each digit c of t, from left to right:
    if pos[c] is empty return false
    set first to the first index in pos[c]
    for each smaller digit d below c:
      if pos[d] starts before first then return false
    remove first from pos[c]
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ s, t }) {
  const pos = Array.from({ length: 10 }, () => [])
  ;[...s].forEach((ch, i) => pos[Number(ch)].push(i))
  const consumed = []
  const frames = [{ phase: 'start', activeLine: L('set pos to'), index: -1, active: -1, consumed: [], message: `Record where each digit sits in s: ${s}.` }]
  let ok = true
  for (let i = 0; i < t.length && ok; i++) {
    const c = Number(t[i])
    if (pos[c].length === 0) {
      ok = false
      frames.push({ phase: 'missing', activeLine: L('if pos[c] is empty'), index: i, active: -1, consumed: [...consumed], message: `Position ${i} of t needs a ${c}, but none is left in s.` })
      break
    }
    const first = pos[c][0]
    let blocker = null
    for (let d = 0; d < c && blocker === null; d++) {
      if (pos[d].length && pos[d][0] < first) blocker = d
    }
    if (blocker !== null) {
      ok = false
      frames.push({ phase: 'blocked', activeLine: L('if pos[d] starts'), index: i, active: first, consumed: [...consumed], message: `A ${blocker} sits before the ${c} at index ${first} of s, and sorting cannot move it past that ${c}.` })
      break
    }
    pos[c].shift()
    consumed.push(first)
    frames.push({ phase: 'match', activeLine: L('remove first from pos'), index: i, active: first, consumed: [...consumed], message: `Position ${i} of t matches the ${c} at index ${first} of s.` })
  }
  frames.push({ phase: 'done', activeLine: L(ok ? 'return true' : 'return false'), index: t.length, active: -1, consumed: [...consumed], message: ok ? 'Every digit of t can be matched in order: transformable.' : 'Transformation impossible.' })
  return { input: { s, t }, s, t, result: ok, frames }
}

export const python = `def is_transformable(s, t):
    pos = [[] for _ in range(10)]
    for i, ch in enumerate(s):
        pos[int(ch)].append(i)
    for ch in t:
        c = int(ch)
        if not pos[c]:
            return False
        first = pos[c][0]
        for d in range(c):
            if pos[d] and pos[d][0] < first:
                return False
        pos[c].pop(0)
    return True
`
