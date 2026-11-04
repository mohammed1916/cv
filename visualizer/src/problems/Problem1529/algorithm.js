export const phases = [
  { id: 'start', label: 'All zeros', description: 'Start from a string of zeros; the state holds the value the current position has right now.' },
  { id: 'flip', label: 'Flip the suffix', description: 'The target differs from the current state, so a flip must start at this position.' },
  { id: 'match', label: 'Already matches', description: 'The target equals the current state here, so no flip is needed.' },
  { id: 'done', label: 'Count', description: 'The number of flips placed is the minimum.' },
]

export function parseInput(text) {
  const target = JSON.parse(text)
  if (typeof target !== 'string' || !/^[01]{1,12}$/.test(target)) throw new Error('Enter a JSON string of 1 to 12 binary digits, such as "011001".')
  return target
}

export const code = [
  "function minSuffixFlips(target) {",
  "  let state = '0'",
  "  let flips = 0",
  "  for (const bit of target) {",
  "    if (bit !== state) {",
  "      flips += 1",
  "      state = bit }",
  "  } return flips }",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def min_suffix_flips(target):
    state = '0'
    flips = 0
    for bit in target:
        if bit != state:
            flips += 1
            state = bit
    return flips
`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (pseudo, py) => ({ activeLine: L(pseudo), pythonLine: P(py) })

export function buildTrace(target) {
  const frames = []
  let state = '0'
  let flips = 0
  const snap = (index, flipped) => ({ target, index, state, flips, flipped })
  frames.push({ phase: 'start', ...at("state = '0'", "state = '0'"), message: `Everything starts as 0. The target is ${target}. Read it left to right; each change in value needs a flip that covers the rest of the string.`, snapshot: snap(null, false) })
  for (let i = 0; i < target.length; i++) {
    const bit = target[i]
    if (bit !== state) {
      flips += 1
      state = bit
      frames.push({ phase: 'flip', ...at('flips += 1', 'flips += 1'), message: `Position ${i} needs ${bit} but holds ${bit === '1' ? '0' : '1'}. Flip the suffix starting here; flips so far: ${flips}.`, snapshot: snap(i, true) })
    } else {
      frames.push({ phase: 'match', ...at('if (bit !== state)', 'if bit != state'), message: `Position ${i} already holds ${bit} after the earlier flips, so no flip is needed.`, snapshot: snap(i, false) })
    }
  }
  frames.push({ phase: 'done', ...at('return flips', 'return flips'), message: `Return ${flips}, the number of suffix flips.`, snapshot: snap(null, false) })
  return { input: target, result: flips, frames }
}
