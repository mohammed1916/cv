export const code = [
  'commas starts at zero',
  'group starts at 1000',
  'while group is at most n',
  'add n minus group plus one commas',
  'group grows by a factor of 1000',
  'return commas',
].map((text, index) => ({ line: index + 1, text }))
const L = key => code.findIndex(c => c.text.includes(key)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n.')
  const { n } = input
  if (!Number.isSafeInteger(n) || n < 1 || n > 1e15) throw new Error('n is an integer from 1 to 1000000000000000.')
  return { n }
}

export function buildTrace({ n }) {
  const big = BigInt(n)
  let commas = 0n
  const frames = [{ group: null, added: 0, commas: 0, phase: 'setup', activeLine: L('commas starts'), message: 'No commas yet.' }]
  let group = 1000n
  while (group <= big) {
    const added = big - group + 1n
    commas += added
    frames.push({ group: String(group), added: String(added), commas: String(commas), phase: 'group', activeLine: L('add n minus group'),
      message: `Numbers ${group} to ${n} each gain one comma: ${added} commas.` })
    group *= 1000n
  }
  frames.push({ group: null, added: 0, commas: String(commas), phase: 'done', activeLine: L('return commas'), message: `Total commas: ${commas}.` })
  return { input: { n }, result: Number(commas), frames }
}

export const python = `def count_commas(n):
    commas = 0
    group = 1000
    while group <= n:
        commas += n - group + 1
        group *= 1000
    return commas`
