export const phases = [
  { id: 'start', label: 'Start', description: 'No ones have been read yet, so the current block of ones has length 0.' },
  { id: 'scan', label: 'Read character', description: 'Look at the next character of the string.' },
  { id: 'extend', label: 'Extend block', description: 'A 1 lengthens the current block; that many substrings end at this position.' },
  { id: 'add', label: 'Add substrings', description: 'Add the number of all-ones substrings that end here to the running total.' },
  { id: 'reset', label: 'Break block', description: 'A 0 breaks every substring that would cross it, so the block length restarts at 0.' },
  { id: 'done', label: 'Complete', description: 'Return the total modulo 1000000007.' },
]

export function parseInput(text) {
  const s = text.trim()
  if (!/^[01]{1,200}$/.test(s)) throw new Error('Enter a string of 1 to 200 characters, each 0 or 1.')
  return { s }
}

export const code = [
  "function countOnesSubstrings(s) {",
  "  let total = 0",
  "  let run = 0",
  "  for (const c of s) {",
  "    if (c === '1') {",
  "      run += 1",
  "      total = (total + run) % 1000000007",
  "    } else {",
  "      run = 0 }",
  "  } return total }",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def num_sub(s):
    MOD = 10**9 + 7
    total = 0
    run = 0
    for ch in s:
        if ch == '1':
            run += 1
            total = (total + run) % MOD
        else:
            run = 0
    return total
`

const PS = { start: 2, scan: 4, extend: 6, add: 7, reset: 9, done: 10 }
const PY = { start: 3, scan: 5, extend: 7, add: 8, reset: 10, done: 11 }

export function buildTrace({ s }) {
  const MOD = 1000000007
  let total = 0
  let run = 0
  const frame = (phase, index, char, message) => ({ phase, activeLine: PS[phase], pythonLine: PY[phase], snapshot: { index, char, run, total }, message })
  const frames = [frame('start', null, null, 'No ones are counted yet. The current block of ones starts at length 0.')]
  for (let index = 0; index < s.length; index++) {
    const char = s[index]
    frames.push(frame('scan', index, char, `Read position ${index}: "${char}".`))
    if (char === '1') {
      run += 1
      frames.push(frame('extend', index, char, `The block of ones now has length ${run}, so ${run} substrings end at position ${index}.`))
      total = (total + run) % MOD
      frames.push(frame('add', index, char, `Add ${run}. Running total: ${total}.`))
    } else {
      run = 0
      frames.push(frame('reset', index, char, 'A 0 ends the block, so the block length restarts at 0.'))
    }
  }
  frames.push(frame('done', null, null, `Total: ${total}.`))
  return { input: { s }, result: total, frames }
}
