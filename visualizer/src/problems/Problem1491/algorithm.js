export const phases = [
  { id: 'start', label: 'Start', description: 'Start the running minimum and maximum from the first salary.' },
  { id: 'scan', label: 'Scan salaries', description: 'Add each salary to the total and update the running extremes.' },
  { id: 'done', label: 'Complete', description: 'Remove one minimum and one maximum, then average the rest.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"salary": [4000, 3000, 1000, 2000]}.')
  const { salary } = input
  if (!Array.isArray(salary) || salary.length < 3 || salary.length > 100 || !salary.every(v => Number.isInteger(v) && v >= 1000 && v <= 1000000)) throw new Error('salary is a list of 3 to 100 integers from 1000 to 1000000.')
  return { salary }
}

export function buildTrace({ salary }) {
  const at = n => ({ activeLine: n, pythonLine: n })
  let lowest = salary[0]
  let highest = salary[0]
  let total = 0
  const snap = (index, value) => ({ index, value, lowest, highest, total, count: salary.length })
  const frames = [{ phase: 'start', ...at(2), snapshot: snap(null, null), message: `Start with lowest and highest at ${salary[0]}. The total is 0.` }]
  salary.forEach((value, index) => {
    total += value
    lowest = Math.min(lowest, value)
    highest = Math.max(highest, value)
    frames.push({ phase: 'scan', ...at(5), snapshot: snap(index, value), message: `Add ${value}. Running minimum ${lowest}, maximum ${highest}, total ${total}.` })
  })
  const result = (total - lowest - highest) / (salary.length - 2)
  frames.push({ phase: 'done', ...at(6), snapshot: snap(null, null), message: `Remove one ${lowest} and one ${highest}. (${total} - ${lowest} - ${highest}) / ${salary.length - 2} = ${result}.` })
  return { input: { salary }, result, frames }
}

const pseudo = [
  'average excluding extremes(salary):',
  '  lowest = highest = salary[0]',
  '  total = 0',
  '  for each amount s in salary:',
  '    total += s; lowest = min(lowest, s); highest = max(highest, s)',
  '  return (total - lowest - highest) / (count - 2)',
]

const pythonLines = [
  'def average(salary):',
  '    lowest = highest = salary[0]',
  '    total = 0',
  '    for s in salary:',
  '        total += s; lowest = min(lowest, s); highest = max(highest, s)',
  '    return (total - lowest - highest) / (len(salary) - 2)',
]

export const code = pseudo.map((text, index) => ({ line: index + 1, text }))
export const python = pythonLines.join('\n')
