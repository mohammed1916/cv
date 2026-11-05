// LeetCode 2109: Adding Spaces to a String.
// The space positions are increasing, so one pass copies each slice of s and inserts a space before it.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"s":"EnjoyYourCoffee","spaces":[5,9]}.') }
  const { s, spaces } = data ?? {}
  if (typeof s !== 'string' || !/^[A-Za-z]{1,30}$/.test(s)) throw new Error('s must be 1 to 30 English letters.')
  if (!Array.isArray(spaces) || spaces.length < 1 || spaces.length > s.length) throw new Error('spaces must list between 1 and the length of s indices.')
  spaces.forEach((index, i) => {
    if (!Number.isInteger(index) || index < 0 || index >= s.length || (i > 0 && index <= spaces[i - 1])) throw new Error('spaces must be strictly increasing indices inside s.')
  })
  return { s, spaces }
}

export const code = `function addSpaces(s, spaces) {
  const parts = []
  let previous = 0
  for (const index of spaces) {
    parts.push(s.slice(previous, index))
    previous = index
  }
  parts.push(s.slice(previous))
  return parts.join(' ')
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: add_spaces
def add_spaces(s, spaces):
    parts = []
    previous = 0
    for index in spaces:
        parts.append(s[previous:index])
        previous = index
    parts.append(s[previous:])
    return " ".join(parts)
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'slice', label: 'Copy slice', description: 'Copy the letters from the previous cut up to the next space position.' },
  { id: 'space', label: 'Insert space', description: 'A space goes before the letter at that index.' },
  { id: 'tail', label: 'Tail', description: 'Copy the letters after the last space position.' },
  { id: 'done', label: 'Result', description: 'The parts joined with single spaces.' },
]

export function buildTrace({ s, spaces }) {
  const frames = []
  const parts = []
  let previous = 0
  const built = () => parts.join(' ')
  spaces.forEach((index, k) => {
    const piece = s.slice(previous, index)
    parts.push(piece)
    frames.push({ phase: 'slice', activeLine: L('parts.push(s.slice(previous, index))'), pythonLine: P('parts.append(s[previous:index])'), message: `Copy "${piece}" from ${previous} up to ${index}.`, l: previous, r: index, pointer: k, built: built(), spaces })
    previous = index
    frames.push({ phase: 'space', activeLine: L('previous = index'), pythonLine: P('previous = index'), message: `A space goes before "${s[index]}" (index ${index}).`, l: index, r: index, pointer: k, built: built(), spaces })
  })
  parts.push(s.slice(previous))
  frames.push({ phase: 'tail', activeLine: L('parts.push(s.slice(previous))'), pythonLine: P('parts.append(s[previous:])'), message: `Copy the rest "${s.slice(previous)}".`, l: previous, r: s.length - 1, pointer: spaces.length, built: built(), spaces })
  const result = built()
  frames.push({ phase: 'done', activeLine: L('return parts.join'), pythonLine: P('return " ".join'), message: `Result: "${result}".`, l: -1, r: -1, pointer: spaces.length, built: result, spaces })
  return { input: { s, spaces }, result, frames }
}
