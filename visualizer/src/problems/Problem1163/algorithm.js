export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).join() !== 's') throw new Error('Use a JSON object with exactly one key, s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 40) throw new Error('s must be a string of 1 to 40 characters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s may contain only lowercase letters a to z.')
  return { s }
}

export function buildTrace({ s }) {
  const n = s.length
  let i = 0
  let j = 1
  let k = 0
  const frames = [{ phase: 'start', activeLine: L('set i to 0'), i, j, k, message: 'Compare the suffix at 0 with the suffix at 1.' }]
  while (j + k < n) {
    if (s[i + k] === s[j + k]) {
      k++
      frames.push({ phase: 'match', activeLine: L('the letter at i plus k equals'), i, j, k, message: `Both suffixes read ${s[i + k - 1]} at offset ${k - 1}. Keep comparing.` })
      continue
    }
    if (s[i + k] < s[j + k]) {
      const next = Math.max(i + k + 1, j)
      frames.push({ phase: 'move-i', activeLine: L('move i to the later'), i, j, k, message: `At offset ${k}, ${s[j + k]} beats ${s[i + k]}, so no start from ${i} through ${i + k} can win. Move i to ${next}.` })
      i = next
      j = i + 1
    } else {
      frames.push({ phase: 'move-j', activeLine: L('move j past'), i, j, k, message: `At offset ${k}, ${s[i + k]} beats ${s[j + k]}, so the start ${j} through ${j + k} cannot win. Move j to ${j + k + 1}.` })
      j = j + k + 1
    }
    k = 0
  }
  const result = s.slice(i)
  frames.push({ phase: 'done', activeLine: L('return the suffix'), i, j, k: 0, message: `The largest substring starts at ${i}: ${result}.` })
  return { input: { s }, result, frames }
}

export const code = `last substring in lexicographical order:
  set i to 0, the start of the best candidate
  set j to 1, the start of the challenger
  set k to 0, the number of letters matched so far
  while j plus k is inside the string
    if the letter at i plus k equals the letter at j plus k then
      add 1 to k
    otherwise
      if the letter at i plus k is smaller then
        move i to the later of i plus k plus 1 and j
        set j to i plus 1
      otherwise
        move j past the block that ends at j plus k
      set k to 0
  return the suffix that starts at i`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def last_substring(s):
    n = len(s)
    i, j, k = 0, 1, 0
    while j + k < n:
        if s[i + k] == s[j + k]:
            k += 1
        else:
            if s[i + k] < s[j + k]:
                i = max(i + k + 1, j)
                j = i + 1
            else:
                j = j + k + 1
            k = 0
    return s[i:]
`
