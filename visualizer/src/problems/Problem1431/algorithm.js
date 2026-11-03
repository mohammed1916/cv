export const phases = [
  { id: 'start', label: 'Start', description: 'Set the extra candies aside and find the current greatest count.' },
  { id: 'maximum', label: 'Find maximum', description: 'Scan the counts once to find the largest number of candies any child already holds.' },
  { id: 'test', label: 'Test child', description: 'Add the extra candies to this child in imagination and compare the total with the maximum.' },
  { id: 'done', label: 'Complete', description: 'Every child has been tested, and the flags list is returned in the original order.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"candies": [2, 3, 5], "extraCandies": 2}.')
  const { candies, extraCandies } = input
  if (!Array.isArray(candies) || candies.length < 2 || candies.length > 20 || !candies.every(v => Number.isInteger(v) && v >= 0 && v <= 100)) throw new Error('candies is a list of 2 to 20 integers from 0 to 100.')
  if (!Number.isInteger(extraCandies) || extraCandies < 0 || extraCandies > 100) throw new Error('extraCandies is an integer from 0 to 100.')
  return { candies, extraCandies }
}

export function buildTrace({ candies, extraCandies }) {
  const best = Math.max(...candies)
  const flags = []
  const snap = (current, extra = {}) => ({ current, best, extra: extraCandies, flags: [...flags], ...extra })
  const frames = [{ phase: 'start', activeLine: L('kids with greatest'), pythonLine: P('def kids_with_candies'), snapshot: snap(null), message: `Each child may receive the ${extraCandies} extra candies in turn.` }]
  frames.push({ phase: 'maximum', activeLine: L('best = largest'), pythonLine: P('best = max'), snapshot: snap(null), message: `The largest original count is ${best}.` })
  candies.forEach((count, i) => {
    const total = count + extraCandies
    const ok = total >= best
    flags.push(ok)
    frames.push({ phase: 'test', activeLine: L('append'), pythonLine: P('count + extra >= best'), snapshot: snap(i, { count, total, ok }), message: `Child ${i} has ${count} + ${extraCandies} = ${total}, which is ${ok ? 'at least' : 'below'} ${best}, so the flag is ${ok}.` })
  })
  const result = [...flags]
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: P('return'), snapshot: snap(null, { result }), message: `Flags: ${result.join(', ')}.` })
  return { input: { candies, extraCandies }, result, frames }
}

export const code = `kids with greatest (candies, extra):
  best = largest value in candies
  answer = empty list
  for each count in candies:
    append (count + extra >= best) to answer
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def kids_with_candies(candies, extra):
    best = max(candies)
    return [count + extra >= best for count in candies]
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
