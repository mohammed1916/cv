export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with num and k.')
  const { num, k } = input
  if (!Number.isInteger(num) || num < 0 || num > 3000) throw new Error('num must be an integer from 0 to 3000.')
  if (!Number.isInteger(k) || k < 0 || k > 9) throw new Error('k must be an integer from 0 to 9.')
  return { num, k }
}

export function buildTrace({ num, k }) {
  const frames = [{ phase: 'start', activeLine: L('if num is 0'), count: 0, answer: -1, message: `Find the fewest numbers that end in ${k} and add up to ${num}.` }]
  if (num === 0) {
    frames.push({ phase: 'done', activeLine: L('return the answer'), count: 0, answer: 0, message: 'Zero needs no numbers, so the answer is 0.' })
    return { input: { num, k }, result: 0, frames }
  }
  let answer = -1
  for (let count = 1; count <= 10 && answer === -1; count++) {
    const fits = count * k <= num && (count * k) % 10 === num % 10
    frames.push({ phase: 'try', activeLine: L('if count times k'), count, answer, message: `${count} numbers ending in ${k} have a units digit of ${(count * k) % 10} and a sum of at least ${count * k}; ${fits ? 'this matches num.' : 'this does not match num.'}` })
    if (fits) answer = count
  }
  frames.push({ phase: 'done', activeLine: L('return the answer'), count: Math.max(answer, 0), answer, message: answer === -1 ? 'No count works, so the answer is -1.' : `The fewest numbers is ${answer}.` })
  return { input: { num, k }, result: answer, frames }
}

export const code = `fewest numbers ending in k that add up to num
if num is 0 then return 0
set the answer to -1
for each count from 1 to 10 do
  if count times k ends in the same digit as num and count times k is at most num then
    set the answer to count and stop
return the answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_numbers(num, k):
    if num == 0:
        return 0
    for count in range(1, 11):
        if count * k % 10 == num % 10 and count * k <= num:
            return count
    return -1
`
