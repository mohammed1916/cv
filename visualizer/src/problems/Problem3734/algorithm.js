export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || typeof obj.s !== 'string' || typeof obj.target !== 'string') throw new Error('Use an object with string fields s and target.')
  if (obj.s.length < 1 || obj.s.length > 8) throw new Error('Use strings of 1 to 8 letters for the visualization.')
  if (obj.s.length !== obj.target.length) throw new Error('s and target must have the same length.')
  if (!/^[a-z]+$/.test(obj.s) || !/^[a-z]+$/.test(obj.target)) throw new Error('Use lowercase letters only.')
  return { s: obj.s, target: obj.target }
}

const countOf = str => {
  const counts = {}
  for (const ch of str) counts[ch] = (counts[ch] || 0) + 1
  return counts
}

// Smallest arrangement of the letters that is strictly greater than t, or null.
function nextArrangement(letters, t) {
  for (let p = t.length - 1; p >= 0; p--) {
    const avail = countOf(letters)
    let ok = true
    for (let k = 0; k < p; k++) {
      if (!avail[t[k]]) { ok = false; break }
      avail[t[k]] -= 1
    }
    if (!ok) continue
    const pick = [...'abcdefghijklmnopqrstuvwxyz'].find(c => c > t[p] && avail[c] > 0)
    if (pick === undefined) continue
    avail[pick] -= 1
    return t.slice(0, p) + pick + Object.keys(avail).sort().map(c => c.repeat(avail[c])).join('')
  }
  return null
}

export function buildTrace(input) {
  const { s, target } = input
  const counts = countOf(s)
  const odd = Object.keys(counts).filter(c => counts[c] % 2 === 1)
  const frames = [{ phase: 'start', activeLine: L('count the letters of s'), half: '', candidate: '', message: 'A palindrome needs at most one letter with an odd count.' }]
  if (odd.length > 1) {
    frames.push({ phase: 'done', activeLine: L('return an empty string'), half: '', candidate: '', message: 'Two or more letters have odd counts, so no palindrome exists.' })
    return { input, result: '', frames }
  }
  const middle = odd[0] || ''
  const half = Object.keys(counts).sort().map(c => c.repeat(Math.floor(counts[c] / 2))).join('')
  const h = Math.floor(s.length / 2)
  const t1 = target.slice(0, h)
  const mirror = x => x.split('').reverse().join('')
  const cand = t1 + middle + mirror(t1)
  frames.push({ phase: 'check', activeLine: L('if half letters equal'), half, candidate: cand, message: `Half letters: ${half || '(none)'}. Try the palindrome built from the target's first half: ${cand}.` })
  if ([...half].sort().join('') === [...t1].sort().join('') && cand > target) {
    frames.push({ phase: 'found', activeLine: L('return the palindrome'), half: t1, candidate: cand, message: `${cand} is a palindrome and is greater than target.` })
    return { input, result: cand, frames }
  }
  const next = nextArrangement(half, t1)
  if (next === null) {
    frames.push({ phase: 'done', activeLine: L('return an empty string'), half, candidate: '', message: 'No arrangement of the half letters is greater than the target half.' })
    return { input, result: '', frames }
  }
  const answer = next + middle + mirror(next)
  frames.push({ phase: 'found', activeLine: L('return the palindrome'), half: next, candidate: answer, message: `The smallest half above the target half is ${next}. The palindrome is ${answer}.` })
  return { input, result: answer, frames }
}

export const code = `smallest palindromic permutation greater than target:
  count the letters of s
  if two or more letters have odd counts then return an empty string
  set half to each letter repeated count // 2 times, sorted
  set middle to the odd letter, or nothing
  set t1 to the first half of target
  if half letters equal t1 and t1 + middle + reverse(t1) is greater than target then
    return the palindrome
  find the smallest arrangement of half that is greater than t1
  if none exists then return an empty string
  return that arrangement + middle + its reverse`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_palindromic_greater(s, target):
    def next_arrangement(letters, t):
        for p in range(len(t) - 1, -1, -1):
            avail = {}
            for ch in letters:
                avail[ch] = avail.get(ch, 0) + 1
            ok = True
            for ch in t[:p]:
                if avail.get(ch, 0) == 0:
                    ok = False
                    break
                avail[ch] -= 1
            if not ok:
                continue
            pick = None
            for code in range(ord(t[p]) + 1, ord('z') + 1):
                if avail.get(chr(code), 0) > 0:
                    pick = chr(code)
                    break
            if pick is None:
                continue
            avail[pick] -= 1
            return t[:p] + pick + ''.join(ch * avail[ch] for ch in sorted(avail))
        return None

    counts = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    odd = [ch for ch in counts if counts[ch] % 2 == 1]
    if len(odd) > 1:
        return ''
    middle = odd[0] if odd else ''
    half = ''.join(ch * (counts[ch] // 2) for ch in sorted(counts))
    h = len(s) // 2
    t1 = target[:h]
    cand = t1 + middle + t1[::-1]
    if sorted(half) == sorted(t1) and cand > target:
        return cand
    nxt = next_arrangement(half, t1)
    if nxt is None:
        return ''
    return nxt + middle + nxt[::-1]
`
