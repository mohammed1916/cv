export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || typeof obj.str1 !== 'string' || typeof obj.str2 !== 'string') throw new Error('Use an object with string keys str1 and str2.')
  const { str1, str2 } = obj
  if (str1.length < 1 || str1.length > 20 || str2.length < 1 || str2.length > 20) throw new Error('Each string has 1 to 20 letters.')
  if (!/^[a-z]+$/.test(str1) || !/^[a-z]+$/.test(str2)) throw new Error('Use lowercase letters only.')
  return { str1, str2 }
}

const nextLetter = c => String.fromCharCode(((c.charCodeAt(0) - 97 + 1) % 26) + 97)

export function buildTrace(input) {
  const { str1, str2 } = input
  const frames = [{ phase: 'start', activeLine: L('set j to 0'), i: -1, j: 0, message: `Try to match str2 = "${str2}" inside str1 = "${str1}", allowing one cyclic step per letter.` }]
  let j = 0
  for (let i = 0; i < str1.length; i++) {
    const c = str1[i]
    frames.push({ phase: 'scan', activeLine: L('for each character'), i, j, message: `Look at ${c}; it can become ${c} or ${nextLetter(c)}.` })
    if (j < str2.length && (c === str2[j] || nextLetter(c) === str2[j])) {
      j++
      frames.push({ phase: 'match', activeLine: L('move j forward'), i, j, message: `Use this letter for str2[${j - 1}] = ${str2[j - 1]}.` })
    }
  }
  const result = j === str2.length
  frames.push({ phase: 'done', activeLine: L('return true'), i: str1.length, j, message: result ? 'All letters of str2 were matched in order.' : `Only ${j} letters of str2 could be matched.` })
  return { input, result, frames }
}

export const code = `make str2 a subsequence after cyclic increments
  set j to 0
  for each character c of str1 do
    if j is less than the length of str2 and c or the letter after c equals str2[j] then
      move j forward by one
  return true if j equals the length of str2 otherwise false`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def can_make_subsequence(str1, str2):
    j = 0
    for c in str1:
        if j < len(str2) and (c == str2[j] or chr((ord(c) - 97 + 1) % 26 + 97) == str2[j]):
            j += 1
    return j == len(str2)
`
