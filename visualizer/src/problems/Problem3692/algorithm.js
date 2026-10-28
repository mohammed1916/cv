export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 40) throw new Error('Use a JSON string of 1 to 40 lowercase letters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('Use only lowercase letters a to z.')
  return s
}

export function buildTrace(s) {
  const count = {}
  const frames = [{ phase: 'start', activeLine: L('set count for each letter to 0'), letter: null, k: null, best: null, result: null, message: 'Count how often each letter appears.' }]
  for (const c of s) {
    count[c] = (count[c] || 0) + 1
    frames.push({ phase: 'count', activeLine: L('add 1 to count[c]'), letter: c, k: null, best: null, result: null, message: `${c} has appeared ${count[c]} time(s).` })
  }
  const groups = {}
  for (const [c, k] of Object.entries(count)) {
    if (!groups[k]) groups[k] = []
    groups[k].push(c)
  }
  let bestK = null
  for (const key of Object.keys(groups).map(Number).sort((a, b) => a - b)) {
    const size = groups[key].length
    if (bestK === null || size > groups[bestK].length) {
      frames.push({ phase: 'group', activeLine: L('if best is nothing or group k is larger than best'), letter: null, k: key, best: bestK, result: null, message: `Frequency ${key} has ${size} letter(s). It becomes the best group.` })
      bestK = key
    } else if (size === groups[bestK].length && key > bestK) {
      frames.push({ phase: 'group', activeLine: L('otherwise if the sizes tie and k is larger than best'), letter: null, k: key, best: bestK, result: null, message: `Frequency ${key} ties on size. The larger frequency wins.` })
      bestK = key
    } else {
      frames.push({ phase: 'group', activeLine: L('if best is nothing or group k is larger than best'), letter: null, k: key, best: bestK, result: null, message: `Frequency ${key} has ${size} letter(s), not more than the best.` })
    }
  }
  const result = groups[bestK].sort().join('')
  frames.push({ phase: 'done', activeLine: L('return the letters of best'), letter: null, k: bestK, best: bestK, result, message: `Majority group: ${result}.` })
  return { input: s, result, frames }
}

export const code = `majority frequency characters of s
  set count for each letter to 0
  for each character c in s
    add 1 to count[c]
  group the letters by their count, so group k lists the letters that appear k times
  set best to nothing
  for each group k in increasing order of k
    if best is nothing or group k is larger than best then
      set best to group k
    otherwise if the sizes tie and k is larger than best then
      set best to group k
  return the letters of best, sorted`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def majority_frequency_characters(s):
    count = {}
    for c in s:
        count[c] = count.get(c, 0) + 1
    groups = {}
    for c, k in count.items():
        groups.setdefault(k, []).append(c)
    best = None
    for k in groups:
        if best is None or len(groups[k]) > len(groups[best]):
            best = k
        elif len(groups[k]) == len(groups[best]) and k > best:
            best = k
    return ''.join(sorted(groups[best]))
`
