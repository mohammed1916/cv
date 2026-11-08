// Independently written teaching model. The sample strings are invented for this visualizer.
export const phases = [
  { id: 'start', label: 'Scan', description: 'Read the two strings position by position.' },
  { id: 'inspect', label: 'Classify', description: 'Each mismatch is either x over y or y over x; matches are ignored.' },
  { id: 'update', label: 'Pair', description: 'Same-direction mismatches pair up, one swap per pair; leftovers cost two swaps.' },
  { id: 'done', label: 'Result', description: 'Report the fewest swaps, or -1 when the mismatch count is odd.' },
]

export const inputLabel = 'JSON array of two equal-length strings made of x and y (up to 40 letters each)'
export const complexity = 'O(n) time and O(1) extra space. The visualizer caps each string at 40 letters.'
export const examples = [
  { label: 'Mixed', input: '["xxyy","yyxx"]' },
  { label: 'Small', input: '["xy","yx"]' },
  { label: 'Impossible', input: '["xxy","yyx"]' },
  { label: 'Single letter pair', input: '[\"x\",\"y\"]' },
  { label: 'Equal strings', input: '[\"xy\",\"xy\"]' },
  { label: 'Largest allowed length, opposite strings', input: '[\"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\",\"yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy\"]' },
  { label: 'Long run: forty letters each', input: '[\"yxyyxxyxyxyyyyyyyxyxxxxyxxxxxyxxyyyxyxxx\",\"yxxyxxxyyxyxyxyxyxxyyyyxxxxyyyxxyyxyxyyx\"]' },
]

export const code = `function minimumSwaps(s1, s2) {
  let xy = 0
  let yx = 0
  for (let i = 0; i < s1.length; i++) {
    if (s1[i] === 'x' && s2[i] === 'y') xy += 1
    else if (s1[i] === 'y' && s2[i] === 'x') yx += 1
  }
  if ((xy + yx) % 2 === 1) return -1
  let swaps = Math.floor(xy / 2) + Math.floor(yx / 2)
  if (xy % 2 === 1) swaps += 2
  return swaps
}`

export const python = `def minimum_swaps(s1, s2):
    xy = yx = 0
    for a, b in zip(s1, s2):
        if a == 'x' and b == 'y':
            xy += 1
        elif a == 'y' and b == 'x':
            yx += 1
    if (xy + yx) % 2:
        return -1                    # the total mismatch count must be even
    swaps = xy // 2 + yx // 2
    if xy % 2:
        swaps += 2                   # one leftover of each direction costs two swaps
    return swaps`

const at = (source, key) => {
  const index = source.split('\n').findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing solution line: ${key}`)
  return index + 1
}
const CODE_LINE = key => at(code, key)
const PY_LINE = key => at(python, key)

export function parseInput(text) {
  let pair
  try { pair = JSON.parse(text) } catch { throw new Error('Enter a JSON array with two strings.') }
  if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string' || typeof pair[1] !== 'string') {
    throw new Error('Enter exactly two strings in a JSON array.')
  }
  const [a, b] = pair
  if (a.length < 1 || a.length > 40 || a.length !== b.length) throw new Error('Both strings need the same length from 1 to 40.')
  if (!/^[xy]+$/.test(a) || !/^[xy]+$/.test(b)) throw new Error('Use only the letters x and y.')
  return [a, b]
}

export function buildTrace([a, b]) {
  const frames = []
  let xy = 0
  let yx = 0
  let swaps = 0
  const push = (phase, key, pyKey, message, position = null, verdict = null) => frames.push({
    phase, activeLine: CODE_LINE(key), pythonLine: PY_LINE(pyKey), message,
    s1: a, s2: b, position, xy, yx, swaps, verdict,
  })

  push('start', 'let xy = 0', 'xy = yx = 0', `Two strings of length ${a.length}. Compare them position by position.`)
  for (let i = 0; i < a.length; i++) {
    if (a[i] === 'x' && b[i] === 'y') {
      xy += 1
      push('inspect', 'xy += 1', 'xy += 1', `Position ${i}: first string has x, second has y. This is an xy mismatch (${xy} so far).`, i, 'xy')
    } else if (a[i] === 'y' && b[i] === 'x') {
      yx += 1
      push('inspect', 'yx += 1', 'yx += 1', `Position ${i}: first string has y, second has x. This is a yx mismatch (${yx} so far).`, i, 'yx')
    } else {
      push('inspect', 'for (let i = 0', 'for a, b in zip', `Position ${i} already matches (${a[i]}), so it needs no swap.`, i, 'match')
    }
  }

  if ((xy + yx) % 2 === 1) {
    push('done', 'return -1', 'return -1', `There are ${xy + yx} mismatches. Swaps only move letters between the two strings, so the total number of x letters is fixed. Equal strings need an even total, and this total is odd, so no sequence of swaps works.`, null, 'impossible')
    return { input: [a, b], result: -1, frames }
  }

  for (let pair = 0; pair < Math.floor(xy / 2); pair++) {
    swaps += 1
    push('update', 'let swaps = Math.floor(xy / 2)', 'swaps = xy // 2', `Pair two xy mismatches with one swap. Swaps so far: ${swaps}.`, null, 'pair')
  }
  for (let pair = 0; pair < Math.floor(yx / 2); pair++) {
    swaps += 1
    push('update', 'let swaps = Math.floor(xy / 2)', 'swaps = xy // 2', `Pair two yx mismatches with one swap. Swaps so far: ${swaps}.`, null, 'pair')
  }
  if (xy % 2 === 1) {
    swaps += 2
    push('update', 'if (xy % 2 === 1) swaps += 2', 'swaps += 2', `One xy and one yx mismatch are left over. Two swaps fix them. Swaps total: ${swaps}.`, null, 'leftover')
  }

  push('done', 'return swaps', 'return swaps', `The fewest swaps is ${swaps}.`, null, 'result')
  return { input: [a, b], result: swaps, frames }
}
