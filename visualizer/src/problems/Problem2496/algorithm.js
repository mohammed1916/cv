export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).join() !== 'strs') throw new Error('Use a JSON object with exactly one key, strs.')
  const { strs } = input
  if (!Array.isArray(strs) || strs.length < 1 || strs.length > 20) throw new Error('strs must be an array of 1 to 20 strings.')
  if (strs.some(s => typeof s !== 'string' || !/^[a-z0-9]{1,9}$/.test(s))) throw new Error('Each string must be 1 to 9 lowercase letters or digits.')
  return { strs }
}

export function buildTrace({ strs }) {
  let best = 0
  const frames = [{ phase: 'start', activeLine: L('set best to 0'), index: -1, value: 0, best, message: 'Start with a best value of zero.' }]
  strs.forEach((s, i) => {
    const digitsOnly = /^[0-9]+$/.test(s)
    const value = digitsOnly ? Number(s) : s.length
    const kind = digitsOnly ? `the number ${value}` : `the length ${value}`
    if (value > best) best = value
    frames.push({ phase: value === best && value > 0 ? 'better' : 'value', activeLine: L('if value is larger than best'), index: i, value, best, message: `${s} is worth ${kind}. Best so far: ${best}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, value: 0, best, message: `Maximum value: ${best}.` })
  return { input: { strs }, result: best, frames }
}

export const code = `maximum value of a string:
  set best to 0
  for each string s in strs
    if every character of s is a digit then
      let value be the number that s spells
    otherwise
      let value be the length of s
    if value is larger than best then
      set best to value
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_value(strs):
    best = 0
    for s in strs:
        if s.isdigit():
            value = int(s)
        else:
            value = len(s)
        if value > best:
            best = value
    return best
`
