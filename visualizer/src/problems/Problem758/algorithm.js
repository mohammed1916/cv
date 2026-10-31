export function parseInput(text) {
  const spec = JSON.parse(text)
  if (!Array.isArray(spec.words) || spec.words.length < 1 || spec.words.length > 10 || spec.words.some(w => typeof w !== 'string' || !/^[a-z]{1,10}$/.test(w))) {
    throw new Error('Use 1 to 10 words of 1 to 10 lowercase letters.')
  }
  if (typeof spec.s !== 'string' || !/^[a-z]{1,50}$/.test(spec.s)) throw new Error('s is 1 to 50 lowercase letters.')
  return spec
}

// Wrap each run of bold letters once, so overlapping and adjacent occurrences share one tag pair.
function render(s, bold) {
  let out = ''
  for (let i = 0; i < s.length; i++) {
    if (bold[i] && (i === 0 || !bold[i - 1])) out += '<b>'
    out += s[i]
    if (bold[i] && (i === s.length - 1 || !bold[i + 1])) out += '</b>'
  }
  return out
}

export function buildTrace(spec) {
  const { s, words } = spec
  const bold = Array(s.length).fill(false)
  const frames = [{ phase: 'start', activeLine: L('bold = list of False'), pythonLine: 2, at: null, word: null, bold: [...bold], result: null, message: 'Find every occurrence of every word and bold its letters.' }]
  for (const word of words) {
    for (let i = 0; i + word.length <= s.length; i++) {
      if (!s.startsWith(word, i)) continue
      for (let k = i; k < i + word.length; k++) bold[k] = true
      frames.push({ phase: 'match', activeLine: L('mark letter k'), pythonLine: 7, at: i, word, bold: [...bold], result: null, message: `"${word}" occurs at index ${i}: its letters become bold.` })
    }
  }
  const result = render(s, bold)
  frames.push({ phase: 'done', activeLine: L('return out'), pythonLine: 15, at: null, word: null, bold: [...bold], result, message: `Result: ${result}` })
  return { input: spec, s, result, bold, frames }
}

export const code = `function addBoldTag(words, s):
  bold = list of False, one per letter of s
  for each word in words:
    for each start index i where word fits in s:
      if s has word at index i then
        for k from i to i + length of word - 1:
          mark letter k of s as bold
  out = empty string
  for each index i with letter ch in s:
    if bold[i] and (i is the first letter or bold[i-1] is false) then append "<b>" to out
    append ch to out
    if bold[i] and (i is the last letter or bold[i+1] is false) then append "</b>" to out
  return out`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def add_bold_tag(words, s):
    bold = [False] * len(s)
    for word in words:
        for i in range(len(s) - len(word) + 1):
            if s.startswith(word, i):
                for k in range(i, i + len(word)):
                    bold[k] = True
    out = ''
    for i, ch in enumerate(s):
        if bold[i] and (i == 0 or not bold[i - 1]):
            out += '<b>'
        out += ch
        if bold[i] and (i == len(s) - 1 or not bold[i + 1]):
            out += '</b>'
    return out`
