export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with the column number and an empty title.' },
  { id: 'shift', label: 'Shift to zero', description: 'Subtract one so that A counts as 0 and Z as 25 before taking the remainder.' },
  { id: 'letter', label: 'Write letter', description: 'The remainder after dividing by 26 picks the letter for the rightmost open position.' },
  { id: 'divide', label: 'Divide', description: 'Divide by 26 to move one position to the left.' },
  { id: 'done', label: 'Result', description: 'Every letter has been placed, so the title is complete.' },
]

export function parseInput(text) {
  const value = Number(String(text).trim())
  if (!Number.isInteger(value) || value < 1 || value > 2147483647) throw new Error('Enter one whole number from 1 to 2147483647.')
  return value
}

// Each phase points at one line of the code and one line of the Python.
const LINE = {
  start: [2, 2], shift: [4, 4], letter: [6, 5], divide: [7, 6], done: [8, 7],
}
const at = phase => ({ activeLine: LINE[phase][0], pythonLine: LINE[phase][1] })

export function buildTrace(number) {
  const frames = []
  let work = number
  let title = ''
  const snap = (digit = null) => ({ work, title, digit })
  frames.push({ phase: 'start', ...at('start'), snapshot: snap(), message: `Column ${number}. Peel off the rightmost letter each time and prepend it to the title.` })
  while (work > 0) {
    work -= 1
    frames.push({ phase: 'shift', ...at('shift'), snapshot: snap(), message: `Subtract one. Now the value is ${work}, so A is 0, B is 1 and Z is 25.` })
    const digit = work % 26
    const letter = String.fromCharCode(65 + digit)
    title = letter + title
    frames.push({ phase: 'letter', ...at('letter'), snapshot: snap(digit), message: `${work} mod 26 = ${digit}, which is ${letter}. The title so far is ${title}.` })
    work = Math.floor(work / 26)
    frames.push({ phase: 'divide', ...at('divide'), snapshot: snap(), message: `Divide by 26. ${work === 0 ? 'Nothing is left, so the loop stops.' : `${work} is what the letters to the left must encode.`}` })
  }
  frames.push({ phase: 'done', ...at('done'), snapshot: snap(), message: `The title for ${number} is ${title}.` })
  return { input: number, result: title, frames }
}

const codeText = `column title (n):
  title = ""
  while n > 0:
    n = n - 1
    letter = the letter for n mod 26
    title = letter + title
    n = n div 26
  return title`
export const code = codeText.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def convert_to_title(column_number):
    letters = []
    while column_number > 0:
        column_number -= 1
        letters.append(chr(ord("A") + column_number % 26))
        column_number //= 26
    return "".join(reversed(letters))
`
