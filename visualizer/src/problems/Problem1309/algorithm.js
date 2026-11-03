export const phases = [
  { id: 'scan', label: 'Scan from right', description: 'Start at the last character. Reading right to left keeps the two-digit groups unambiguous.' },
  { id: 'single', label: 'Single digit', description: 'A digit that is not followed by a # stands alone and maps to one letter, 1 to 9.' },
  { id: 'pair', label: 'Two-digit group', description: 'A # closes the two digits just before it. Those two digits, 10 to 26, map to one letter.' },
  { id: 'done', label: 'Complete', description: 'Reverse the letters collected while scanning from the right.' },
]

function decode(s) {
  let i = s.length - 1
  const out = []
  const frames = []
  while (i >= 0) {
    if (s[i] === '#') {
      if (i < 2) throw new Error('A # needs two digits before it.')
      const code = Number(s.slice(i - 2, i))
      if (code < 10 || code > 26) throw new Error(`The group ${s.slice(i - 2, i)}# must be a number from 10 to 26.`)
      out.push(String.fromCharCode(96 + code))
      frames.push({ phase: 'pair', at: i, end: i - 2, letter: out.at(-1) })
      i -= 3
    } else {
      const code = Number(s[i])
      if (code < 1) throw new Error('A single digit must be from 1 to 9.')
      out.push(String.fromCharCode(96 + code))
      frames.push({ phase: 'single', at: i, end: i, letter: out.at(-1) })
      i -= 1
    }
  }
  return { letters: out.reverse(), steps: frames }
}

export function parseInput(text) {
  const s = text.trim()
  if (!/^[0-9#]{1,60}$/.test(s)) throw new Error('Use only digits and # characters, up to 60 of them.')
  decode(s)
  return s
}

export function buildTrace(s) {
  const frames = []
  const { letters, steps } = decode(s)
  const collected = []
  frames.push({ phase: 'scan', activeLine: L('i = last index'), pythonLine: P('i = len(s) - 1'), snapshot: { s, at: s.length - 1, letters: [], group: null },
    message: `Start at position ${s.length - 1}, the last character, and move left.` })
  for (const step of steps) {
    collected.push(step.letter)
    const pair = step.phase === 'pair'
    const text = pair
      ? `${s.slice(step.end, step.at)}# is a two-digit group, so it becomes ${step.letter}.`
      : `${s[step.at]} stands alone and becomes ${step.letter}.`
    frames.push({ phase: step.phase, activeLine: pair ? L('out.append(letter number') : L('out.append(letter for'),
      pythonLine: pair ? P('int(s[i-2:i])') : P('int(s[i]) - 1'), snapshot: { s, at: step.at, letters: [...collected], group: [step.end, step.at] },
      message: text + ' Next position: ' + (step.end - 1) + '.' })
  }
  frames.push({ phase: 'done', activeLine: L('return reversed'), pythonLine: P("return ''.join"), snapshot: { s, at: -1, letters, group: null },
    message: `Reverse the collected letters to read the answer: ${letters.join('')}.` })
  return { input: s, result: letters.join(''), frames }
}

export const code = `decode the digit string s:
  i = last index of s
  out = empty list
  while i >= 0:
    if s[i] == '#':
      take the two digits before it: s[i-2..i-1]
      out.append(letter number 10..26)
      i = i - 3
    else:
      out.append(letter for the single digit s[i])
      i = i - 1
  return reversed(out)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def freqalphabets(s):
    out = []
    i = len(s) - 1
    while i >= 0:
        if s[i] == '#':
            out.append(chr(ord('a') + int(s[i-2:i]) - 1))
            i -= 3
        else:
            out.append(chr(ord('a') + int(s[i]) - 1))
            i -= 1
    return ''.join(reversed(out))`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
