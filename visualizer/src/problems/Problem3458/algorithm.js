export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || typeof input.s !== 'string' || !Number.isInteger(input.k)) throw new Error('Use an object with a string s and an integer k.')
  const { s, k } = input
  if (s.length < 2 || s.length > 16 || !/^[a-z]+$/.test(s)) throw new Error('s has 2 to 16 lowercase letters.')
  if (k < 0 || k > 26) throw new Error('k is from 0 to 26.')
  return { s, k }
}

// A special block must start at the first occurrence of its first letter, and grow until every letter in it is closed.
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export function buildTrace({ s, k }) {
  const n = s.length
  const first = {}
  const last = {}
  for (let i = 0; i < n; i++) {
    if (first[s[i]] === undefined) first[s[i]] = i
    last[s[i]] = i
  }
  const frames = []
  const blocks = []
  for (let i = 0; i < n; i++) {
    if (first[s[i]] !== i) continue
    let end = last[s[i]]
    let valid = true
    for (let j = i; j <= end; j++) {
      frames.push({ pythonLine: P('while j <= end'), phase: 'expand', activeLine: L('grow the block'), at: j, start: i, end, chosen: [], message: `Block from ${i} reaches ${end}; check ${s[j]} at ${j}.` })
      if (first[s[j]] < i) { valid = false; break }
      end = Math.max(end, last[s[j]])
    }
    if (valid && !(i === 0 && end === n - 1)) {
      blocks.push({ start: i, end })
      frames.push({ pythonLine: P('blocks.append'), phase: 'accept', activeLine: L('keep the block'), at: i, start: i, end, chosen: [], message: `Block [${i}, ${end}] is special.` })
    } else {
      frames.push({ pythonLine: P('if ok and not'), phase: 'reject', activeLine: L('keep the block'), at: i, start: i, end, chosen: [], message: `Start ${i} cannot close into a special block.` })
    }
  }
  blocks.sort((a, b) => a.end - b.end)
  const chosen = []
  let lastEnd = -1
  for (const block of blocks) {
    if (block.start > lastEnd) {
      chosen.push(block)
      lastEnd = block.end
      frames.push({ pythonLine: P('taken += 1'), phase: 'pick', activeLine: L('take blocks greedily'), at: block.start, start: block.start, end: block.end, chosen: chosen.map(b => ({ ...b })), message: `Take [${block.start}, ${block.end}]; ${chosen.length} chosen.` })
    }
  }
  const result = chosen.length >= k
  frames.push({ pythonLine: P('return taken >= k'), phase: 'done', activeLine: L('return whether'), at: -1, start: -1, end: -1, chosen: chosen.map(b => ({ ...b })), message: `${chosen.length} disjoint block${chosen.length === 1 ? '' : 's'} found; k = ${k}, so the answer is ${result}.` })
  return { input: { s, k }, frames, result }
}

export const code = `for each start whose letter first appears there
  grow the block to cover every occurrence of its letters
  if a letter first appears before start, reject the start
  if the block is the whole string, reject it
  keep the block
sort kept blocks by their end
take blocks greedily when they begin after the last taken end
return whether the taken count reaches k`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def can_select_k_special(s, k):
    first, last = {}, {}
    for i, ch in enumerate(s):
        first.setdefault(ch, i)
        last[ch] = i
    blocks = []
    for i, ch in enumerate(s):
        if first[ch] != i:
            continue
        end, ok = last[ch], True
        j = i
        while j <= end:
            if first[s[j]] < i:
                ok = False
                break
            end = max(end, last[s[j]])
            j += 1
        if ok and not (i == 0 and end == len(s) - 1):
            blocks.append((end, i))
    blocks.sort()
    taken, last_end = 0, -1
    for end, start in blocks:
        if start > last_end:
            taken += 1
            last_end = end
    return taken >= k
`
