export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || typeof obj.s !== 'string' || typeof obj.target !== 'string') throw new Error('Use an object with string fields s and target.')
  if (obj.s.length < 1 || obj.s.length > 8) throw new Error('Use strings of 1 to 8 letters for the visualization.')
  if (obj.s.length !== obj.target.length) throw new Error('s and target must have the same length.')
  if (!/^[a-z]+$/.test(obj.s) || !/^[a-z]+$/.test(obj.target)) throw new Error('Use lowercase letters only.')
  return { s: obj.s, target: obj.target }
}

const available = s => {
  const counts = {}
  for (const ch of s) counts[ch] = (counts[ch] || 0) + 1
  return counts
}

export function buildTrace(input) {
  const { s, target } = input
  const n = s.length
  const frames = [{ phase: 'start', activeLine: L('set need to the letter counts'), prefix: '', pick: '', message: 'Try the longest shared prefix with target first, because a longer shared prefix gives a smaller answer.' }]
  for (let p = n - 1; p >= 0; p--) {
    const avail = available(s)
    let ok = true
    for (let k = 0; k < p; k++) {
      if (!avail[target[k]]) { ok = false; break }
      avail[target[k]] -= 1
    }
    if (!ok) {
      frames.push({ phase: 'skip', activeLine: L('if the first p letters'), prefix: target.slice(0, p), pick: '', message: `Keeping ${p} letters of target is not possible with the letters of s.` })
      continue
    }
    const pick = [...'abcdefghijklmnopqrstuvwxyz'].find(c => c > target[p] && avail[c] > 0)
    if (pick === undefined) {
      frames.push({ phase: 'skip', activeLine: L('find the smallest letter'), prefix: target.slice(0, p), pick: '', message: `After ${p} letters there is no larger letter than ${target[p]} left.` })
      continue
    }
    avail[pick] -= 1
    const rest = Object.keys(avail).sort().map(c => c.repeat(avail[c])).join('')
    const answer = target.slice(0, p) + pick + rest
    frames.push({ phase: 'found', activeLine: L('return the first p letters'), prefix: target.slice(0, p), pick, message: `Keep ${p} letters, raise position ${p} to ${pick}, and sort the rest: ${answer}.` })
    return { input, result: answer, frames }
  }
  frames.push({ phase: 'done', activeLine: L('return an empty string'), prefix: '', pick: '', message: 'No permutation of s is strictly greater than target.' })
  return { input, result: '', frames }
}

export const code = `smallest permutation of s greater than target:
  set need to the letter counts of s
  for p from the last position down to 0:
    if the first p letters of target can be taken from need then
      find the smallest letter c after target[p] that is still in need
      if such a letter exists then
        return the first p letters of target, then c, then the rest of need sorted
  return an empty string`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_permutation_greater(s, target):
    n = len(s)
    for p in range(n - 1, -1, -1):
        avail = {}
        for ch in s:
            avail[ch] = avail.get(ch, 0) + 1
        ok = True
        for ch in target[:p]:
            if avail.get(ch, 0) == 0:
                ok = False
                break
            avail[ch] -= 1
        if not ok:
            continue
        pick = None
        for code in range(ord(target[p]) + 1, ord('z') + 1):
            ch = chr(code)
            if avail.get(ch, 0) > 0:
                pick = ch
                break
        if pick is None:
            continue
        avail[pick] -= 1
        rest = ''.join(ch * avail[ch] for ch in sorted(avail))
        return target[:p] + pick + rest
    return ''
`
