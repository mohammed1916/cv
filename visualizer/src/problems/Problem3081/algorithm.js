export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 20) throw new Error('Use a JSON string of 1 to 20 characters.')
  if (!/^[a-z?]+$/.test(s)) throw new Error('Use lowercase letters and question marks only.')
  if ((s.match(/\?/g) || []).length > 3) throw new Error('Use at most 3 question marks in the visualization.')
  return s
}

export function buildTrace(s) {
  const counts = new Array(26).fill(0)
  for (const ch of s) if (ch !== '?') counts[ch.charCodeAt(0) - 97]++
  const fill = list => {
    let k = 0
    return [...s].map(ch => (ch === '?' ? (k < list.length ? list[k++] : '?') : ch)).join('')
  }
  const picks = []
  const frames = [{ phase: 'count', activeLine: L('count the fixed letters'), text: s, picks: [], message: `Count the fixed letters in ${s}.` }]
  const questionCount = (s.match(/\?/g) || []).length
  for (let q = 0; q < questionCount; q++) {
    let best = 0
    for (let c = 1; c < 26; c++) if (counts[c] < counts[best]) best = c
    counts[best]++
    picks.push(String.fromCharCode(97 + best))
    frames.push({ phase: 'pick', activeLine: L('pick the letter with the lowest count'), text: fill(picks), picks: [...picks], message: `Question mark ${q + 1} takes ${picks[picks.length - 1]}, the letter with the lowest count so far.` })
  }
  const sorted = [...picks].sort()
  const result = fill(sorted)
  frames.push({ phase: 'sort', activeLine: L('sort the picks'), text: fill(sorted), picks: sorted, message: `Sort the picks: ${sorted.join('') || 'none'}.` })
  frames.push({ phase: 'done', activeLine: L('return the filled'), text: result, picks: sorted, message: `Smallest string with the minimum value: ${result}.` })
  return { input: s, result, frames }
}

export const code = `replace question marks to minimize the value:
  count the fixed letters in s
  for each question mark, do
    pick the letter with the lowest count, smallest letter on ties
    add one to that letter's count
  sort the picks
  fill the question marks in order with the sorted picks
  return the filled string`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimize_value(s):
    letters = 'abcdefghijklmnopqrstuvwxyz'
    counts = {c: 0 for c in letters}
    for ch in s:
        if ch != '?':
            counts[ch] += 1
    picks = []
    for _ in range(s.count('?')):
        best = min(letters, key=lambda c: counts[c])
        counts[best] += 1
        picks.append(best)
    picks.sort()
    it = iter(picks)
    return ''.join(next(it) if ch == '?' else ch for ch in s)
`
