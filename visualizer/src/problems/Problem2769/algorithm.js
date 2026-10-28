export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with num and t.')
  const { num, t } = input
  if (!Number.isInteger(num) || num < 1 || num > 50) throw new Error('num must be an integer from 1 to 50.')
  if (!Number.isInteger(t) || t < 1 || t > 50) throw new Error('t must be an integer from 1 to 50.')
  return { num, t }
}

export function buildTrace({ num, t }) {
  let answer = num
  const frames = [{ phase: 'start', activeLine: L('set the answer to num'), ops: 0, answer, message: `Start with num = ${num} and no operations used.` }]
  for (let op = 1; op <= t; op++) {
    answer += 2
    frames.push({ phase: 'step', activeLine: L('add 2 to the answer'), ops: op, answer, message: `Operation ${op}: lower x by 1 and raise num by 1, so the largest reachable x rises by 2 to ${answer}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the answer'), ops: t, answer, message: `The largest achievable number is ${answer}.` })
  return { input: { num, t }, result: answer, frames }
}

export const code = `find the largest achievable number after at most t operations
read num and t from the input
set the answer to num
for each operation from 1 to t do
  add 2 to the answer, by lowering x by 1 and raising num by 1
return the answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_achievable(num, t):
    answer = num
    for _ in range(t):
        answer += 2
    return answer
`
