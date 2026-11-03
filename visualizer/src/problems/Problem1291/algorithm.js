export const phases = [
  { id: 'start', label: 'Start', description: 'Begin with an empty answer list and the range bounds.' },
  { id: 'length', label: 'Choose length', description: 'Try every digit count that could fall inside the range, shortest first.' },
  { id: 'first', label: 'Choose first digit', description: 'Each candidate starts with a digit; its run goes start, start+1, and so on.' },
  { id: 'build', label: 'Build candidate', description: 'Assemble the candidate number from its consecutive digits.' },
  { id: 'keep', label: 'Keep', description: 'A candidate inside the range is appended. Lengths and starts ascend, so the list stays sorted.' },
  { id: 'skip', label: 'Outside range', description: 'The candidate is below low or above high and is discarded.' },
  { id: 'done', label: 'Complete', description: 'Return all kept numbers.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"low": 100, "high": 300}.')
  const { low, high } = input
  if (!Number.isInteger(low) || !Number.isInteger(high) || low < 1 || high > 1000000 || low > high) throw new Error('low and high are integers with 1 <= low <= high <= 1000000.')
  return { low, high }
}

export function buildTrace({ low, high }) {
  const answer = []
  const snap = (length, start, value, verdict) => ({ low, high, length, start, value, verdict, answer: [...answer] })
  const frames = [{ phase: 'start', activeLine: L('answer = []'), pythonLine: P('answer = []'), snapshot: snap(null, null, null, null), message: `Look for numbers from ${low} to ${high} whose digits climb by one each step.` }]
  for (let length = String(low).length; length <= String(high).length; length++) {
    frames.push({ phase: 'length', activeLine: L('for length from'), pythonLine: P('for length in range'), snapshot: snap(length, null, null, null), message: `Consider ${length}-digit candidates.` })
    for (let start = 1; start <= 10 - length; start++) {
      frames.push({ phase: 'first', activeLine: L('for start from'), pythonLine: P('for start in range'), snapshot: snap(length, start, null, null), message: `Start with digit ${start}; the digits run ${start} through ${start + length - 1}.` })
      let value = 0
      for (let k = 0; k < length; k++) value = value * 10 + start + k
      frames.push({ phase: 'build', activeLine: L('build the number'), pythonLine: P('value = value * 10'), snapshot: snap(length, start, value, null), message: `Assembled candidate ${value}.` })
      if (value >= low && value <= high) {
        answer.push(value)
        frames.push({ phase: 'keep', activeLine: L('append value'), pythonLine: P('answer.append'), snapshot: snap(length, start, value, 'in'), message: `${value} lies inside [${low}, ${high}], so it is kept.` })
      } else {
        frames.push({ phase: 'skip', activeLine: L('append value'), pythonLine: P('if low <= value'), snapshot: snap(length, start, value, value < low ? 'low' : 'high'), message: `${value} is ${value < low ? 'below' : 'above'} the range, so it is skipped.` })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: P('return answer'), snapshot: snap(null, null, null, null), message: `Return ${answer.length} number(s): ${answer.join(', ') || 'none'}.` })
  return { input: { low, high }, result: answer, frames }
}

export const code = `find sequential-digit numbers in [low, high]:
  answer = []
  for length from the digit count of low to the digit count of high:
    for start from 1 to 10 - length:
      build the number whose digits are start, start+1, ... of that length
      if low <= value <= high:
        append value to answer
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sequential_digits(low, high):
    answer = []
    for length in range(len(str(low)), len(str(high)) + 1):
        for start in range(1, 10 - length + 1):
            value = 0
            for k in range(length):
                value = value * 10 + start + k
            if low <= value <= high:
                answer.append(value)
    return answer
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
