export const phases = [
  { id: 'start', label: 'Start', description: 'Begin at the right end, because a # reaches back two characters.' },
  { id: 'hash', label: 'Two-digit group', description: 'A # closes a group of two digits such as 10# to 26#; read the two digits before it.' },
  { id: 'single', label: 'Single digit', description: 'Any other digit maps to one letter from a to i.' },
  { id: 'done', label: 'Complete', description: 'The letters were collected from right to left, so reverse them.' },
]

export const examples = [
  { label: 'Mixed groups', input: '{"s":"10#11#12"}' },
  { label: 'All singles', input: '{"s":"1326#"}' },
  { label: 'Full alphabet', input: '{"s":"12345678910#11#12#13#14#15#16#17#18#19#20#21#22#23#24#25#26#"}' },
]

export function parseInput(text) {
  const s = text.trim().startsWith('{') ? JSON.parse(text).s : text
  if (typeof s !== 'string' || s.length < 1 || s.length > 60) throw new Error('Use a string s of 1 to 60 characters, or an object such as {"s":"10#11#12"}.')
  if (!/^[0-9#]+$/.test(s)) throw new Error('Use only digits and # in s.')
  let i = s.length - 1
  while (i >= 0) {
    if (s[i] === '#') {
      const pair = Number(s.slice(i - 2, i))
      if (i < 2 || !/^\d\d$/.test(s.slice(i - 2, i)) || pair < 10 || pair > 26) throw new Error('A # must follow two digits: a group from 10 to 26 followed by #.')
      i -= 3
    } else {
      if (s[i] === '0') throw new Error('A single digit must be from 1 to 9; 0 is only valid inside 10 to 26 followed by #.')
      i -= 1
    }
  }
  return s
}

export function buildTrace(s) {
  const letters = []
  let i = s.length - 1
  const snap = (index, group) => ({ s, index, group, letters: [...letters] })
  const frames = [{ phase: 'start', activeLine: L('const letters = []'), pythonLine: P('i = len(s) - 1'), snapshot: snap(i, null),
    message: `Read ${JSON.stringify(s)} from right to left, collecting letters as we go.` }]
  while (i >= 0) {
    if (s[i] === '#') {
      const code = Number(s.slice(i - 2, i))
      const letter = String.fromCharCode(96 + code)
      letters.push(letter)
      frames.push({ phase: 'hash', activeLine: L("if (s[i] === '#')"), pythonLine: P("if s[i] == '#'"), snapshot: snap(i, { from: i - 2, to: i - 1, hash: i }),
        message: `The # at ${i} closes the group ${s.slice(i - 2, i)}, which means ${letter}.` })
      i -= 3
    } else {
      const letter = String.fromCharCode(96 + Number(s[i]))
      letters.push(letter)
      frames.push({ phase: 'single', activeLine: L('} else {'), pythonLine: P('chr(96 + int(s[i]))'), snapshot: snap(i, { from: i, to: i }),
        message: `The digit ${s[i]} at ${i} maps to ${letter}.` })
      i -= 1
    }
  }
  const result = letters.reverse().join('')
  frames.push({ phase: 'done', activeLine: L('return letters.reverse()'), pythonLine: P('return'), snapshot: snap(null, null),
    message: `Reverse the collected letters to get "${result}".`, result })
  return { input: s, result, frames }
}

export const code = `function freqAlphabets(s) {
  const letters = []
  let i = s.length - 1
  while (i >= 0) {
    if (s[i] === '#') {
      letters.push(String.fromCharCode(96 + Number(s.slice(i - 2, i))))
      i -= 3
    } else { letters.push(String.fromCharCode(96 + Number(s[i]))); i -= 1 }
  }
  return letters.reverse().join('')
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def freq_alphabets(s):
    letters = []
    i = len(s) - 1
    while i >= 0:
        if s[i] == '#':
            code = int(s[i - 2:i])
            letters.append(chr(96 + code))
            i -= 3
        else:
            letters.append(chr(96 + int(s[i])))
            i -= 1
    return ''.join(reversed(letters))
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
