export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with candies and numPeople.')
  const { candies, numPeople } = data
  if (!Number.isInteger(candies) || candies < 1 || candies > 100) throw new Error('candies is an integer from 1 to 100.')
  if (!Number.isInteger(numPeople) || numPeople < 1 || numPeople > 10) throw new Error('numPeople is an integer from 1 to 10.')
  return { candies, numPeople }
}

export function buildTrace(input) {
  const { candies, numPeople } = input
  const totals = Array(numPeople).fill(0)
  let left = candies
  let give = 1
  let person = 0
  const frames = [{ phase: 'start', activeLine: L('set every person'), person: -1, totals: [...totals], left, message: `${candies} candies and ${numPeople} people. The first gift is 1.` }]
  while (left > 0) {
    const amount = Math.min(give, left)
    totals[person] += amount
    left -= amount
    frames.push({ phase: 'give', activeLine: L('give the smaller'), person, totals: [...totals], left, message: `Give ${amount} to person ${person}. ${left} candies remain.` })
    give += 1
    person = (person + 1) % numPeople
  }
  frames.push({ phase: 'done', activeLine: L('return the totals'), person: -1, totals: [...totals], left, message: `Final totals: ${totals.join(', ')}.` })
  return { input, result: totals, frames }
}

export const code = `distribute the candies
  set every person's total to 0, the next gift to 1, and the person to 0
  while candies remain
    give the smaller of the next gift and the candies left to the current person
    subtract that from the candies left, and add 1 to the next gift
    move to the next person in the circle
  return the totals`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def distribute_candies(candies, numPeople):
    result = [0] * numPeople
    give = 1
    person = 0
    while candies > 0:
        amount = min(give, candies)
        result[person] += amount
        candies -= amount
        give += 1
        person = (person + 1) % numPeople
    return result
`
