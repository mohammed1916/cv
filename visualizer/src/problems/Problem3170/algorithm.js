export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.s !== 'string' || input.s.length < 1 || input.s.length > 14) throw new Error('Use {"s": "..."} with 1 to 14 characters.')
  let open = 0
  for (const ch of input.s) {
    if (ch === '*') {
      if (open === 0) throw new Error('Each star needs a letter to its left that is still present.')
      open -= 1
    } else if (ch >= 'a' && ch <= 'z') {
      open += 1
    } else {
      throw new Error('Use lowercase letters and stars only.')
    }
  }
  return { s: input.s }
}

export function buildTrace(input) {
  const s = input.s
  const kept = []
  const alive = Array.from(s, () => false)
  const text = () => kept.map(p => s[p]).join('')
  const frames = [{ phase: 'start', activeLine: L('set letters'), index: -1, alive: [...alive], text: '', message: 'Read left to right. Letters join a list. Each star removes the smallest letter already in the list.' }]
  for (let i = 0; i < s.length; i++) {
    if (s[i] !== '*') {
      kept.push(i)
      alive[i] = true
      frames.push({ phase: 'letter', activeLine: L('if it is a letter'), index: i, alive: [...alive], text: text(), message: `Add ${s[i]} to the list.` })
      continue
    }
    // Scan from the right so that the rightmost letter wins a tie.
    let best = -1
    for (let j = kept.length - 1; j >= 0; j--) {
      if (best === -1 || s[kept[j]] < s[best]) best = kept[j]
    }
    kept.splice(kept.indexOf(best), 1)
    alive[best] = false
    frames.push({ phase: 'star', activeLine: L('remove that letter'), index: i, alive: [...alive], text: text(), message: `The star removes ${s[best]} from position ${best}, the smallest letter to its left.` })
  }
  frames.push({ phase: 'done', activeLine: L('return letters'), index: -1, alive: [...alive], text: text(), message: `Smallest string: ${text() || '(empty)'}.` })
  return { input, result: text(), frames }
}

export const code = `lexicographically smallest string after removing stars
  set letters to an empty list
  for each character from left to right
    if it is a letter then add it to the end of letters
    if it is a star then
      scan letters from right to left for the smallest one, keeping the rightmost on ties
      remove that letter from letters
  return letters joined as text`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_after_removing_stars(s):
    kept = []
    for ch in s:
        if ch != '*':
            kept.append(ch)
            continue
        best = None
        for j in range(len(kept) - 1, -1, -1):
            if best is None or kept[j] < kept[best]:
                best = j
        del kept[best]
    return ''.join(kept)
`
