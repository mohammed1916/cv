export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || Array.isArray(value) || Object.keys(value).join() !== 's') throw new Error('Use an object with exactly the key "s".')
  const { s } = value
  if (typeof s !== 'string' || !/^[a-z*|]{1,30}$/.test(s)) throw new Error('s is 1 to 30 characters from lowercase letters, "*" and "|".')
  return { s }
}

export function buildTrace({ s }) {
  const chars = [...s]
  const frames = [{ phase: 'start', activeLine: L('set count to 0'), active: -1, roles: {}, state: { count: 0, inside: false }, message: 'Walk left to right. Asterisks between a pair of bars are skipped.' }]
  let count = 0
  let pending = 0
  let inside = false
  chars.forEach((ch, i) => {
    if (ch === '|') {
      inside = !inside
      pending = 0
      frames.push({ phase: 'bar', activeLine: L('flip inside'), active: i, roles: { [i]: 'bar' }, state: { count, inside }, message: inside ? 'A bar opens a pair. Stars after it are not counted yet.' : 'A bar closes the pair. Stars inside it are not counted.' })
    } else if (ch === '*') {
      if (inside) pending += 1
      else count += 1
      frames.push({ phase: 'star', activeLine: L(inside ? 'add 1 to pending' : 'add 1 to count'), active: i, roles: { [i]: inside ? 'inside pair' : 'counted' }, state: { count, inside }, message: inside ? `Star ${i} is between a pair, so it is skipped.` : `Star ${i} is outside every pair. Count is ${count}.` })
    }
  })
  if (inside) count += pending
  frames.push({ phase: 'done', activeLine: L('return count'), active: -1, roles: {}, state: { count, inside }, message: `Return ${count}.${inside ? ' The last bar has no partner, so the stars after it still count.' : ''}` })
  return { input: { s }, result: count, items: chars, frames }
}

export const code = `count asterisks outside bar pairs
  set count to 0
  set pending to 0
  set inside to false
  for each character in s
    if the character is a bar then
      flip inside and set pending to 0
    otherwise if the character is an asterisk then
      if inside is false then add 1 to count
      otherwise add 1 to pending
  if inside is true then add pending to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_asterisks(s):
    count = 0
    pending = 0
    inside = False
    for ch in s:
        if ch == "|":
            inside = not inside
            pending = 0
        elif ch == "*":
            if inside:
                pending += 1
            else:
                count += 1
    if inside:
        count += pending
    return count
`
