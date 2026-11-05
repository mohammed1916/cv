export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 50000 || !/^[01]+$/.test(s)) throw new Error('Enter a JSON string of 1–50,000 characters, each 0 or 1.')
  return s
}

// Group equal characters into runs. Each pair of neighbouring runs, of lengths a and b, supplies min(a, b)
// valid substrings: the shorter run can be matched with the same number of characters from the other run.
export function buildTrace(s) {
  const runs = []
  const runChars = []
  let i = 0
  while (i < s.length) {
    let j = i
    while (j < s.length && s[j] === s[i]) j++
    runs.push(j - i)
    runChars.push(s[i])
    i = j
  }
  let total = 0
  const frames = [{ phase: 'start', runs: [...runs], index: null, total, activeLine: L('const runs = []'), pythonLine: P('groups = []'), message: `Split ${s} into runs of equal characters.` }]
  for (let k = 1; k < runs.length; k++) {
    const add = Math.min(runs[k - 1], runs[k])
    total += add
    frames.push({ phase: 'pair', runs: [...runs], index: k, add, total, activeLine: L('total += Math.min'), pythonLine: P('total += min('), message: `Runs ${runChars[k - 1]}×${runs[k - 1]} and ${runChars[k]}×${runs[k]} give min = ${add} substrings.` })
  }
  frames.push({ phase: 'done', runs: [...runs], index: null, total, result: total, activeLine: L('return total'), pythonLine: P('return total'), message: `Total valid substrings: ${total}.` })
  return { input: s, result: total, runChars, frames }
}

const SOURCE = `function countBinarySubstrings(s) {
  const runs = []
  let i = 0
  while (i < s.length) {
    let j = i
    while (j < s.length && s[j] === s[i]) j++
    runs.push(j - i)
    i = j
  }
  let total = 0
  for (let k = 1; k < runs.length; k++) {
    total += Math.min(runs[k - 1], runs[k])
  }
  return total
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_binary_substrings(s):
    groups = []
    i = 0
    while i < len(s):
        j = i
        while j < len(s) and s[j] == s[i]:
            j += 1
        groups.append(j - i)
        i = j
    total = 0
    for k in range(1, len(groups)):
        total += min(groups[k - 1], groups[k])
    return total`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
