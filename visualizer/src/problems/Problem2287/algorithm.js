const MAX_SOURCE = 20
const MAX_TARGET = 5

export function parseInput(text) {
  const data = JSON.parse(text)
  const { s, target } = data ?? {}
  if (typeof s !== 'string' || s.length < 1 || s.length > MAX_SOURCE || !/^[a-z]+$/.test(s)) throw new Error(`s must be 1 to ${MAX_SOURCE} lowercase letters.`)
  if (typeof target !== 'string' || target.length < 1 || target.length > MAX_TARGET || !/^[a-z]+$/.test(target)) throw new Error(`target must be 1 to ${MAX_TARGET} lowercase letters.`)
  return { s, target }
}

export const code = `most copies of target that can be spelled from the letters of s
  set have to the number of each letter in s
  set need to the number of each letter in target
  set best to infinity
  for each letter x in need
    set copies to have[x] divided by need[x], rounded down
    if copies is less than best then
      set best to copies
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const tally = text => {
  const out = {}
  for (const ch of text) out[ch] = (out[ch] ?? 0) + 1
  return out
}

export function buildTrace({ s, target }) {
  const have = tally(s)
  const need = tally(target)
  let best = Infinity
  const frames = [{ phase: 'start', letter: null, have: 0, need: 0, copies: null, best: null, activeLine: L('set have'), message: 'Count the letters available in s and the letters the target needs.' }]
  for (const x of Object.keys(need)) {
    const copies = Math.floor((have[x] ?? 0) / need[x])
    if (copies < best) best = copies
    frames.push({ phase: 'letter', letter: x, have: have[x] ?? 0, need: need[x], copies, best, activeLine: L('set copies to'), message: `${x}: ${have[x] ?? 0} available, ${need[x]} needed per copy, so at most ${copies} copies.` })
  }
  frames.push({ phase: 'done', letter: null, have: 0, need: 0, copies: null, best, activeLine: L('return best'), message: `At most ${best} copies of the target.` })
  return { input: { s, target }, result: best, frames }
}

export const python = `def rearrange_characters(s, target):
    have = {}
    for ch in s:
        have[ch] = have.get(ch, 0) + 1
    need = {}
    for ch in target:
        need[ch] = need.get(ch, 0) + 1
    best = float('inf')
    for x in need:
        copies = have.get(x, 0) // need[x]
        if copies < best:
            best = copies
    return best
`
