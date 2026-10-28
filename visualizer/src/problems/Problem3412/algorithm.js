export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with an s key.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 12 || !/^[a-z]+$/.test(s)) throw new Error('s is 1 to 12 lowercase letters.')
  return { s }
}

const mirrorOf = ch => String.fromCharCode(219 - ch.charCodeAt(0))

export function buildTrace(input) {
  const { s } = input
  const unmarked = {}
  const marked = Array(s.length).fill(false)
  let score = 0
  const frames = [{ phase: 'start', activeLine: L('set score to 0'), index: -1, score, matched: [], message: 'Walk left to right, pairing each letter with the closest earlier unmarked mirror letter.' }]
  for (let i = 0; i < s.length; i++) {
    const mirror = mirrorOf(s[i])
    const list = unmarked[mirror] ?? []
    if (list.length > 0) {
      const j = list.pop()
      unmarked[mirror] = list
      marked[i] = true
      marked[j] = true
      score += i - j
      frames.push({ phase: 'match', activeLine: L('add i minus j to score'), index: i, partner: j, score, matched: marked.slice(), message: `${s[i]} at ${i} pairs with its mirror ${mirror} at ${j}; score gains ${i - j}.` })
    } else {
      if (!unmarked[s[i]]) unmarked[s[i]] = []
      unmarked[s[i]].push(i)
      frames.push({ phase: 'keep', activeLine: L('add i to the list'), index: i, partner: -1, score, matched: marked.slice(), message: `No unmarked ${mirror} before ${i}; remember ${s[i]} at ${i}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return score'), index: -1, partner: -1, score, matched: marked.slice(), message: `Mirror score: ${score}.` })
  return { input, result: score, frames }
}

export const code = `mirror score of a string s:
  set score to 0 and create an empty list of unmarked positions for each letter
  for each position i from left to right
    set mirror to the mirror letter of s at i
    if the list for mirror has an unmarked position then
      take the closest one, j, and mark both positions
      add i minus j to score
    otherwise add i to the list for the letter at i
  return score`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def mirror_score(s):
    unmarked = {}
    total = 0
    for i, ch in enumerate(s):
        mirror = chr(219 - ord(ch))
        positions = unmarked.get(mirror)
        if positions:
            j = positions.pop()
            total += i - j
        else:
            unmarked.setdefault(ch, []).append(i)
    return total
`
