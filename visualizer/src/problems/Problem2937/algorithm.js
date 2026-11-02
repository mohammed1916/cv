const LOWER = /^[a-z]+$/

export function parseInput(text) {
  const input = JSON.parse(text)
  const { s1, s2, s3 } = input ?? {}
  for (const s of [s1, s2, s3]) {
    if (typeof s !== 'string' || s.length < 1 || s.length > 20 || !LOWER.test(s)) throw new Error('Each string has 1 to 20 lowercase letters.')
  }
  return { s1, s2, s3 }
}

export function buildTrace({ s1, s2, s3 }) {
  const frames = []
  const best = Math.min(s1.length, s2.length, s3.length)
  let prefix = 0
  frames.push({ pythonLine: P('best = min'), phase: 'start', activeLine: L('shortest string'), at: -1, prefix, message: `The longest possible shared prefix is at most ${best} letters.` })
  while (prefix < best && s1[prefix] === s2[prefix] && s2[prefix] === s3[prefix]) {
    frames.push({ pythonLine: P('prefix += 1'), phase: 'match', activeLine: L('extend the shared prefix'), at: prefix, prefix, message: `Position ${prefix} holds ${s1[prefix]} in all three strings.` })
    prefix += 1
  }
  frames.push({ pythonLine: P('while prefix < best'), phase: 'stop', activeLine: L('stop at the first mismatch'), at: prefix < best ? prefix : -1, prefix, message: prefix < best ? `Position ${prefix} differs, so the shared prefix ends.` : 'The shortest string is fully shared.' })
  if (prefix === 0) {
    frames.push({ pythonLine: P('return -1'), phase: 'impossible', activeLine: L('return -1'), at: -1, prefix, message: 'No shared first letter, so the strings can never meet.' })
    return { input: { s1, s2, s3 }, result: -1, frames }
  }
  const result = s1.length + s2.length + s3.length - 3 * prefix
  frames.push({ pythonLine: P('return len(s1)'), phase: 'done', activeLine: L('total length minus'), at: -1, prefix, message: `Delete everything after the shared prefix: ${result} operations.` })
  return { input: { s1, s2, s3 }, result, frames }
}

export const code = `minimum deletions to make three strings equal
  set best to the shortest length among the three strings
  set prefix to 0
  while prefix is below best and the three letters at prefix match
    add 1 to prefix
  if prefix is 0 then return -1
  return the total length of the three strings minus 3 times prefix`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def make_three_strings_equal(s1, s2, s3):
    best = min(len(s1), len(s2), len(s3))
    prefix = 0
    while prefix < best and s1[prefix] == s2[prefix] == s3[prefix]:
        prefix += 1
    if prefix == 0:
        return -1
    return len(s1) + len(s2) + len(s3) - 3 * prefix
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
