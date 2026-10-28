export function parseInput(text) {
  const input = JSON.parse(text)
  const { score, k } = input ?? {}
  if (!Array.isArray(score) || score.length < 1 || score.length > 8 || !Array.isArray(score[0])) throw new Error('score is a table of 1 to 8 students.')
  const width = score[0].length
  if (width < 1 || width > 5) throw new Error('Each student has 1 to 5 exam scores.')
  if (score.some(row => !Array.isArray(row) || row.length !== width || row.some(v => !Number.isInteger(v) || v < 0 || v > 100))) throw new Error('Every row needs the same number of integer scores from 0 to 100.')
  for (let j = 0; j < width; j++) {
    const column = score.map(row => row[j])
    if (new Set(column).size !== column.length) throw new Error('Scores in each exam column must be distinct.')
  }
  if (!Number.isInteger(k) || k < 0 || k >= width) throw new Error('k is an exam column index from 0 to the number of exams minus 1.')
  return { score, k }
}

export function buildTrace(input) {
  const working = input.score.map((row, index) => ({ row, index }))
  const result = []
  const taken = []
  const frames = [{ phase: 'start', activeLine: L('set result to an empty list'), picked: null, taken: [], result: [], message: `Sort students by exam ${input.k} score, highest first.` }]
  while (working.length > 0) {
    let best = 0
    for (let i = 1; i < working.length; i++) if (working[i].row[input.k] > working[best].row[input.k]) best = i
    frames.push({ phase: 'find', activeLine: L('find the row with the largest'), picked: working[best].index, taken: [...taken], result: [...result], message: `Student ${working[best].index} has the best remaining score in exam ${input.k}: ${working[best].row[input.k]}.` })
    const [student] = working.splice(best, 1)
    result.push(student.row)
    taken.push(student.index)
    frames.push({ phase: 'take', activeLine: L('move that row'), picked: student.index, taken: [...taken], result: result.map(r => [...r]), message: `Student ${student.index} moves to the next position in the result.` })
  }
  frames.push({ phase: 'done', activeLine: L('return result'), picked: null, taken: [...taken], result: result.map(r => [...r]), message: 'Every student is placed from highest to lowest kth score.' })
  return { input, result, frames }
}

export const code = `sort the students by their kth score, highest first
  set result to an empty list
  pair each student row with its index in a working list
  repeat while the working list is not empty
    find the row with the largest score in column k
    move that row from the working list to the end of result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sort_students(score, k):
    working = [list(row) for row in score]
    result = []
    while working:
        best = 0
        for i in range(1, len(working)):
            if working[i][k] > working[best][k]:
                best = i
        result.append(working.pop(best))
    return result
`
