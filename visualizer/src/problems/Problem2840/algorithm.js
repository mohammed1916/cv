export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || Array.isArray(value) || Object.keys(value).sort().join() !== 's1,s2') throw new Error('Use an object with exactly the keys "s1" and "s2".')
  const { s1, s2 } = value
  if (typeof s1 !== 'string' || !/^[a-z]{1,12}$/.test(s1)) throw new Error('s1 is 1 to 12 lowercase letters.')
  if (typeof s2 !== 'string' || s2.length !== s1.length || !/^[a-z]+$/.test(s2)) throw new Error('s2 must be lowercase letters with the same length as s1.')
  return { s1, s2 }
}

const sortedOf = chars => chars.slice().sort().join('')

export function buildTrace({ s1, s2 }) {
  const a = [...s1]
  const b = [...s2]
  const frames = [{ phase: 'start', activeLine: L('set evenFirst to'), active: -1, roles: {}, state: {}, message: 'A swap exchanges positions that are two apart, so letters never change parity.' }]
  for (let i = 0; i < a.length; i++) {
    frames.push({ phase: 'collect', activeLine: L('set evenFirst to'), active: i, roles: { [i]: i % 2 === 0 ? 'even' : 'odd' }, state: { position: i, s1: a[i], s2: b[i] }, message: `Position ${i} (${i % 2 === 0 ? 'even' : 'odd'}) holds "${a[i]}" in s1 and "${b[i]}" in s2.` })
  }
  const evenFirst = sortedOf(a.filter((_, i) => i % 2 === 0))
  const evenSecond = sortedOf(b.filter((_, i) => i % 2 === 0))
  const oddFirst = sortedOf(a.filter((_, i) => i % 2 === 1))
  const oddSecond = sortedOf(b.filter((_, i) => i % 2 === 1))
  const result = evenFirst === evenSecond && oddFirst === oddSecond
  frames.push({ phase: 'compare', activeLine: L('return evenFirst'), active: -1, roles: {}, state: { evenFirst, evenSecond, oddFirst, oddSecond, result }, message: result ? 'Each parity class holds the same letters in both strings, so the swaps can match them.' : 'A parity class holds different letters, so no sequence of swaps can make the strings equal.' })
  return { input: { s1, s2 }, result, items: a, frames }
}

export const code = `can the two strings be made equal with swaps two apart
  set evenFirst to the sorted letters of s1 at even positions
  set evenSecond to the sorted letters of s2 at even positions
  set oddFirst to the sorted letters of s1 at odd positions
  set oddSecond to the sorted letters of s2 at odd positions
  return evenFirst equals evenSecond and oddFirst equals oddSecond`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def can_be_equal(s1, s2):
    even1 = sorted(s1[0::2])
    even2 = sorted(s2[0::2])
    odd1 = sorted(s1[1::2])
    odd2 = sorted(s2[1::2])
    return even1 == even2 and odd1 == odd2
`
