export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || typeof data.s !== 'string') throw new Error('Use {"s": "..."} with a lowercase string of 2 to 50 letters.')
  const { s } = data
  if (s.length < 2 || s.length > 50 || !/^[a-z]+$/.test(s)) throw new Error('Use a lowercase string of 2 to 50 letters.')
  if (new Set(s).size === s.length) throw new Error('At least one letter must appear twice.')
  return { s }
}

export function buildTrace(input) {
  const { s } = input
  const seen = new Set()
  const frames = [{ phase: 'start', activeLine: L('seen = empty set'), index: -1, maps: [], ops: [], result: null, seen: [], message: 'Read the letters from left to right and remember each one.' }]
  const setMap = () => [{ name: 'seen', keyLabel: 'letter', valueLabel: '', isSet: true, entries: [...seen].map(c => [c]) }]
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (seen.has(c)) {
      frames.push({ phase: 'match', activeLine: L('return c'), index: i, maps: setMap(), ops: [{ map: 'seen', type: 'lookup', via: 'has', key: c, hit: true, hitNote: 'this letter was seen earlier, so this is its second copy', missNote: 'first copy' }],
        result: c, seen: [...seen], message: `${c} at index ${i} is already seen. It is the first letter to appear twice.` })
      return { input, result: c, frames }
    }
    seen.add(c)
    frames.push({ phase: 'scan', activeLine: L('add c to seen'), index: i, maps: setMap(), ops: [{ map: 'seen', type: 'insert', key: c }], result: null, seen: [...seen], message: `${c} at index ${i} is new. Add it to the seen set.` })
  }
  throw new Error('No letter appears twice.')
}

export const code = `first letter that appears twice
seen = empty set of letters
for each letter c in the string, from left to right
  if c is already in seen then
    return c
  add c to seen`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def first_letter_to_appear_twice(s):
    seen = set()
    for c in s:
        if c in seen:
            return c
        seen.add(c)
    return ''
`
