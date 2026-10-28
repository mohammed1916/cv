export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || Array.isArray(value) || Object.keys(value).join() !== 's') throw new Error('Use an object with exactly the key "s".')
  const { s } = value
  if (typeof s !== 'string' || !/^[a-z]{1,20}$/.test(s)) throw new Error('s is 1 to 20 lowercase letters.')
  return { s }
}

export function buildTrace({ s }) {
  const chars = [...s]
  const pairs = new Set()
  const frames = [{ phase: 'start', activeLine: L('set pairs to an empty set'), active: -1, roles: {}, state: {}, message: 'List every adjacent pair of letters in s. Then look for a pair whose reverse is also in the list.' }]
  for (let i = 0; i + 1 < chars.length; i++) {
    pairs.add(chars[i] + chars[i + 1])
    frames.push({ phase: 'collect', activeLine: L('add the pair to pairs'), active: i, roles: { [i]: 'pair', [i + 1]: 'pair' }, state: { pair: chars[i] + chars[i + 1] }, message: `Record "${chars[i]}${chars[i + 1]}".` })
  }
  let found = false
  for (let i = 0; i + 1 < chars.length && !found; i++) {
    const reversed = chars[i + 1] + chars[i]
    const hit = pairs.has(reversed)
    frames.push({ phase: 'check', activeLine: L('if the reverse of the pair is in pairs'), active: i, roles: { [i]: hit ? 'match' : 'checked', [i + 1]: hit ? 'match' : 'checked' }, state: { pair: chars[i] + chars[i + 1], reversed, hit }, message: hit ? `Reverse "${reversed}" also appears, so the answer is true.` : `Reverse "${reversed}" does not appear.` })
    if (hit) found = true
  }
  frames.push({ phase: 'done', activeLine: L(found ? 'return true' : 'return false'), active: -1, roles: {}, state: { result: found }, message: found ? 'Return true.' : 'No pair has its reverse present. Return false.' })
  return { input: { s }, result: found, items: chars, frames }
}

export const code = `does s contain a pair whose reverse also appears
  set pairs to an empty set
  for each adjacent pair of letters in s
    add the pair to pairs
  for each adjacent pair of letters in s
    if the reverse of the pair is in pairs then return true
  return false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def is_substring_present(s):
    pairs = set()
    for i in range(len(s) - 1):
        pairs.add(s[i:i + 2])
    for i in range(len(s) - 1):
        if s[i + 1] + s[i] in pairs:
            return True
    return False
`
