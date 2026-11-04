export const code = `function countCommas(n) {
  // commas starts at zero
  let commas = 0
  // group starts at 1000, the first size that gets a comma
  let group = 1000
  // while group is at most n
  while (group <= n) {
    // add n minus group plus one commas, one for each number from group to n
    commas += n - group + 1
    // group grows by a factor of 1000
    group *= 1000
  }
  // return commas
  return commas
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = key => code.findIndex(c => c.text.includes(key)) + 1
const PY = key => python.split('\n').findIndex(line => line.includes(key)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 1 || n > 100000) throw new Error('n is an integer from 1 to 100000.')
  return { n }
}

export function buildTrace({ n }) {
  let commas = 0
  const frames = [{ group: null, added: 0, commas, phase: 'setup', pythonLine: PY('commas = 0'), activeLine: L('commas starts'), message: 'No commas yet.' }]
  let group = 1000
  while (group <= n) {
    const added = n - group + 1
    commas += added
    frames.push({ group, added, commas, phase: 'group', pythonLine: PY('commas += n'), activeLine: L('add n minus group'), message: `Numbers ${group} to ${n} each gain one comma: ${added} commas.` })
    group *= 1000
  }
  frames.push({ group: null, added: 0, commas, phase: 'done', pythonLine: PY('return commas'), activeLine: L('return commas'), message: `Total commas: ${commas}.` })
  return { input: { n }, result: commas, frames }
}

export const python = `def count_commas(n):
    commas = 0
    group = 1000
    while group <= n:
        commas += n - group + 1
        group *= 1000
    return commas`
